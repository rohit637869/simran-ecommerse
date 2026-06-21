"use client";

import { useState, useEffect } from "react";

export default function UpcomingCollectionTimer({
  launchDate,
  small,
}: {
  launchDate: string;
  small?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(launchDate).getTime();

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

  if (!mounted) return null;

  const totalSeconds =
    timeLeft.days * 86400 +
    timeLeft.hours * 3600 +
    timeLeft.minutes * 60 +
    timeLeft.seconds;

  if (totalSeconds <= 0) {
    return (
      <p
        className={`${
          small ? "text-xs mt-2" : "text-sm"
        } text-[#C9956C] tracking-wider uppercase`}
      >
        Launching Now
      </p>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  if (small) {
    return (
      <div className="flex items-center gap-2 mt-2">
        {units.map((unit) => (
          <div key={unit.label} className="text-center">
            <span className="text-sm font-mono text-[#C9956C]">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-[#6B6460] ml-0.5">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs tracking-[0.2em] uppercase text-[#F5F0EB]/40 mb-3">
        Launching in
      </p>
      <div className="flex items-center gap-4">
        {units.map((unit) => (
          <div key={unit.label} className="text-center">
            <div className="bg-[#080808]/60 backdrop-blur-sm border border-white/10 px-4 py-2.5 min-w-[70px]">
              <span className="text-2xl md:text-3xl font-mono text-[#F5F0EB]">
                {String(unit.value).padStart(2, "0")}
              </span>
            </div>
            <p className="text-[10px] tracking-wider uppercase text-[#6B6460] mt-1">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
