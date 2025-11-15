'use client';

import {Card} from 'antd';
import {ReactNode} from 'react';

interface Props {
    value: ReactNode,
    children?: ReactNode,
    className?: string
}

export default ({value, children, className}: Props) => {
    return (
        <>
            <Card className={`px-4 mb-2 ${className} mt-2`}>
                <div className="overflow-auto flex justify-between items-center h-14">
                    <h2 className="font-semibold text-black dark:text-white text-xl min-w-24">{value}</h2>
                    <div className="flex items-center gap-1">
                        {children}
                    </div>
                </div>
            </Card>
        </>
    );
}