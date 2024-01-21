import { PlayerDetailsKeys, WikipediaPlayerDetailsFields } from './types';

export const BASE_WIKIPEDIA_URL = 'https://en.wikipedia.org';
export const PREM_PLAYERS_CATEGORY = '/wiki/Category:Premier_League_players';

export const mapWikipediaFieldToKey: Record<
  WikipediaPlayerDetailsFields,
  PlayerDetailsKeys
> = {
  [WikipediaPlayerDetailsFields.FULL_NAME]: PlayerDetailsKeys.FULL_NAME,
  [WikipediaPlayerDetailsFields.DATE_OF_BIRTH]: PlayerDetailsKeys.DATE_OF_BIRTH,
  [WikipediaPlayerDetailsFields.PLACE_OF_BIRTH]:
    PlayerDetailsKeys.PLACE_OF_BIRTH,
  [WikipediaPlayerDetailsFields.HEIGHT]: PlayerDetailsKeys.HEIGHT,
  [WikipediaPlayerDetailsFields.POSITION]: PlayerDetailsKeys.POSITION,
};
