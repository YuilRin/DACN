import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getTasks(@Request() req) {
    return this.tasksService.getTasks(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createTask(@Request() req, @Body() body) {
    return this.tasksService.createTask(req.user.id, body.title, body.description);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateTask(@Request() req, @Param('id') id: number, @Body() body) {
    return this.tasksService.updateTask(id, req.user.id, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteTask(@Request() req, @Param('id') id: number) {
    return this.tasksService.deleteTask(id, req.user.id);
  }
}