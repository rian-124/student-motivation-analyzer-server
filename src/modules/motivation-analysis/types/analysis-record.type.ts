import { MotivationAnalysis, Prisma } from '@prisma/client';

export type AnalysisWithStudent = Prisma.MotivationAnalysisGetPayload<{
  include: {
    student: {
      include: {
        class: true;
        studyProgram: true;
        lecturer: true;
      };
    };
  };
}>;

export type AnalysisRecord = MotivationAnalysis | AnalysisWithStudent;
