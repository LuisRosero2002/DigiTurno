/*
  Warnings:

  - Added the required column `LUGAR` to the `TURNOS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TURNOS" ADD COLUMN     "LUGAR" TEXT NOT NULL;
