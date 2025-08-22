import { IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Custo deve ser um número válido' })
  @Min(0, { message: 'Custo deve ser maior ou igual a zero' })
  @Transform(({ value }) => parseFloat(value))
  cost?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Data limite deve ser uma data válida' })
  dueDate?: string;
}