import React from 'react';
import { Task } from '@/types/app/scrum';

interface TaskCardProps {
    task: Task;
    stateInfo: {
        color: string;
        text: string;
    };
    isPastWeek: boolean;
    handleEdit: (task: Task) => void;
}

const TCard: React.FC<TaskCardProps> = (props) => {
    const {task, stateInfo, isPastWeek, handleEdit} = props;

    // 文本截断函数
    const truncateText = (text: string, maxLength: number = 28): string => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // 事件处理函数
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPastWeek) {
            e.currentTarget.style.transform = 'translateZ(2px)';
            e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15)';
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.transform = 'translateZ(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    };

    // 卡片容器样式
    const cardContainerStyle = {
        textAlign: 'left' as const,
        background: `linear-gradient(135deg, ${stateInfo.color} 0%, ${stateInfo.color}dd 100%)`,
        height: 80,
        borderRadius: '5px',
        width: '90%',
        overflow: 'auto',
        color: '#fff',
        padding: '10px 15px',
        cursor: 'pointer',
        display: 'flex' as const,
        alignItems: 'center' as const,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        fontSize: '15px',
        fontWeight: 500 as const,
        transition: 'all 0.2s ease'
    };

    // 文本内容样式
    const textContentStyle = {
        wordWrap: 'break-word' as const,
        wordBreak: 'break-word' as const,
        whiteSpace: 'normal' as const,
        lineHeight: '1.4'
    };

    // 判断是否需要截断文本
    const displayText = truncateText(task.task || '');

    return (
        <div
            onClick={() => handleEdit(task)}
            style={cardContainerStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={textContentStyle}>
                {displayText}
            </div>
        </div>
    );
};

export default TCard;
