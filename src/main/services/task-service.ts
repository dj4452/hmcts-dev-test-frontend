// src/services/TaskService.ts
import axios from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

/**
 * Payload shape for task objects exchanged with the API.
 */
export interface TaskPayload {
  title: string;
  description?: string;
  status: string;
  dueDate: string;
}

/**
 * Response shape returned by the createTask API endpoint.
 */
export interface CreateTaskResponse {
  success: boolean;
  data?: TaskPayload;
  message?: string;
}

export default class TaskService {
  /**
   * Fetch all tasks
   */
  static async getAllTasks(): Promise<TaskPayload[]> {
    try {
      const response = await axios.get(`${BASE_URL}/tasks`);
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch tasks');
    }
  }

  /**
   * Post a new task to the backend API
   */
  static async createTask(taskData: TaskPayload): Promise<CreateTaskResponse> {
    try {
      const response = await axios.post(`${BASE_URL}/tasks`, taskData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create task' + error);
    }
  }

  /**
   * Delete a task by ID from the backend API
   */
  static async deleteTask(id: string | number): Promise<void> {
    try {
      await axios.delete(`${BASE_URL}/tasks/${id}`);
    } catch (error) {
      throw new Error('Failed to delete task');
    }
  }

  /**
   * Fetch a single task record by its ID
   */
  static async getTaskById(id: string | number): Promise<TaskPayload> {
    try {
      const response = await axios.get(`${BASE_URL}/tasks/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error('Failed to fetch task details');
    }
  }

  /**
   * Update a task by ID with the provided data
   */
  static async updateTask(id: string | number, taskData: Partial<TaskPayload>): Promise<void> {
    try {
      await axios.put(`${BASE_URL}/tasks/${id}`, taskData);
    } catch (error) {
      throw new Error('Failed to update task');
    }
  }
}
