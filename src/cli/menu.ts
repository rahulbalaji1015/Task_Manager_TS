import * as readline from "readline/promises";
import { stdin, stdout } from "process";
import { TaskManager } from "../services/task-manager";
import { AppError } from "../models/errors";

const MENU_TEXT = `
=== Task Manager ===
1) List tasks
2) Add task
3) Complete task
4) Delete task
5) Show overdue tasks
6) Filter by tag
7) Search tasks
8) Exit
`;

export class MenuController {
  private rl = readline.createInterface({ input: stdin, output: stdout });

  constructor(private readonly taskManager: TaskManager) {}

  async run(): Promise<void> {
    let running = true;

    while (running) {
      console.log(MENU_TEXT);
      const choice = (await this.rl.question("Choose an option: ")).trim();

      try {
        switch (choice) {
          case "1":
            this.listTasks();
            break;
          case "2":
            await this.addTask();
            break;
          case "3":
            await this.completeTask();
            break;
          case "4":
            await this.deleteTask();
            break;
          case "5":
            this.showOverdue();
            break;
          case "6":
            await this.filterByTag();
            break;
          case "7":
            await this.search();
            break;
          case "8":
            running = false;
            console.log("Goodbye!");
            break;
          default:
            console.log("Invalid option, please choose 1-8.");
        }
      } catch (err) {
        this.handleError(err);
      }
    }

    this.rl.close();
  }

  private listTasks(): void {
    const tasks = this.taskManager.getAllTasks();
    if (tasks.length === 0) {
      console.log("No tasks yet.");
      return;
    }
    tasks.forEach((t) => {
      const status = t.completed ? "✔" : " ";
      console.log(`[${status}] (${t.priority}) ${t.title} — id: ${t.id}`);
    });
  }

  private async addTask(): Promise<void> {
    const title = await this.rl.question("Title: ");
    const description = await this.rl.question("Description (optional): ");
    const priorityInput = (await this.rl.question("Priority [low/medium/high] (default medium): ")).trim();
    const dueDateInput = (await this.rl.question("Due date YYYY-MM-DD (optional): ")).trim();
    const tagsInput = (await this.rl.question("Tags, comma-separated (optional): ")).trim();

    const priority =
      priorityInput === "low" || priorityInput === "medium" || priorityInput === "high"
        ? priorityInput
        : undefined;

    const tags = tagsInput
      ? tagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    const task = await this.taskManager.addTask({
      title,
      description: description || undefined,
      priority,
      dueDate: dueDateInput || undefined,
      tags,
    });
    console.log(`Added task "${task.title}" (id: ${task.id})`);
  }

  private async completeTask(): Promise<void> {
    const id = await this.rl.question("Task id to complete: ");
    const task = await this.taskManager.completeTask(id.trim());
    console.log(`Marked "${task.title}" as complete.`);
  }

  private async deleteTask(): Promise<void> {
    const id = await this.rl.question("Task id to delete: ");
    await this.taskManager.deleteTask(id.trim());
    console.log("Task deleted.");
  }

  private showOverdue(): void {
    const tasks = this.taskManager.getOverdueTasks();
    if (tasks.length === 0) {
      console.log("Nothing overdue.");
      return;
    }
    tasks.forEach((t) => console.log(`${t.title} — was due ${t.dueDate}`));
  }

  private async filterByTag(): Promise<void> {
    const tag = await this.rl.question("Tag to filter by: ");
    const tasks = this.taskManager.getTasksByTag(tag);
    if (tasks.length === 0) {
      console.log("No tasks with that tag.");
      return;
    }
    tasks.forEach((t) => console.log(`${t.title} — tags: ${t.tags.join(", ")}`));
  }

  private async search(): Promise<void> {
    const query = await this.rl.question("Search: ");
    const tasks = this.taskManager.searchTasks(query);
    if (tasks.length === 0) {
      console.log("No matches.");
      return;
    }
    tasks.forEach((t) => console.log(`${t.title}`));
  }

  private handleError(err: unknown): void {
    if (err instanceof AppError) {
      console.log(`Error: ${err.message}`);
    } else {
      console.log("An unexpected error occurred.");
      console.error(err);
    }
  }
}