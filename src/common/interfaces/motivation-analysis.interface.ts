export interface FlaskAnalysisResponse {
  success: boolean;
  data: {
    transcription: string;
    mfcc: number[];
    prediction: {
      prediction: string;
      confidence: number;
      probabilities: number[];
    };
    feature_size: number;
  };
}

export interface MotivationAnalysisResult {
  id: string;
  studentId: string;
  description?: string;
  transcription: string;
  prediction: string;
  confidence: number;
  probabilities: any;
  mfcc: any;
  createdAt: Date;
  updatedAt: Date;
}
