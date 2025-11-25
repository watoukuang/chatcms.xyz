import moment from 'moment';

/**
 * 自适应时间刻度工具
 * 根据任务的实际时间粒度，动态计算最合适的时间刻度
 */

export type TimeGranularity = 'hour' | '30min' | '15min' | '5min' | '1min';

export interface TimeScale {
    granularity: TimeGranularity;
    interval: number; // 分钟数
    label: string;
}

/**
 * 将时间字符串转换为分钟数
 */
const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
};

/**
 * 检测任务列表中使用的最小时间粒度
 * @param tasks 任务列表
 * @returns 最小时间粒度（分钟）
 */
export const detectMinGranularity = (tasks: Array<{ startTime?: string; endTime?: string }>): number => {
    let minGranularity = 60; // 默认小时级

    tasks.forEach(task => {
        if (!task.startTime || !task.endTime) return;

        const startMinutes = timeToMinutes(task.startTime);
        const endMinutes = timeToMinutes(task.endTime);

        // 检查开始时间的分钟部分
        const startMod = startMinutes % 60;
        if (startMod !== 0) {
            // 有分钟级数据
            if (startMod % 30 === 0) {
                minGranularity = Math.min(minGranularity, 30);
            } else if (startMod % 15 === 0) {
                minGranularity = Math.min(minGranularity, 15);
            } else if (startMod % 5 === 0) {
                minGranularity = Math.min(minGranularity, 5);
            } else {
                minGranularity = 1; // 任意分钟
            }
        }

        // 检查结束时间的分钟部分
        const endMod = endMinutes % 60;
        if (endMod !== 0) {
            if (endMod % 30 === 0) {
                minGranularity = Math.min(minGranularity, 30);
            } else if (endMod % 15 === 0) {
                minGranularity = Math.min(minGranularity, 15);
            } else if (endMod % 5 === 0) {
                minGranularity = Math.min(minGranularity, 5);
            } else {
                minGranularity = 1;
            }
        }
    });

    return minGranularity;
};

/**
 * 根据任务列表自动选择最合适的时间刻度
 * @param tasks 任务列表
 * @returns 时间刻度配置
 */
export const getAdaptiveTimeScale = (tasks: Array<{ startTime?: string; endTime?: string }>): TimeScale => {
    const minGranularity = detectMinGranularity(tasks);

    if (minGranularity === 1) {
        return { granularity: '5min', interval: 5, label: '5分钟' }; // 1分钟太密集，用5分钟
    } else if (minGranularity <= 5) {
        return { granularity: '5min', interval: 5, label: '5分钟' };
    } else if (minGranularity <= 15) {
        return { granularity: '15min', interval: 15, label: '15分钟' };
    } else if (minGranularity <= 30) {
        return { granularity: '30min', interval: 30, label: '30分钟' };
    } else {
        return { granularity: 'hour', interval: 60, label: '1小时' };
    }
};

/**
 * 生成自适应时间刻度数组
 * @param startHour 开始小时
 * @param endHour 结束小时
 * @param interval 间隔（分钟）
 * @returns 时间刻度数组 ['09:00', '09:15', '09:30', ...]
 */
export const generateAdaptiveTimeSlots = (
    startHour: number = 0,
    endHour: number = 24,
    interval: number = 60
): string[] => {
    const slots: string[] = [];
    const startMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    }

    return slots;
};

/**
 * 生成时间段数组（带结束时间）
 * @param startHour 开始小时
 * @param endHour 结束小时
 * @param interval 间隔（分钟）
 * @returns 时间段数组 ['09:00-09:15', '09:15-09:30', ...]
 */
export const generateAdaptiveTimeRanges = (
    startHour: number = 0,
    endHour: number = 24,
    interval: number = 60
): string[] => {
    const slots = generateAdaptiveTimeSlots(startHour, endHour, interval);
    return slots.map((start, index) => {
        if (index === slots.length - 1) {
            // 最后一个时间段
            const endTime = moment(start, 'HH:mm').add(interval, 'minutes').format('HH:mm');
            return `${start}-${endTime}`;
        }
        return `${start}-${slots[index + 1]}`;
    });
};

/**
 * 计算建议对齐时间（智能吸附）
 * @param time 原始时间 HH:mm
 * @param interval 对齐间隔（分钟）
 * @returns 对齐后的时间
 */
export const suggestAlignedTime = (time: string, interval: number = 15): string => {
    const minutes = timeToMinutes(time);
    const aligned = Math.round(minutes / interval) * interval;
    const hours = Math.floor(aligned / 60);
    const mins = aligned % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * 计算任务在时间轴上的位置和高度（用于精确渲染）
 * @param startTime 开始时间 HH:mm
 * @param endTime 结束时间 HH:mm
 * @param slotHeight 单个时间槽的高度（px）
 * @param slotInterval 时间槽间隔（分钟）
 * @param baseTime 基准时间（默认 00:00）
 * @returns { top: number, height: number } 像素值
 */
export const calculateTaskPosition = (
    startTime: string,
    endTime: string,
    slotHeight: number = 60,
    slotInterval: number = 60,
    baseTime: string = '00:00'
): { top: number; height: number } => {
    const baseMinutes = timeToMinutes(baseTime);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    const offsetMinutes = startMinutes - baseMinutes;
    const durationMinutes = endMinutes - startMinutes;

    const top = (offsetMinutes / slotInterval) * slotHeight;
    const height = (durationMinutes / slotInterval) * slotHeight;

    return { top, height };
};

/**
 * 判断是否需要显示辅助刻度线
 * @param granularity 当前刻度粒度
 * @returns 是否显示辅助线
 */
export const shouldShowSubGrid = (granularity: TimeGranularity): boolean => {
    return granularity !== 'hour'; // 小时级不需要辅助线
};

/**
 * 生成辅助刻度线位置（用于在主刻度之间显示更细的线）
 * @param interval 主刻度间隔（分钟）
 * @returns 辅助线的相对位置数组（0-1之间的比例）
 */
export const getSubGridPositions = (interval: number): number[] => {
    if (interval === 60) {
        // 小时级：显示 15 分钟辅助线
        return [0.25, 0.5, 0.75];
    } else if (interval === 30) {
        // 30分钟级：显示 10 分钟辅助线
        return [0.33, 0.67];
    } else if (interval === 15) {
        // 15分钟级：显示 5 分钟辅助线
        return [0.33, 0.67];
    }
    return [];
};
