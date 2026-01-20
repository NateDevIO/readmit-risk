// components/AnimatedKPI.tsx
'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedKPIProps {
  title: string;
  value: string | number;
  rawValue?: number; // Raw numeric value for animation
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
      const currentCount = start + (end - start) * easeOutQuart;

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

// Format large numbers for display
function formatLargeNumber(num: number, includePrefix: boolean = true): string {
  const prefix = includePrefix ? '$' : '';
  if (num >= 1000000) {
    return `${prefix}${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${prefix}${(num / 1000).toFixed(0)}K`;
  }
  return `${prefix}${num.toFixed(0)}`;
}

export default function AnimatedKPI({
  title,
  value,
  rawValue,
  subtitle,
  prefix = '',
  suffix = '',
  duration = 2000,
  colorClass = 'text-gray-900 dark:text-white',
}: AnimatedKPIProps) {
  // Use rawValue for animation if provided, otherwise try to parse the value
  const numericValue = rawValue !== undefined
    ? rawValue
    : (typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')));

  const isNumeric = !isNaN(numericValue) && numericValue > 0;
  const animatedValue = useCountUp(isNumeric ? numericValue : 0, duration);

  // Format based on original value format or rawValue
  const formatValue = (num: number) => {
    // If rawValue was provided, format based on magnitude
    if (rawValue !== undefined) {
      return formatLargeNumber(num, String(value).includes('$'));
    }
    // For plain numbers, just format with locale
    if (typeof value === 'number') {
      return Math.floor(num).toLocaleString();
    }
    // For string values with specific formats
    if (typeof value === 'string') {
      if (value.includes('%')) return `${Math.floor(num)}%`;
    }
    return Math.floor(num).toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${colorClass} transition-all duration-300`}>
        {prefix}
        {isNumeric ? formatValue(animatedValue) : value}
        {suffix}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
