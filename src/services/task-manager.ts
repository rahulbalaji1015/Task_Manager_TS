import { randomUUID } from "crypto";
import { CreateTaskInput, Storage, Task } from "../models/task.interface";
import { TaskNotFoundError, ValidationError } from "../models/errors";

export class TaskManager {
  private tasks: Task[] = [];

  constructor(private readonly storage: Storage<Task>) {}

  async init(): Promise<void> {
    this.tasks = await this.storage.load();
  }

  async addTask(input: CreateTaskInput): Promise<Task> {
    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError("Task title cannot be empty.");
    }

    const task: Task = {
      id: randomUUID(),
      title: input.title.trim(),
      description: input.description?.trim(),
      priority: input.priority ?? "medium",
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: input.dueDate?.trim() || undefined,
      tags: input.tags ?? [],
    };

    this.tasks.push(task);
    await this.storage.save(this.tasks);
    return task;
  }

  getAllTasks(): Task[] {
    return [...this.tasks];
  }

  getTaskById(id: string): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new TaskNotFoundError(id);
    }
    return task;
  }

  async completeTask(id: string): Promise<Task> {
    const task = this.getTaskById(id);
    task.completed = true;
    await this.storage.save(this.tasks);
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new TaskNotFoundError(id);
    }
    this.tasks.splice(index, 1);
    await this.storage.save(this.tasks);
  }
  getOverdueTasks(): Task[] {
  const now = new Date();
  return this.tasks.filter(
    (t) => !t.completed && t.dueDate !== undefined && new Date(t.dueDate) < now
  );
 }

 getTasksByTag(tag: string): Task[] {
  const normalized = tag.trim().toLowerCase();
  return this.tasks.filter((t) => t.tags.some((tg) => tg.toLowerCase() === normalized));
 }

 searchTasks(query: string): Task[] {
  const q = query.trim().toLowerCase();
  return this.tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      (t.description ?? "").toLowerCase().includes(q)
  );
 }
}