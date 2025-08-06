/*
  Warnings:

  - Added the required column `team1Name` to the `match_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team2Name` to the `match_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."match_history" ADD COLUMN     "team1Name" TEXT NOT NULL,
ADD COLUMN     "team2Name" TEXT NOT NULL;
