import {
  getAllTasks,
  removeTask,
  showCreateTaskForm,
  showEditTaskForm,
  showTaskDetails,
  submitTaskForm,
  updateTask,
} from '../../main/controllers/task-controller';
import TaskService, { TaskPayload } from '../../main/services/task-service';

import { NextFunction, Request, Response } from 'express';
jest.mock('../../main/services/task-service');
const MockedTaskService = TaskService as jest.Mocked<typeof TaskService>;
const mockRes = () => {
  const res = {} as Response;
  res.render = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({
    params: {},
    body: {},
    ...overrides,
  }) as unknown as Request;

const next: NextFunction = jest.fn();

const sampleTask: TaskPayload = {
  title: 'Test Task',
  description: 'A description',
  status: 'open',
  dueDate: '2099-12-31T00:00:00',
};

describe('task-controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getAllTasks', () => {
    it('fetches tasks and renders the task list view', async () => {
      MockedTaskService.getAllTasks.mockResolvedValueOnce([sampleTask]);
      const res = mockRes();
      await getAllTasks(mockReq(), res, next);
      expect(res.render).toHaveBeenCalledWith('taskmanagement/view-tasks', {
        title: 'Task List',
        data: [sampleTask],
      });
    });
  });

  describe('showCreateTaskForm', () => {
    it('renders the task form', async () => {
      const res = mockRes();
      await showCreateTaskForm(mockReq(), res);
      expect(res.render).toHaveBeenCalledWith('taskmanagement/task-form');
    });
  });

  describe('submitTaskForm', () => {
    const validBody = {
      title: 'New Task',
      description: 'desc',
      status: 'open',
      'dueDate-day': '1',
      'dueDate-month': '1',
      'dueDate-year': '2099',
    };

    it('creates a task and redirects on valid input', async () => {
      MockedTaskService.createTask.mockResolvedValueOnce({ success: true });
      const res = mockRes();
      await submitTaskForm(mockReq({ body: validBody }), res, next);
      expect(MockedTaskService.createTask).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/tasks');
    });

    it('re-renders the form with errors when title is missing', async () => {
      const res = mockRes();
      await submitTaskForm(mockReq({ body: { ...validBody, title: '' } }), res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith(
        'taskmanagement/task-form',
        expect.objectContaining({ errors: expect.objectContaining({ title: expect.any(String) }) })
      );
    });

    it('re-renders the form with errors when status is missing', async () => {
      const res = mockRes();
      await submitTaskForm(mockReq({ body: { ...validBody, status: '' } }), res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith(
        'taskmanagement/task-form',
        expect.objectContaining({ errors: expect.objectContaining({ status: expect.any(String) }) })
      );
    });

    it('re-renders the form when due date is in the past', async () => {
      const res = mockRes();
      await submitTaskForm(mockReq({ body: { ...validBody, 'dueDate-year': '2000' } }), res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith(
        'taskmanagement/task-form',
        expect.objectContaining({ errors: expect.objectContaining({ dueDate: expect.any(String) }) })
      );
    });

    it('re-renders the form when a due date field is missing', async () => {
      const res = mockRes();
      const { 'dueDate-day': _d, ...bodyWithoutDay } = validBody;
      await submitTaskForm(mockReq({ body: bodyWithoutDay }), res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith(
        'taskmanagement/task-form',
        expect.objectContaining({ errors: expect.objectContaining({ dueDate: expect.any(String) }) })
      );
    });

    it('calls next(error) when the service throws', async () => {
      MockedTaskService.createTask.mockRejectedValueOnce(new Error('DB error'));
      const res = mockRes();
      await submitTaskForm(mockReq({ body: validBody }), res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('removeTask', () => {
    it('deletes the task and redirects', async () => {
      MockedTaskService.deleteTask.mockResolvedValueOnce();
      const res = mockRes();
      await removeTask(mockReq({ params: { id: '7' } }), res, next);
      expect(MockedTaskService.deleteTask).toHaveBeenCalledWith('7');
      expect(res.redirect).toHaveBeenCalledWith('/tasks');
    });

    it('calls next(error) when the service throws', async () => {
      MockedTaskService.deleteTask.mockRejectedValueOnce(new Error());
      const res = mockRes();
      await removeTask(mockReq({ params: { id: '7' } }), res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('showEditTaskForm', () => {
    it('fetches the task and renders the edit form with parsed date fields', async () => {
      MockedTaskService.getTaskById.mockResolvedValueOnce(sampleTask);
      const res = mockRes();
      await showEditTaskForm(mockReq({ params: { id: '3' } }), res, next);
      expect(res.render).toHaveBeenCalledWith(
        'taskmanagement/task-form',
        expect.objectContaining({
          method: 'put',
          action: '/tasks/3',
          data: expect.objectContaining({
            'dueDate-day': '31',
            'dueDate-month': '12',
            'dueDate-year': '2099',
          }),
        })
      );
    });

    it('calls next(error) when the service throws', async () => {
      MockedTaskService.getTaskById.mockRejectedValueOnce(new Error());
      const res = mockRes();
      await showEditTaskForm(mockReq({ params: { id: '3' } }), res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('showTaskDetails', () => {
    it('fetches the task and renders the details view', async () => {
      MockedTaskService.getTaskById.mockResolvedValueOnce(sampleTask);
      const res = mockRes();
      await showTaskDetails(mockReq({ params: { id: '2' } }), res, next);
      expect(res.render).toHaveBeenCalledWith('taskmanagement/view-task-details', {
        data: sampleTask,
      });
    });

    it('calls next(error) when the service throws', async () => {
      MockedTaskService.getTaskById.mockRejectedValueOnce(new Error());
      const res = mockRes();
      await showTaskDetails(mockReq({ params: { id: '2' } }), res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateTask', () => {
    const validBody = {
      title: 'Updated',
      description: 'updated desc',
      status: 'done',
      'dueDate-day': '15',
      'dueDate-month': '6',
      'dueDate-year': '2099',
    };

    it('updates the task and redirects on valid input', async () => {
      MockedTaskService.updateTask.mockResolvedValueOnce();
      const res = mockRes();
      await updateTask(mockReq({ params: { id: '4' }, body: validBody }), res, next);
      expect(MockedTaskService.updateTask).toHaveBeenCalledWith(
        '4',
        expect.objectContaining({ title: 'Updated', status: 'done' })
      );
      expect(res.redirect).toHaveBeenCalledWith('/tasks');
    });

    it('re-renders the form with errors on invalid input', async () => {
      const res = mockRes();
      await updateTask(mockReq({ params: { id: '4' }, body: { ...validBody, title: '' } }), res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith(
        'taskmanagement/task-form',
        expect.objectContaining({ errors: expect.objectContaining({ title: expect.any(String) }) })
      );
    });

    it('calls next(error) when the service throws', async () => {
      MockedTaskService.updateTask.mockRejectedValueOnce(new Error());
      const res = mockRes();
      await updateTask(mockReq({ params: { id: '4' }, body: validBody }), res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
