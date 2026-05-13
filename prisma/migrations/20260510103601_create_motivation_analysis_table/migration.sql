-- CreateTable
CREATE TABLE "motivation_analyses" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "description" TEXT,
    "transcription" TEXT NOT NULL,
    "prediction" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "probabilities" JSONB,
    "mfcc" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motivation_analyses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "motivation_analyses" ADD CONSTRAINT "motivation_analyses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
