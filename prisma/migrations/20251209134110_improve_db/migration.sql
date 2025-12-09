/*
  Warnings:

  - A unique constraint covering the columns `[user_id,name,version]` on the table `user_api_keys` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_api_keys_user_id_name_key";

-- AlterTable
ALTER TABLE "user_api_keys" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "user_api_keys_user_id_name_version_key" ON "user_api_keys"("user_id", "name", "version");
