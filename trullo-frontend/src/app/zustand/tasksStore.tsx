import { create } from 'zustand';
import { API_BASE_URL } from '../config/api';
import { getAuthHeaders } from '../utils/authHeaders';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'to-do' | 'in progress' | 'blocked' | 'done';
  assignedTo: string[];
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTaskData {
  title: string;
  description: string;
  status: 'to-do' | 'in progress' | 'blocked' | 'done';
  assignedTo: string[];
  finishedAt?: Date | null;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'to-do' | 'in progress' | 'blocked' | 'done';
  assignedTo?: string[];
  finishedAt?: Date | null;
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  fetchTaskById: (id: string) => Promise<Task | null>;
  addTask: (taskData: CreateTaskData) => Promise<void>;
  updateTask: (id: string, taskData: UpdateTaskData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const tasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const tasks = await response.json();
      set({ tasks, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ loading: false, error: errorMessage });
      console.error('Error fetching tasks:', error);
    }
  },

  fetchTaskById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }

      const task = await response.json();
      set({ loading: false, error: null });
      return task;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch task';
      set({ loading: false, error: errorMessage });
      console.error('Error fetching task:', error);
      return null;
    }
  },

  addTask: async (taskData: CreateTaskData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create task' }));
        throw new Error(errorData.message || 'Failed to create task');
      }

      const newTask = await response.json();
      set((state) => ({
        tasks: [...state.tasks, newTask],
        loading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      set({ loading: false, error: errorMessage });
      console.error('Error creating task:', error);
      throw error;
    }
  },

  updateTask: async (id: string, taskData: UpdateTaskData) => {
    set({ loading: true, error: null });
    try {
      console.log('Updating task:', id, 'with data:', taskData);
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      console.log('Update response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        console.error('Update task error response:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: Failed to update task`);
      }

      const updatedTask = await response.json();
      console.log('Task updated successfully:', updatedTask);
      set((state) => ({
        tasks: state.tasks.map((task) => (task._id === id ? updatedTask : task)),
        loading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      set({ loading: false, error: errorMessage });
      console.error('Error updating task - Full error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network error - Check if backend is running and CORS is configured correctly');
        throw new Error(`Network error: Could not reach server. Make sure backend is running on ${API_BASE_URL}`);
      }
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      set((state) => ({
        tasks: state.tasks.filter((task) => task._id !== id),
        loading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      set({ loading: false, error: errorMessage });
      console.error('Error deleting task:', error);
      throw error;
    }
  },
}));

export const useTasksStore = tasksStore;

