import { Task, TaskQueryParams } from '@/types/app/scrum';
import { R } from '@/src/shared/types/response';

// Stub API functions for scrum tasks
export async function getTasksAPI(params: TaskQueryParams): Promise<R<Task[]>> {
  // TODO: Implement actual API call
  return {
    success: true,
    data: [],
    message: null,
    code: 200
  };
}

export async function addTaskAPI(task: Task): Promise<R<Task>> {
  // TODO: Implement actual API call
  return {
    success: true,
    data: task,
    message: 'Task added successfully',
    code: 200
  };
}

export async function updateTaskAPI(task: Task): Promise<R<Task>> {
  // TODO: Implement actual API call
  return {
    success: true,
    data: task,
    message: 'Task updated successfully',
    code: 200
  };
}
