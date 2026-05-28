import { Prisma } from '@prisma/client';

export type LecturerWithRelations = Prisma.LecturerGetPayload<{
  include: {
    user: { select: { email: true; role: true } };
    studyProgram: true;
    classAssignments: {
      include: { class: { select: { id: true; name: true } } };
    };
    _count?: { select: { students: true } };
  };
}>;
