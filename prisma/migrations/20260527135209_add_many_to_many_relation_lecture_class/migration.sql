/*
  Warnings:

  - You are about to drop the column `classId` on the `lecturers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "lecturers" DROP CONSTRAINT "lecturers_classId_fkey";

-- AlterTable
ALTER TABLE "lecturers" DROP COLUMN "classId";

-- CreateTable
CREATE TABLE "lecturer_class_assignments" (
    "id" TEXT NOT NULL,
    "lecturerId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecturer_class_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lecturer_class_assignments_lecturerId_idx" ON "lecturer_class_assignments"("lecturerId");

-- CreateIndex
CREATE INDEX "lecturer_class_assignments_classId_idx" ON "lecturer_class_assignments"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "lecturer_class_assignments_lecturerId_classId_key" ON "lecturer_class_assignments"("lecturerId", "classId");

-- AddForeignKey
ALTER TABLE "lecturer_class_assignments" ADD CONSTRAINT "lecturer_class_assignments_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturer_class_assignments" ADD CONSTRAINT "lecturer_class_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
