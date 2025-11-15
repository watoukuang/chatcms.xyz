import React from 'react';
import {Form, Input, Select, Space} from 'antd';
import {FormInstance} from 'antd/lib/form';

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
    form: FormInstance;
    weekDayHeaders: WeekDayHeader[];
    timeOptions: TimeOption[];
    stateOptions: StateOption[];
    users: User[];
}

const HForm: React.FC<HFormProps> = (props) => {
    const {form, weekDayHeaders, timeOptions, stateOptions, users} = props;
    return (
        <Form form={form} layout="vertical">
            <Form.Item name="task" label="任务内容" rules={[
                {required: true, message: '请输入任务内容'},
                {max: 255, message: '任务内容不能超过255个字符'}
            ]}>
                <Input.TextArea rows={8} maxLength={255} showCount/>
            </Form.Item>
            <Form.Item name="remark" label="备注">
                <Input.TextArea rows={10} placeholder="可选，添加任务备注"/>
            </Form.Item>
            <Space align="baseline" style={{display: 'flex', width: '100%'}}>
                <Form.Item name="taskTime" label="日期" rules={[{required: true}]} style={{flex: 1}}>
                    <Select options={weekDayHeaders.map(day => ({label: day.title, value: day.date}))}/>
                </Form.Item>
                <Form.Item
                    label="开始时间"
                    name="startTime"
                    rules={[{required: true, message: '请选择开始时间'}]}
                    style={{flex: 1}}
                >
                    <Select
                        options={timeOptions.filter(opt => opt.value !== '23:00')}
                        onChange={() => form.setFieldsValue({endTime: undefined})}
                    />
                </Form.Item>
                <Form.Item
                    label="结束时间"
                    name="endTime"
                    rules={[
                        {required: true, message: '请选择结束时间'},
                        ({getFieldValue}) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('startTime') < value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('结束时间必须晚于开始时间'));
                            }
                        })
                    ]}
                    style={{flex: 1}}
                >
                    <Select
                        options={timeOptions
                            // 基本排除：结束时间不应以 08:00 或 13:00 作为候选的起点
                            .filter(opt => opt.value !== '08:00' && opt.value !== '13:00')
                            // 必须晚于开始时间（若未选择开始时间，则以 '00:00' 为基准）
                            .filter(opt => opt.value > (form.getFieldValue('startTime') || '00:00'))
                        }
                    />
                </Form.Item>
            </Space>
            <Form.Item name="state" label="状态" initialValue="pending"
                       rules={[{required: true, message: '请选择状态'}]}>
                <Select options={stateOptions}/>
            </Form.Item>
        </Form>
    );
};

export default HForm;
