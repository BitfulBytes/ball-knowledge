import { Prisma, PrismaClient } from '@prisma/client';
import axios from 'axios';
import cheerio from 'cheerio';

import { BASE_WIKIPEDIA_URL, mapWikipediaFieldToKey } from './constants';
import {
  CareerSpell,
  PlayingLevels,
  WikipediaPlayerDetailsFields,
} from './types';
import { isNumeric } from './utils';

const prisma = new PrismaClient();

// Maps clubName-clubLink key to database id
const scrapedClubLinkList: Record<string, string> = {};

const removeParenthesisedText = (text: string) => {
  return text.replace(/[\[(].*?[\])]/g, '').trim();
};

const storeClubDetails = async (clubName: string, clubUrl?: string) => {
  try {
    const club = await prisma.club.create({
      data: {
        name: clubName,
        // Defaulting to empty string instead to allow wikipediaUrl to be used as part of a DB unique constraint
        wikipediaUrl: clubUrl ? `${BASE_WIKIPEDIA_URL}${clubUrl}` : '',
        imageUrl: null,
      },
    });

    scrapedClubLinkList[`${clubName}-${clubUrl}`.toLowerCase()] = club.id;

    return club.id;
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        console.log(
          `ℹ️ Club ${clubName} already exists in database. Skipping.`
        );
      }
    } else {
      console.error(`${clubName}-${clubUrl}`, error);
    }
  }
};

const getPlayerDetails = async (playerUrl: string) => {
  console.log(`ℹ️ Scraping player details from Wikipedia: ${playerUrl}`);

  try {
    const playerRes = await axios.get(`${BASE_WIKIPEDIA_URL}${playerUrl}`);

    const $ = cheerio.load(playerRes.data);
    const playerTable = $('table.infobox').first();

    const playerImageSrc = playerTable.find('img').attr('src');
    const playerImage = playerImageSrc ? `https:${playerImageSrc}` : null;
    // contents().first() avoids text from any nested elements i.e. spans with the OBE title
    const playerName = playerTable
      .find('.infobox-title')
      .contents()
      .first()
      .text()
      .trim();

    // Slice the image row from the table as we have already extracted the image src above
    const rawTableRows = playerTable.find('tr').toArray().slice(1);

    const playerDetails = rawTableRows.reduce(
      (playerDetails, row) => {
        const rowTitle = $(row).find('th').text().trim();
        const rowValue = $(row).find('td').text().trim();

        if (mapWikipediaFieldToKey[rowTitle as WikipediaPlayerDetailsFields]) {
          return {
            ...playerDetails,
            [mapWikipediaFieldToKey[rowTitle as WikipediaPlayerDetailsFields]]:
              removeParenthesisedText(rowValue),
          };
        }

        return playerDetails;
      },
      {} as Omit<Prisma.PlayerCreateInput, 'name' | 'wikipediaUrl' | 'imageUrl'>
    );

    if (!playerImage || !playerName) {
      console.log(`⚠️  Missing player details for ${playerName}. Skipping.`);
      return;
    }

    // We are assuming that all player info boxes contain these rows and that they are in the same order
    const youthCareerIndex = rawTableRows.indexOf(
      rawTableRows.find((row) =>
        $(row).find('th').text().includes('Youth career')
      ) as cheerio.Element
    );
    const seniorCareerIndex = rawTableRows.indexOf(
      rawTableRows.find((row) =>
        $(row).find('th').text().includes('Senior career')
      ) as cheerio.Element
    );
    const internationalCareerIndex = rawTableRows.indexOf(
      rawTableRows.find((row) =>
        $(row).find('th').text().includes('International career')
      ) as cheerio.Element
    );
    const medalRecordIndex = rawTableRows.indexOf(
      rawTableRows.find((row) =>
        $(row).find('th').text().includes('Medal record')
      ) as cheerio.Element
    );

    if (seniorCareerIndex === -1) {
      console.log(`⚠️  Missing career details for ${playerName}. Skipping.`);
      return;
    }

    const getSeniorEndIndex = () => {
      if (internationalCareerIndex !== -1) return internationalCareerIndex;
      if (medalRecordIndex !== -1) return medalRecordIndex;
      return undefined;
    };

    const youthCareerRows =
      youthCareerIndex !== -1
        ? rawTableRows.slice(youthCareerIndex + 1, seniorCareerIndex)
        : [];
    // Slice the first row as it is the header row
    const seniorCareerRows = rawTableRows.slice(
      seniorCareerIndex + 1,
      getSeniorEndIndex()
    );
    const internationalCareerRows =
      internationalCareerIndex !== -1
        ? rawTableRows.slice(
            internationalCareerIndex + 1,
            medalRecordIndex !== -1 ? medalRecordIndex : undefined
          )
        : [];

    const isValidCareerRow = (
      data: CareerSpell | undefined
    ): data is CareerSpell => {
      // Explicitly check apps and goals are not null as !!0 will return false
      return (
        !!data &&
        !!data.clubId &&
        !!data.from &&
        data.apps !== null &&
        data.goals !== null
      );
    };

    const formatCareer = async (
      row: cheerio.Element,
      playingLevel: PlayingLevels
    ) => {
      const isYouthCareer = playingLevel === PlayingLevels.YOUTH;
      const clubCellSelector = isYouthCareer
        ? '.infobox-data'
        : '.infobox-data-a';
      const rowTitle = $(row).find('th').text().trim();
      const [from, until] = rowTitle.split('–');

      // If from value is not numeric then it's not a valid career row
      if (!isNumeric(from)) return;

      const clubLinkTitle = $(row).find(`${clubCellSelector} a`).attr('title');
      const clubLinkHref = $(row).find(`${clubCellSelector} a`).attr('href');
      const clubCellContent = $(row).find(`${clubCellSelector}`).text().trim();
      const clubTitle = clubLinkTitle ? clubLinkTitle : clubCellContent;
      const isLoan = clubCellContent.includes('(loan)');
      const formattedClubTitle = isLoan
        ? clubTitle
            .replace('→', '')
            .replace('(loan)', '')
            .replace(' national football team', '')
            .trim()
        : clubTitle;
      // Shortcut to avoid making a DB call if we already have the club id
      // Defaulting to empty string instead of handling a failed DB call as a shortcut
      const clubId =
        scrapedClubLinkList[
          `${formattedClubTitle}-${clubLinkHref}`.toLowerCase()
        ] ||
        (await storeClubDetails(formattedClubTitle, clubLinkHref)) ||
        '';
      const apps = $(row).find('.infobox-data-b').text().trim();
      const goals = $(row).find('.infobox-data-c').text();
      const formattedGoals = goals.replace(/[\[(\])]/g, '').trim();

      return {
        clubId,
        from: from || null,
        until: until || null,
        loan: !isYouthCareer ? isLoan : false,
        apps: !isYouthCareer ? Number(apps) : null,
        goals: !isYouthCareer ? Number(formattedGoals) : null,
        playingLevel,
      };
    };

    const youthCareer = await Promise.all(
      youthCareerRows.map((row) => formatCareer(row, PlayingLevels.YOUTH))
    ).then((data) => data.filter(Boolean) as CareerSpell[]);
    const seniorCareer = await Promise.all(
      seniorCareerRows.map((row) => formatCareer(row, PlayingLevels.SENIOR))
    ).then(
      (data) =>
        data
          .filter((data) => isValidCareerRow(data))
          .filter(Boolean) as CareerSpell[]
    );
    const internationalCareer = await Promise.all(
      internationalCareerRows.map((row) =>
        formatCareer(row, PlayingLevels.INTERNATIONAL)
      )
    ).then(
      (data) =>
        data
          .filter((data) => isValidCareerRow(data))
          .filter(Boolean) as CareerSpell[]
    );

    console.log(`ℹ️ Creating DB entries for ${playerName}`);
    await prisma.player.create({
      data: {
        ...playerDetails,
        name: playerName,
        wikipediaUrl: `${BASE_WIKIPEDIA_URL}${playerUrl}`,
        imageUrl: playerImage,
        careerSpells: {
          createMany: {
            data: [...youthCareer, ...seniorCareer, ...internationalCareer],
          },
        },
      },
      include: {
        careerSpells: true,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export const scrapeTransferHistory = async (url: string) => {
  try {
    const premPlayersCategoryRes = await axios.get(url);

    const $ = cheerio.load(premPlayersCategoryRes.data);
    const categoryGroups = $('#mw-pages .mw-category-group ul');

    const playerUrlList: string[] = [];
    categoryGroups.each((_index, group) => {
      $(group)
        .find('a')
        .each((_index, player) => {
          const playerUrl = $(player).attr('href');

          if (playerUrl) {
            playerUrlList.push(playerUrl);
          }
        });
    });

    playerUrlList.forEach(getPlayerDetails);

    const nextLinkHref = $('a:contains("next page")').attr('href');
    if (nextLinkHref) {
      scrapeTransferHistory(`${BASE_WIKIPEDIA_URL}${nextLinkHref}`);
    }
  } catch (error) {
    console.error(error);
  }
};

// await scrapeTransferHistory(`${BASE_WIKIPEDIA_URL}${PREM_PLAYERS_CATEGORY}`);
getPlayerDetails('/wiki/Pierre-Yves_André');
