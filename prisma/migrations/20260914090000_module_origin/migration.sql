-- CreateEnum
CREATE TYPE "ModuleOrigin" AS ENUM ('DECK', 'AUTHORED');

-- AlterTable
ALTER TABLE "CourseModule" ADD COLUMN     "origin" "ModuleOrigin" NOT NULL DEFAULT 'DECK';

