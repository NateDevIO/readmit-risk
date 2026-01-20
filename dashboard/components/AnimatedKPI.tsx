// components/AnimatedKPI.tsx
'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedKPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  colorClass?: string;
}

function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;
    countRef.current = start;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(start + (end - start) * easeOutQuart);

      setCount(currentCount);
      countRef.current = currentCount;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
}

export default function AnimatedKPI({
  title,
  value,
  subtitle,
  prefix = '',
  suffix = '',
  duration = 2000,
  colorClass = 'text-gray-900',
}: AnimatedKPIProps) {
  // Parse numeric value
  const numericValue = typeof value === 'string'
    ? parseFloat(value.replace(/[^0-9.-]/g, ''))
    : value;

  const isNumeric = !isNaN(numericValue);
  const animatedValue = useCountUp(isNumeric ? numericValue : 0, duration);

  // Format based on original value format
  const formatValue = (num: number) => {
    if (typeof value === 'string') {
      if (value.includes('M')) return `${(num / 1000000).toFixed(1)}M`;
      if (value.includes('K')) return `${(num / 1000).toFixed(0)}K`;
      if (value.includes('%')) return `${num}%`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${colorClass} transition-all duration-300`}>
        {prefix}
        {isNumeric ? formatValue(animatedValue) : value}
        {suffix}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
