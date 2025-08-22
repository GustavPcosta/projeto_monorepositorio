import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create_task_dto';
import { UpdateTaskDto } from '../dto/uptdated_tarefa.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createTaskDto: CreateTaskDto) {
    try {
      const task = await this.tasksService.create(createTaskDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tarefa criada com sucesso',
        data: task,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      const tasks = await this.tasksService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Tarefas listadas com sucesso',
        data: tasks,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const task = await this.tasksService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Tarefa encontrada com sucesso',
        data: task,
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    try {
      const task = await this.tasksService.update(id, updateTaskDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Tarefa atualizada com sucesso',
        data: task,
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.tasksService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: result.message,
      };
    } catch (error) {
      throw error;
    }
  }
}
