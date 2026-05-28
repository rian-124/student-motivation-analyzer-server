import { LecturerWithRelations } from './lecturer-with-relations.type';

export type LecturerResponse = LecturerWithRelations & {
  supervisedClassIds: string[];
  supervisedClasses: string[];
};
