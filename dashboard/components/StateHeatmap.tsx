// components/StateHeatmap.tsx
'use client';

import { useState, useMemo } from 'react';
import { StateData, formatCurrency } from '@/lib/data';

interface StateHeatmapProps {
  stateData: StateData[];
}

export default function StateHeatmap({ stateData }: StateHeatmapProps) {
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [sortBy, setSortBy] = useState<'rate' | 'penalty'>('rate');

  const sortedStates = useMemo(() => {
    return [...stateData].sort((a, b) => {
      if (sortBy === 'rate') {
        return b.avg_readmission_rate - a.avg_readmission_rate;
      }
      return b.total_penalty_estimate - a.total_penalty_estimate;
    });
  }, [stateData, sortBy]);

  const maxRate = Math.max(...stateData.map((s) => s.avg_readmission_rate || 0));
  const minRate = Math.min(...stateData.map((s) => s.avg_readmission_rate || 0));

  const getHeatColor = (rate: number) => {
    if (!rate || maxRate === minRate) return 'bg-gray-400';
    const normalized = (rate - minRate) / (maxRate - minRate);
    if (normalized > 0.8) return 'bg-red-500';
    if (normalized > 0.6) return 'bg-orange-500';
    if (normalized > 0.4) return 'bg-yellow-500';
    if (normalized > 0.2) return 'bg-lime-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              State Readmission Analysis
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Dataset includes {stateData.length} states: {stateData.map(s => s.state).join(', ')}
            </p>
          </div>
          <div className="flex gap-2">
          <button
            onClick={() => setSortBy('rate')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'rate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            By Rate
          </button>
          <button
            onClick={() => setSortBy('penalty')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'penalty'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            By Penalty
          </button>
        </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-sm">
        <span className="text-gray-500">Readmission Rate:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>High</span>
        </div>
      </div>

      {/* State Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-6">
        {sortedStates.map((state) => (
          <button
            key={state.state}
            onClick={() => setSelectedState(state)}
            className={`
              ${getHeatColor(state.avg_readmission_rate)}
              p-2 rounded-lg text-white text-sm font-bold
              hover:ring-2 hover:ring-blue-400 hover:ring-offset-2
              transition-all duration-200
              ${selectedState?.state === state.state ? 'ring-2 ring-blue-600 ring-offset-2' : ''}
            `}
            title={`${state.name}: ${state.avg_readmission_rate?.toFixed(1) || 'N/A'}%`}
          >
            {state.state}
          </button>
        ))}
      </div>

      {/* Selected State Details */}
      {selectedState ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-3">
            {selectedState.name}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Avg Readmission Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {selectedState.avg_readmission_rate?.toFixed(1) || 'N/A'}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hospitals</p>
              <p className="text-xl font-bold text-gray-900">
                {selectedState.hospital_count?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Est. Total Penalty</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(selectedState.total_penalty_estimate || 0)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
          Click a state to see details
        </div>
      )}
    </div>
  );
}
