import moment from 'moment';

/**
 * 生成全天24小时的时间数组
 * @returns 时间数组 ['00:00', '01:00', ..., '23:00']
 */
export const generateFullDayHours = (): string[] => {
    return Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);
};

/**
 * 生成时间表格的时间段数组
 * @returns 时间段数组 ['00:00-01:00', '01:00-02:00', ...]
 */
export const generateTimeTableSlots = (): string[] => {
    const fullDayHours = generateFullDayHours();
    return fullDayHours.map(start => {
        const end = moment(start, 'HH:mm').add(1, 'hour').format('HH:mm');
        return `${start}-${end}`;
    });
};

/**
 * 生成周日期头部信息
 * @param currentDate 当前日期
 * @returns 周日期头部数组
 */
export const generateWeekHeaders = (currentDate: moment.Moment) => {
    const startOfWeek = currentDate.clone().startOf('isoWeek');
    return Array.from({length: 7}, (_, i) => {
        const day = startOfWeek.clone().add(i, 'days');
        const dayName = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'][i];
        return {
            title: `${dayName} (${day.format('MM/DD')})`,
            date: day.format('YYYY-MM-DD')
        };
    });
};

/**
 * 计算任务跨行映射（用于表格 rowSpan）
 * @param tasks 任务列表
 * @param weekDayHeaders 周日期头部
 * @param timeTableSlots 时间段数组
 * @returns skipMap 对象
 */
export const calculateSkipMap = (
    tasks: any[],
    weekDayHeaders: { date: string }[],
    timeTableSlots: string[]
): Record<string, Record<number, boolean>> => {
    const map: Record<string, Record<number, boolean>> = {};
    weekDayHeaders.forEach(h => (map[h.date] = {}));

    tasks.forEach(t => {
        if (!t.taskTime || !t.startTime || !t.endTime) return;
        const date = t.taskTime;
        const startIdx = timeTableSlots.findIndex(s => s.startsWith(`${t.startTime}-`));
        const hours = moment(t.endTime, 'HH:mm').diff(moment(t.startTime, 'HH:mm'), 'hours');
        if (startIdx >= 0 && hours > 1) {
            for (let i = 1; i < hours; i++) {
                map[date] && (map[date][startIdx + i] = true);
            }
        }
    });

    return map;
};
