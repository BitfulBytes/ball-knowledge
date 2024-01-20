export enum PlayerDetailsKeys {
  FULL_NAME = 'fullName',
  DATE_OF_BIRTH = 'dateOfBirth',
  PLACE_OF_BIRTH = 'placeOfBirth',
  HEIGHT = 'height',
  POSITION = 'position',
}

export enum WikipediaPlayerDetailsFields {
  FULL_NAME = 'Full name',
  DATE_OF_BIRTH = 'Date of birth',
  PLACE_OF_BIRTH = 'Place of birth',
  HEIGHT = 'Height',
  POSITION = 'Position(s)',
}

export enum PlayingLevels {
  YOUTH = 'YOUTH',
  SENIOR = 'SENIOR',
  INTERNATIONAL = 'INTERNATIONAL',
}

export interface CareerSpell {
  clubId: string;
  from: string | null;
  until: string | null;
  loan: boolean;
  apps: number | null;
  goals: number | null;
  playingLevel: PlayingLevels;
}