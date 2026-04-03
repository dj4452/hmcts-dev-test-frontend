import TaskService, { TaskPayload } from '../services/task-service';

import { NextFunction, Request, Response } from 'express';

interface ValidationResult {
  errors: Record<string, string>;
  isValid: boolean;
}

/**
 * GET /tasks
 * Fetch all tasks from the service and render the task list view.
 */
export const getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasks = await TaskService.getAllTasks();
    res.render('taskmanagement/view-tasks', { title: 'Task List', data: tasks });
  } catch (error) {
    next(error);
  }
};

// New function to just SHOW the page
export const showCreateTaskForm = async (req: Request, res: Response): Promise<void> => {
  res.render('taskmanagement/task-form');
};

/**
 * Post /tasks/new
 * processess save the payload to API DB.
 */
export const submitTaskForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, status } = req.body;
    const { errors, isValid } = validateTaskForm(req);
    const day = req.body['dueDate-day'];
    const month = req.body['dueDate-month'];
    const year = req.body['dueDate-year'];
    const dueDate = calculateDueDate(day, month, year);

    if (!isValid) {
      return res.status(400).render('taskmanagement/task-form', {
        errors,
        data: {
          title,
          description,
          status,
          'dueDate-day': day,
          'dueDate-month': month,
          'dueDate-year': year,
        },
      });
    }

    const newTaskPayload = { title, description, status, dueDate };
    await TaskService.createTask(newTaskPayload);
    res.redirect('/tasks');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /tasks/:id/delete
 * Removes a task from the system and redirects the browser back to the updated list
 */
export const removeTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await TaskService.deleteTask(id);
    res.redirect('/tasks');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /tasks/:id/edit
 * Fetch a task by ID and render the edit form.
 */
export const showEditTaskForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existingTask = await TaskService.getTaskById(id);

    let formData: Partial<TaskPayload> & { 'dueDate-day'?: string; 'dueDate-month'?: string; 'dueDate-year'?: string } =
      {};
    if (existingTask) {
      formData = {
        title: existingTask.title,
        description: existingTask.description,
        status: existingTask.status,
      };
      const apiDateValue = existingTask.dueDate;
      const [parsedYear, parsedMonth, rawDay] = apiDateValue.split('-');
      const parsedDay = rawDay.substring(0, 2); // Excludes the 'T00:00:00' suffix
      formData['dueDate-day'] = parsedDay;
      formData['dueDate-month'] = parsedMonth;
      formData['dueDate-year'] = parsedYear;
    }
    res.render('taskmanagement/task-form', {
      title: 'Edit task',
      method: 'put',
      action: '/tasks/' + id,
      data: formData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /tasks/:id
 * Fetch a single task by ID and render the details view.
 */
export const showTaskDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existingTask = await TaskService.getTaskById(id);
    res.render('taskmanagement/view-task-details', { data: existingTask });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /tasks/:id
 * Validate the update payload, apply changes via the service,
 * and redirect back to the task list.
 */
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const { errors, isValid } = validateTaskForm(req);
    const day = req.body['dueDate-day'];
    const month = req.body['dueDate-month'];
    const year = req.body['dueDate-year'];
    if (!isValid) {
      return res.status(400).render('taskmanagement/task-form', {
        errors,
        data: {
          title,
          description,
          status,
          'dueDate-day': day,
          'dueDate-month': month,
          'dueDate-year': year,
        },
      });
    }

    await TaskService.updateTask(id, {
      title,
      description,
      status,
      dueDate: calculateDueDate(day, month, year),
    });
    res.redirect('/tasks');
  } catch (error) {
    next(error);
  }
};

/**
 * Validate required task form fields.
 */
const validateTaskForm = (req: Request): ValidationResult => {
  const { title, status } = req.body;
  const dueDateDay = req.body['dueDate-day'];
  const dueDateMonth = req.body['dueDate-month'];
  const dueDateYear = req.body['dueDate-year'];
  const errors: Record<string, string> = {};

  if (!title || title.trim() === '') {
    errors.title = 'Enter a task title';
  }
  if (!status || status.trim() === '') {
    errors.status = 'Select a task status';
  }
  if (!dueDateDay || !dueDateMonth || !dueDateYear) {
    errors.dueDate = 'Enter a due date';
  } else {
    const parsed = new Date(Number(dueDateYear), Number(dueDateMonth) - 1, Number(dueDateDay));
    if (isNaN(parsed.getTime())) {
      errors.dueDate = 'Enter a valid due date';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      parsed.setHours(0, 0, 0, 0);

      if (parsed <= today) {
        errors.dueDate = 'Due date must be in the future';
      }
    }
  }
  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

/**
 *  Change the payload data to save the date in ISO format to be compatible with the API contract.
 */
const calculateDueDate = (day: string, month: string, year: string): string => {
  const formattedIsoDateTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`;
  return formattedIsoDateTime;
};
