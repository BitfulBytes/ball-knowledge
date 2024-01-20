import { $Enums, CareerSpells, Clubs } from '@prisma/client';

import AnswerBlocks from '@/components/AnswerBlocks';
import prisma from '@/lib/prisma';

type CareerSpell = Omit<CareerSpells, 'clubId' | 'playerId'> & {
  clubs: Pick<Clubs, 'id' | 'name' | 'wikipediaUrl'>;
};

const Home = async () => {
  const player = await prisma.players.findFirst({
    select: {
      id: true,
      name: true,
      imageUrl: true,
      careerSpells: {
        select: {
          id: true,
          from: true,
          until: true,
          playingLevel: true,
          loan: true,
          goals: true,
          apps: true,
          clubs: {
            select: {
              id: true,
              name: true,
              wikipediaUrl: true,
            },
          },
        },
      },
    },
  });

  if (!player) return null;

  const careerByLevel = player.careerSpells.reduce(
    (acc, spell) => {
      const level = spell.playingLevel;
      if (!acc[level]) {
        acc[level] = [] as CareerSpell[];
      }
      acc[level].push(spell);
      return acc;
    },
    {} as Record<$Enums.PlayingLevel, CareerSpell[]>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mx-auto flex flex-col gap-9 max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8">
        {Object.entries(careerByLevel).map(([playingLevel, spells]) => (
          <div
            key={playingLevel}
            className="flex items-center justify-center gap-3"
          >
            {spells.map(({ clubs, from, until, apps, goals, loan }) => (
              <div key={`${clubs.id}-${from}-${until}`} className="text-center">
                <p className="text-md font-semibold text-primary-500">
                  {clubs.name}
                </p>
                <p className="text-xs text-slate-400">
                  {from}
                  {until && ` - ${until}`}
                </p>
                <p className="text-xs text-slate-400">
                  A {apps} / G {goals}
                </p>
                {loan && <p className="text-xs text-slate-400">Loan Spell</p>}
              </div>
            ))}
          </div>
        ))}
        <AnswerBlocks playerName={player.name} />
      </div>
    </main>
  );
};

export default Home;
