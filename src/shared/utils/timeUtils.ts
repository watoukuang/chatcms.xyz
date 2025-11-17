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