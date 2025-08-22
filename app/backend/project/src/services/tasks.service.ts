import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateTaskDto } from '../dto/create_task_dto';
import { UpdateTaskDto } from '../dto/uptdated_tarefa.dto';
import { Task } from '../entities/tasks.entity';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      // Verificar se já existe uma tarefa com o mesmo nome
      const existingTask = await this.prisma.tarefas.findUnique({
        where: { name: createTaskDto.name },
      });

      if (existingTask) {
        throw new ConflictException('Já existe uma tarefa com este nome');
      }

      // Obter a maior ordem atual e incrementar
      const lastTask = await this.prisma.tarefas.findFirst({
        orderBy: { order: 'desc' },
      });

      const nextOrder = lastTask ? lastTask.order + 1 : 1;

      // Criar a nova tarefa
      const task = await this.prisma.tarefas.create({
        data: {
          name: createTaskDto.name,
          cost: createTaskDto.cost,
          dueDate: new Date(createTaskDto.dueDate),
          order: nextOrder,
        },
      });

      return task;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar tarefa');
    }
  }

  async findAll(): Promise<Task[]> {
    return this.prisma.tarefas.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.prisma.tarefas.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      // Verificar se a tarefa existe
      await this.findOne(id);

      // Se o nome está sendo alterado, verificar duplicatas
      if (updateTaskDto.name) {
        const existingTask = await this.prisma.tarefas.findFirst({
          where: {
            name: updateTaskDto.name,
            NOT: { id },
          },
        });

        if (existingTask) {
          throw new ConflictException('Já existe uma tarefa com este nome');
        }
      }

      
      const updateData: any = {};
      
      if (updateTaskDto.name !== undefined) {
        updateData.name = updateTaskDto.name;
      }
      
      if (updateTaskDto.cost !== undefined) {
        updateData.cost = updateTaskDto.cost;
      }
      
      if (updateTaskDto.dueDate !== undefined) {
        updateData.dueDate = new Date(updateTaskDto.dueDate);
      }

      // Atualizar a tarefa
      const task = await this.prisma.tarefas.update({
        where: { id },
        data: updateData,
      });

      return task;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar tarefa');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Verificar se a tarefa existe
      await this.findOne(id);

      // Remover a tarefa
      await this.prisma.tarefas.delete({
        where: { id },
      });

      return { message: 'Tarefa excluída com sucesso' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao excluir tarefa');
    }
  }

  // Método auxiliar para reordenar tarefas (opcional)
  async reorderTasks(): Promise<void> {
    const tasks = await this.prisma.tarefas.findMany({
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < tasks.length; i++) {
      await this.prisma.tarefas.update({
        where: { id: tasks[i].id },
        data: { order: i + 1 },
      });
    }
  }
}