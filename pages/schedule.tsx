import React from 'react';
import Head from 'next/head';
import ScheduleView from '@/src/views/schedule';

export default function SchedulePage(): React.ReactElement {
  return (
    <>
      <Head>
        <title>固定日程 - AiTodo</title>
      </Head>
      <ScheduleView />
    </>
  );
}