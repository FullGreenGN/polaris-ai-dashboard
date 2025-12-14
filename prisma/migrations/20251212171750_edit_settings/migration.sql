/*
  Warnings:

  - A unique constraint covering the columns `[guildSettingsId]` on the table `Guild` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Guild_guildSettingsId_key" ON "Guild"("guildSettingsId");

-- CreateIndex
CREATE INDEX "Guild_guildSettingsId_idx" ON "Guild"("guildSettingsId");
