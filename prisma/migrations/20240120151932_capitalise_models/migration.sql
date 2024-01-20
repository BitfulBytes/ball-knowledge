/*
  Warnings:

  - You are about to drop the `careerSpells` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clubs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `players` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "careerSpells" DROP CONSTRAINT "careerSpells_clubId_fkey";

-- DropForeignKey
ALTER TABLE "careerSpells" DROP CONSTRAINT "careerSpells_playerId_fkey";

-- DropTable
DROP TABLE "careerSpells";

-- DropTable
DROP TABLE "clubs";

-- DropTable
DROP TABLE "players";

-- CreateTable
CREATE TABLE "CareerSpells" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "from" TEXT,
    "until" TEXT,
    "apps" INTEGER,
    "goals" INTEGER,
    "loan" BOOLEAN NOT NULL,
    "playingLevel" "PlayingLevel" NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "CareerSpells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clubs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wikipediaUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Players" (
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

    CONSTRAINT "Players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clubs_name_wikipediaUrl_key" ON "Clubs"("name", "wikipediaUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Players_name_wikipediaUrl_key" ON "Players"("name", "wikipediaUrl");

-- AddForeignKey
ALTER TABLE "CareerSpells" ADD CONSTRAINT "CareerSpells_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerSpells" ADD CONSTRAINT "CareerSpells_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
