import React from 'react';
import TodoPanel from '@/src/views/schedule/components/TodoPanel';

export default function ScheduleView(): React.ReactElement {
  return (
    <div>
      <TodoPanel
        hourStart={0}
        hourEnd={24}
        showLunchRow
        lunchStart={12}
        useMockData={true}
        useCurrentWeekHeader
        fullDay
      />
    </div>
  );
}