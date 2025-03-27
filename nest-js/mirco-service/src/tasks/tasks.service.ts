import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async getTasks(userId: number) {
    return this.taskRepository.find({ where: { userId } });
  }

  async createTask(userId: number, title: string, description: string) {
    const task = this.taskRepository.create({ userId, title, description });
    return this.taskRepository.save(task);
  }

  async updateTask(id: number, userId: number, status: string) {
    await this.taskRepository.update({ id, userId }, { status });
    return this.taskRepository.findOne({ where: { id, userId } });
  }

  async deleteTask(id: number, userId: number) {
    return this.taskRepository.delete({ id, userId });
  }
}