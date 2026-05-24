import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ClassDepartmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

class ClassStudyProgramDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  degreeLevel?: string | null = null;

  @ApiProperty()
  departmentId!: string;

  @ApiProperty({ type: ClassDepartmentDto })
  department!: ClassDepartmentDto;
}

class ClassStudentSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nim!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  semester?: string | null = null;

  @ApiPropertyOptional()
  classId?: string | null = null;

  @ApiPropertyOptional()
  studyProgramId?: string | null = null;

  @ApiPropertyOptional()
  lecturerId?: string | null = null;
}

class ClassLecturerSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nip!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  department?: string | null = null;

  @ApiPropertyOptional()
  classId?: string | null = null;

  @ApiPropertyOptional()
  studyProgramId?: string | null = null;
}

export class ClassListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  studyProgramId?: string | null = null;

  @ApiPropertyOptional({ type: ClassStudyProgramDto })
  studyProgram?: ClassStudyProgramDto | null = null;

  @ApiPropertyOptional()
  _count?: {
    students: number;
    lecturers: number;
  } = { students: 0, lecturers: 0 };

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ClassDetailDto extends ClassListItemDto {
  @ApiPropertyOptional({ type: [ClassStudentSummaryDto] })
  students: ClassStudentSummaryDto[] = [];

  @ApiPropertyOptional({ type: [ClassLecturerSummaryDto] })
  lecturers: ClassLecturerSummaryDto[] = [];
}

export class ClassStudentsResponseDto {
  @ApiProperty({ type: [ClassStudentSummaryDto] })
  data: ClassStudentSummaryDto[] = [];

  @ApiProperty()
  meta = {
    total: 0,
    page: 1,
    limit: 10,
  };
}

export class ClassLeaderboardStudentDto {
  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  nim!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  status!: 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty()
  rank!: number;
}

export class ClassLeaderboardResponseDto {
  @ApiProperty()
  classId!: string;

  @ApiProperty()
  className!: string;

  @ApiPropertyOptional()
  programId?: string | null = null;

  @ApiPropertyOptional()
  programName?: string | null = null;

  @ApiProperty()
  averageScore!: number;

  @ApiProperty()
  totalStudents!: number;

  @ApiProperty()
  highCount!: number;

  @ApiProperty()
  mediumCount!: number;

  @ApiProperty()
  lowCount!: number;

  @ApiProperty({ type: [ClassLeaderboardStudentDto] })
  students: ClassLeaderboardStudentDto[] = [];
}

export class ClassListResponseDto {
  @ApiProperty({ type: [ClassListItemDto] })
  data: ClassListItemDto[] = [];

  @ApiProperty()
  meta = {
    total: 0,
    page: 1,
    limit: 10,
  };
}
