export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  tags: string[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

export interface Storage<T> {
  load(): Promise<T[]>;
  save(items: T[]): Promise<void>;
}