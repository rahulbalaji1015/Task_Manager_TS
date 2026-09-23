export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class TaskNotFoundError extends AppError {
  constructor(id: string) {
    super(`No task found with id "${id}"`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

export class FileReadError extends AppError {
  constructor(path: string, cause?: unknown) {
    super(`Failed to read data file at "${path}": ${(cause as Error)?.message ?? cause}`);
  }
}

export class FileWriteError extends AppError {
  constructor(path: string, cause?: unknown) {
    super(`Failed to write data file at "${path}": ${(cause as Error)?.message ?? cause}`);
  }
}

export class InvalidDataError extends AppError {
  constructor(details: string) {
    super(`Data file is invalid: ${details}`);
  }
}