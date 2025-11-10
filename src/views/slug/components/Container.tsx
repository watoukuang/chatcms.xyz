import React from 'react';

type Props = {
  children: React.ReactNode;
};

const Container: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-b dark:from-[#0f1115] dark:via-[#0f1115] dark:to-[#0b0d12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10">
        {children}
      </div>
    </div>
  );
};

export default Container;
