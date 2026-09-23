import path from "path";
import { FileStorage } from "./services/file-storage";
import { TaskManager } from "./services/task-manager";
import { MenuController } from "./cli/menu";

async function main(): Promise<void> {
  const dataFilePath = path.join(process.cwd(), "data", "tasks.json");

  const storage = new FileStorage(dataFilePath);
  const taskManager = new TaskManager(storage);
  await taskManager.init();

  const menu = new MenuController(taskManager);
  await menu.run();
}

main();