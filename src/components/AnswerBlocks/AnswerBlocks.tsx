'use client';

import { FC, useEffect, useState } from 'react';

interface AnswerBlocksProps {
  playerName: string;
}

const AnswerBlocks: FC<AnswerBlocksProps> = ({ playerName }) => {
  const playerNames = playerName.split(' ');
  const answer = playerNames[playerNames.length - 1]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const [guess, setGuess] = useState('');

  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      const eventKey = e.key;

      if (eventKey === 'Backspace') {
        setGuess(guess.slice(0, -1));
      }

      if (
        eventKey === 'Enter' &&
        guess.toLowerCase() === answer.toLowerCase()
      ) {
        setGuess('');
      }

      if (eventKey.length === 1 && guess.length < answer.length) {
        setGuess(guess + eventKey);
      }
    };

    window.addEventListener('keydown', keyListener);

    return () => {
      window.removeEventListener('keydown', keyListener);
    };
  }, [guess, answer]);

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {answer.split('').map((_letter, index) => (
        <div
          key={index}
          className={`w-10 h-10 ${guess[index] ? (guess[index].toUpperCase() === answer[index].toUpperCase() ? 'bg-green-400' : 'bg-red-400') : 'bg-slate-300'} rounded-md flex items-center justify-center ${guess.length === index ? 'outline outline-offset-2 outline- outline-indigo-300' : ''} font-semibold text-white`}
        >
          {guess[index] ? guess[index].toUpperCase() : ''}
        </div>
      ))}
    </div>
  );
};

export default AnswerBlocks;
