import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class TaskTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task, (task) => task.id, { onDelete: 'CASCADE' })
  task: Task;

  @Column()
  tag: string;
}
