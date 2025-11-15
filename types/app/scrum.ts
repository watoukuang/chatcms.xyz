// Scrum task types
export interface Task {
  id?: number;
  userId?: number;
  taskTime?: string;
  startTime?: string;
  endTime?: string;
  task?: string;
  remark?: string;
  state?: 'pending' | 'in-progress' | 'completed' | 'delayed';
  yn?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
}

export interface TaskQueryParams {
  userId?: number;
  startDate?: string;
  endDate?: string;
}
