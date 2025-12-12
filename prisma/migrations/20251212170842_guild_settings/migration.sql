/*
  Warnings:

  - You are about to drop the column `guildId` on the `GuildSettings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "GuildSettings_guildId_key";

-- AlterTable
ALTER TABLE "GuildSettings" DROP COLUMN "guildId";
