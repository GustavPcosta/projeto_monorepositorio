import { Module } from '@nestjs/common';
import { TasksService } from '../services/tasks.service';
import { TasksController } from '../controller/tasks.controller';
import { PrismaModule } from '../module/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}