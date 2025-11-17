import React from 'react';

export interface User {
    name: string;
    id: string | number;
}

export interface DataType {
    key: React.Key;
    time: string;
}

export interface WeekDayHeader {
    title: string;
    date: string;
}

export interface TimeOption {
    label: string;
    value: string;
}

export interface StateOption {
    label: string;
    value: string;
    color: string;
}

interface HFormProps {
    values: {
        userId?: number;
        task?: string;
        remark?: string;
        taskTime?: string;
        startTime?: string;
        endTime?: string;
        state?: string;
    };
    errors?: Partial<Record<keyof HFormProps['values'], string>>;
    onChange: (field: keyof HFormProps['values'], value: any) => void;
    weekDayHeaders: WeekDayHeader[];
    timeOptions: TimeOption[];
    stateOptions: StateOption[];
    users: User[];
}

const Mform: React.FC<HFormProps> = (props) => {
    const {values, errors, onChange, weekDayHeaders, timeOptions, stateOptions, users} = props;
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">任务内容</label>
                <textarea
                    value={values.task || ''}
                    onChange={(e) => onChange('task', e.target.value)}
                    maxLength={255}
                    rows={8}
                    className="border rounded px-3 py-2 text-sm w-full"
                    placeholder="请输入任务内容"
                />
                {errors?.task && <div className="text-xs text-red-600 mt-1">{errors.task}</div>}
            </div>

            <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">备注</label>
                <textarea
                    value={values.remark || ''}
                    onChange={(e) => onChange('remark', e.target.value)}
                    rows={6}
                    className="border rounded px-3 py-2 text-sm w-full"
                    placeholder="可选，添加任务备注"
                />
            </div>

            <div className="flex items-start gap-4 w-full">
                <div className="flex-1 flex flex-col">
                    <label className="text-sm text-gray-700 mb-1">日期</label>
                    <select
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={values.taskTime || ''}
                        onChange={(e) => onChange('taskTime', e.target.value)}
                    >
                        <option value="" disabled>请选择日期</option>
                        {weekDayHeaders.map(day => (
                            <option key={day.date} value={day.date}>{day.title}</option>
                        ))}
                    </select>
                    {errors?.taskTime && <div className="text-xs text-red-600 mt-1">{errors.taskTime}</div>}
                </div>
                <div className="flex-1 flex flex-col">
                    <label className="text-sm text-gray-700 mb-1">开始时间</label>
                    <select
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={values.startTime || ''}
                        onChange={(e) => onChange('startTime', e.target.value)}
                    >
                        <option value="" disabled>请选择开始时间</option>
                        {timeOptions.filter(opt => opt.value !== '23:00').map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {errors?.startTime && <div className="text-xs text-red-600 mt-1">{errors.startTime}</div>}
                </div>
                <div className="flex-1 flex flex-col">
                    <label className="text-sm text-gray-700 mb-1">结束时间</label>
                    <select
                        className="border rounded px-3 py-2 text-sm w-full"
                        value={values.endTime || ''}
                        onChange={(e) => onChange('endTime', e.target.value)}
                    >
                        <option value="" disabled>请选择结束时间</option>
                        {timeOptions
                            .filter(opt => opt.value !== '08:00' && opt.value !== '13:00')
                            .filter(opt => opt.value > (values.startTime || '00:00'))
                            .map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                    </select>
                    {errors?.endTime && <div className="text-xs text-red-600 mt-1">{errors.endTime}</div>}
                </div>
            </div>

            <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">状态</label>
                <select
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={values.state || 'pending'}
                    onChange={(e) => onChange('state', e.target.value)}
                >
                    {stateOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {errors?.state && <div className="text-xs text-red-600 mt-1">{errors.state}</div>}
            </div>
        </div>
    );
};

export default Mform;
