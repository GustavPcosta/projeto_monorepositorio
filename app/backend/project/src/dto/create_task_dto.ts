import { IsString, IsNotEmpty, IsDateString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome da tarefa é obrigatório' })
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Custo deve ser um número válido' })
  @Min(0, { message: 'Custo deve ser maior ou igual a zero' })
  @Transform(({ value }) => parseFloat(value))
  cost: number;

  
  // @IsNumber({ maxDecimalPlaces: 2 }, { message: 'order deve ser um número válido' })
  // @Min(0, { message: 'order deve ser maior ou igual a zero' })
  // @Transform(({ value }) => parseFloat(value))
  // order?: number;

  @IsDateString({}, { message: 'Data limite deve ser uma data válida' })
  dueDate: string;
}