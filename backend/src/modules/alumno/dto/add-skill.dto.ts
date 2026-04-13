import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class AddSkillDto {
  @IsOptional()
  @IsUUID()
  skillId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  nombre?: string;

  @IsOptional()
  @IsString()
  categoria?: string;
}
