import { AnalysisMetrics } from './analysis-metrics.type';
import { AnalysisProbability } from './analysis-probability.type';

export type MotivationAnalysisStudentSummary = {
  id: string;
  nim: string;
  name: string;
  semester: string | null;
  classId: string | null;
  className: string | null;
  studyProgramId: string | null;
  studyProgramName: string | null;
  lecturerId: string | null;
  lecturerName: string | null;
};

export type MotivationAnalysisResultBlock = {
  code: string;
  label: string;
  confidence: number;
  confidencePercent: number;
  probabilities: AnalysisProbability[];
};

export type MotivationAnalysisResponse = {
  id: string;
  studentId: string;
  description: string | null;
  transcription: string;
  prediction: string;
  predictionCode: string;
  confidence: number;
  confidencePercent: number;
  weightedScore: number | null;
  duration: number | null;
  probabilities: AnalysisProbability[];
  result: MotivationAnalysisResultBlock;
  acoustic: {
    mfcc: number[] | number[][];
    metrics: AnalysisMetrics;
  };
  metrics: AnalysisMetrics;
  createdAt: Date;
  updatedAt: Date;
  student?: MotivationAnalysisStudentSummary;
};
