export type StudentGraphWeeklyTrend = {
  label: string;
  value: number;
};

export type StudentGraphBenchmark = {
  subject: string;
  A: number;
  B: number;
};

export type StudentGraphStats = {
  latestStatus: string;
  activityCount: number;
  avgScore: number;
  growth: number;
};

export type StudentGraphData = {
  weeklyTrend: StudentGraphWeeklyTrend[];
  benchmark: StudentGraphBenchmark[];
  stats: StudentGraphStats;
};
