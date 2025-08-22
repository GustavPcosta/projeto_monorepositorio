import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './module/prisma.module';
import { TasksModule } from './module/tasks.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    TasksModule,
    
  ],
})
export class AppModule {}