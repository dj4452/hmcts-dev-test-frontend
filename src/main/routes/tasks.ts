import {
  getAllTasks,
  removeTask,
  showCreateTaskForm,
  showEditTaskForm,
  showTaskDetails,
  submitTaskForm,
  updateTask,
} from '../controllers/task-controller';

import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

const router = Router();

/**
 * Helper middleware to handle async errors cleanly without try/catch boilerplate
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// --- READ ENDPOINTS ---
router.get('/tasks', asyncHandler(getAllTasks));

// --- CREATE ENDPOINTS ---
router.get('/tasks/new', asyncHandler(showCreateTaskForm));
router.post('/tasks/new', asyncHandler(submitTaskForm)); // Form submits via POST

// --- UPDATE ENDPOINTS ---
router.get('/tasks/:id/edit', asyncHandler(showEditTaskForm));
router.post('/tasks/:id', asyncHandler(updateTask));

// --- DELETE ENDPOINT ---
router.get('/tasks/:id/delete', asyncHandler(removeTask));

// --- MORE INFO ENDPOINT ---
router.get('/tasks/:id/more', asyncHandler(showTaskDetails));
export default router;
