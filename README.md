# TypeScript Task Manager (Console App)

A console-based task manager built to learn and demonstrate core TypeScript/Node.js concepts:
classes, interfaces, modules, async/await, file handling, error handling, and Git workflow.

## Features

- Add, list, complete, and delete tasks
- Optional due dates, with an "overdue tasks" view
- Tags per task, with filter-by-tag
- Search tasks by title/description
- Tasks persist to a local JSON file (`data/tasks.json`)
- Clean, custom error handling — no raw stack traces shown to the user for expected failures

## Project structure
src/
models/
task.interface.ts # Task, CreateTaskInput, and the generic Storage<T> interface
errors.ts # AppError base class + specific error subclasses
services/
file-storage.ts # FileStorage — implements Storage<Task>, reads/writes JSON
in-memory-storage.ts # InMemoryStorage — alternate Storage<Task> implementation
task-manager.ts # TaskManager — all core business logic
cli/
menu.ts # MenuController — the interactive console loop
index.ts # Entry point — wires storage, manager, and CLI together

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

## How the pieces fit together

- **Interfaces** define contracts. `Task` describes what a task looks like once stored;
  `CreateTaskInput` describes what's needed to create one (the app fills in `id`,
  `completed`, and `createdAt` automatically). `Storage<T>` is a generic contract for
  persistence — anything with `load()`/`save()` can be plugged in.
- **Classes implement those contracts.** `FileStorage implements Storage<Task>` and
  persists to a JSON file; `InMemoryStorage implements Storage<Task>` keeps data only in
  memory. `TaskManager` depends only on the `Storage<Task>` interface — not on which
  implementation it's given — so swapping storage backends requires changing exactly one
  line in `index.ts`, with zero changes to `TaskManager` itself.
- **Errors** all extend a common `AppError` base class. The CLI layer catches errors with
  `instanceof AppError` — anything expected (a bad id, empty title) prints a clean one-line
  message; anything unexpected falls through to a full stack trace for debugging.
- **Async programming** is used throughout: file reads/writes (`fs/promises`) and console
  prompts (`readline/promises`) are all `async`/`await`.
- **Modules**: each class lives in its own file, exported and imported explicitly — no
  global state, no mixing of concerns between folders.

## Known quirks / lessons learned building this

- Task data written to disk *before* a field like `tags` or `dueDate` existed won't have
  that field. TypeScript's type system can't catch this at compile time — a type assertion
  (`as Task[]`) only tells the compiler to trust the shape, it doesn't verify it at runtime.
  The fix used here is defensive fallbacks (e.g., `t.tags ?? []`) wherever old data might be
  missing a newer field.
- `__dirname` doesn't exist when running via `tsx` (ESM mode) — `process.cwd()` is used
  instead for locating the data file.

## Possible next steps

- Unit tests for `TaskManager` using `InMemoryStorage` as a fast, no-file-I/O test double
- Runtime validation of loaded JSON (e.g. with a library like `zod`) instead of a type
  assertion, so malformed or outdated data is caught explicitly rather than crashing later
- Edit-task option, sorting, and a proper `deleteTask` confirmation prompt