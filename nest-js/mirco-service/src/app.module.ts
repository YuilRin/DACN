import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { Task } from './tasks/task.entity';
import { JwtAuthGuard } from './auth/jwt-auth.guard';


@Module({
  // imports: [],
  // controllers: [AppController],
  // providers: [AppService],
  imports: [DatabaseModule, TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class AppModule {}



