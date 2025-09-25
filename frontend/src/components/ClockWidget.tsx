// src/components/ClockWidget.tsx
import { useEffect, useState } from "react";

type ClockWidgetProps = {
  clockLog?: {
    clockIn?: string;
    clockOut?: string;
  } | null;
  onPunch?: () => void;
};

const ClockWidget = ({ clockLog }: ClockWidgetProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl justify-between shadow-lg p-6 w-full relative overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 opacity-10 pointer-events-none rounded-xl" />
      <div className="text-gray-600 text-sm z-10">Realtime Insight</div>
      <div className="text-4xl font-extrabold text-gray-900 mt-2 z-10 tracking-widest">
        {time.toLocaleTimeString()}
      </div>
      <div className="mt-2 text-base text-gray-700 z-10">
        Today: {time.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </div>
    </div>
  );
};

export default ClockWidget;