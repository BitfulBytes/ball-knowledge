-- CreateEnum
CREATE TYPE "PlayingLevel" AS ENUM ('YOUTH', 'SENIOR', 'INTERNATIONAL');

-- CreateTable
CREATE TABLE "careerSpells" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "from" TEXT,
    "until" TEXT,
    "apps" INTEGER,
    "goals" INTEGER,
    "loan" BOOLEAN NOT NULL,
    "playingLevel" "PlayingLevel" NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "careerSpells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wikipediaUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "wikipediaUrl" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "dateOfBirth" TEXT,
    "placeOfBirth" TEXT,
    "height" TEXT,
    "position" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clubs_name_wikipediaUrl_key" ON "clubs"("name", "wikipediaUrl");

-- CreateIndex
CREATE UNIQUE INDEX "players_name_wikipediaUrl_key" ON "players"("name", "wikipediaUrl");

-- AddForeignKey
ALTER TABLE "careerSpells" ADD CONSTRAINT "careerSpells_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "careerSpells" ADD CONSTRAINT "careerSpells_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
