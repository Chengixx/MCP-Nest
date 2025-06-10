/*
  Warnings:

  - The primary key for the `Knowledge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `filePath` on the `Knowledge` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `Knowledge` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `Knowledge` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Knowledge` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Knowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Knowledge" ("content", "createdAt", "description", "id", "isActive", "title", "updatedAt") SELECT "content", "createdAt", "description", "id", "isActive", "title", "updatedAt" FROM "Knowledge";
DROP TABLE "Knowledge";
ALTER TABLE "new_Knowledge" RENAME TO "Knowledge";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
