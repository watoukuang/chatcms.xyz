import {generateFullDayHours} from '../utils/timeUtils';

/**
 * 任务状态选项
 */
export const stateOptions = [
    {label: '待处理', value: 'pending', color: '#faad14'},
    {label: '进行中', value: 'in-progress', color: '#1677ff'},
    {label: '已完成', value: 'completed', color: '#52c41a'},
    {label: '已延期', value: 'delayed', color: '#f5222d'}
];

/**
 * 全天时间选项
 */
export const timeOptions = generateFullDayHours().map(time => ({
    label: time,
    value: time
}));
