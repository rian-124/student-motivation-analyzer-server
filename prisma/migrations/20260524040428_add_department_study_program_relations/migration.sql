-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "studyProgramId" TEXT;

-- AlterTable
ALTER TABLE "lecturers" ADD COLUMN     "studyProgramId" TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "studyProgramId" TEXT;

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_programs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degreeLevel" TEXT,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "study_programs_code_key" ON "study_programs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "study_programs_name_key" ON "study_programs"("name");

-- AddForeignKey
ALTER TABLE "study_programs" ADD CONSTRAINT "study_programs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_studyProgramId_fkey" FOREIGN KEY ("studyProgramId") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_studyProgramId_fkey" FOREIGN KEY ("studyProgramId") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_studyProgramId_fkey" FOREIGN KEY ("studyProgramId") REFERENCES "study_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
