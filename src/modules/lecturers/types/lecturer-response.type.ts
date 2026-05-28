export type LecturerResponse = Record<string, unknown> & {
  userId: string;
  user?: {
    email: string;
    role: string;
  } | null;
  classAssignments: Array<{
    classId: string;
    class?: {
      name: string;
    } | null;
  }>;
  supervisedClassIds: string[];
  supervisedClasses: string[];
};
