import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ProgramDepartmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

class ProgramClassSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  studyProgramId?: string | null = null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ProgramListItemDto {
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

  @ApiProperty({ type: ProgramDepartmentDto })
  department!: ProgramDepartmentDto;

  @ApiPropertyOptional()
  _count?: {
    classes: number;
    students: number;
  } = { classes: 0, students: 0 };

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ProgramDetailDto extends ProgramListItemDto {
  @ApiPropertyOptional({ type: [ProgramClassSummaryDto] })
  classes: ProgramClassSummaryDto[] = [];
}

export class ProgramListResponseDto {
  @ApiProperty({ type: [ProgramListItemDto] })
  data: ProgramListItemDto[] = [];

  @ApiProperty()
  meta = {
    total: 0,
    page: 1,
    limit: 10,
  };
}
