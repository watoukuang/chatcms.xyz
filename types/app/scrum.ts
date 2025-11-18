// Scrum task types
export interface Task {
    id?: number;
    taskTime?: string;
    startTime?: string;
    endTime?: string;
    task?: string;
    remark?: string;
    state?: 'pending' | 'in-progress' | 'completed' | 'delayed';
}


export interface TaskQueryParams {
    startDate?: string;
    endDate?: string;
}
