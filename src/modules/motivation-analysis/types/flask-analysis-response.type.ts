export type FlaskAnalysisResponse = {
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
};
