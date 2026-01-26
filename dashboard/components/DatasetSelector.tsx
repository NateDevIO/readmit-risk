'use client';

import { Dataset } from '@/lib/data';

interface DatasetSelectorProps {
  currentDataset: Dataset;
  onDatasetChange: (dataset: Dataset) => void;
}

export default function DatasetSelector({ currentDataset, onDatasetChange }: DatasetSelectorProps) {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onDatasetChange('uci')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentDataset === 'uci'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        UCI Diabetes
        <span className="block text-xs opacity-75 mt-0.5">1999-2008</span>
      </button>
      <button
        onClick={() => onDatasetChange('mimic')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentDataset === 'mimic'
            ? 'bg-green-600 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        MIMIC-IV
        <span className="block text-xs opacity-75 mt-0.5">2008-2019</span>
      </button>
    </div>
  );
}
