# HMCTS Dev Test Frontend

This is the frontend for the HMCTS task management demo used during development and testing.

## Install & Run

1. Install dependencies:
   yarn install

2. Build assets:
   yarn webpack

3. Run the dev server:
   yarn start:dev

Visit `https://localhost:3100/tasks`

## Project Structure

| File                                                  | Description                                  |
| ----------------------------------------------------- | -------------------------------------------- |
| `src/main/routes/tasks.ts`                            | Application routes for task management       |
| `src/main/controllers/task-controller.ts`             | Controller actions for task pages            |
| `src/main/services/task-service.ts`                   | Backend integration for task CRUD operations |
| `src/main/views/taskmanagement/view-tasks.njk`        | Task list view                               |
| `src/main/views/taskmanagement/task-form.njk`         | Create and edit task form                    |
| `src/main/views/taskmanagement/view-task-details.njk` | Task details page                            |

## Routes

| Method | Path                | Description                   |
| ------ | ------------------- | ----------------------------- |
| GET    | `/tasks`            | List all tasks                |
| GET    | `/tasks/new`        | Show the create task form     |
| POST   | `/tasks/new`        | Submit a new task             |
| GET    | `/tasks/:id/edit`   | Show the edit form for a task |
| POST   | `/tasks/:id`        | Submit updates for a task     |
| GET    | `/tasks/:id/delete` | Delete a task                 |
| GET    | `/tasks/:id/more`   | View task details             |

## User Flow

1. Navigate to `/tasks` to view all tasks
2. Click **Add a Task** to open the create form
3. Complete and submit the form to create a task
4. Use the edit link to update a task via `/tasks/:id/edit`
5. Delete a task via `/tasks/:id/delete`
6. View full task details via `/tasks/:id/more`
7. View details via /tasks/:id/more

## Known Limitations

- BDD feature files and integration tests have not been written
- Error handling in the controller could be improved
- Date validation could be better
