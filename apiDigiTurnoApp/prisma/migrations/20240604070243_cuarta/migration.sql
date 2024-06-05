/*
  Warnings:

  - You are about to alter the column `TELEFONO` on the `CLIENTES` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `CEDULA` on the `CLIENTES` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "CLIENTES" ALTER COLUMN "TELEFONO" SET DATA TYPE INTEGER,
ALTER COLUMN "CEDULA" SET DATA TYPE INTEGER;
