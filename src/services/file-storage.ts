import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname } from "path";
import { Storage, Task } from "../models/task.interface";
import { FileReadError, FileWriteError, InvalidDataError } from "../models/errors";

export class FileStorage implements Storage<Task> {
  constructor(private readonly filePath: string) {}

  async load(): Promise<Task[]> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        throw new InvalidDataError("expected the data file to contain a JSON array");
      }
      return parsed as Task[];
    } catch (err) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === "ENOENT") {
        return [];
      }
      if (err instanceof InvalidDataError) {
        throw err;
      }
      throw new FileReadError(this.filePath, err);
    }
  }

  async save(tasks: Task[]): Promise<void> {
    try {
      await mkdir(dirname(this.filePath), { recursive: true });
      const json = JSON.stringify(tasks, null, 2);
      await writeFile(this.filePath, json, "utf-8");
    } catch (err) {
      throw new FileWriteError(this.filePath, err);
    }
  }
}