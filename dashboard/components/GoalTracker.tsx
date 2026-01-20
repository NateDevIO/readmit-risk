// components/GoalTracker.tsx
'use client';

import { useState } from 'react';

interface GoalTrackerProps {
  currentHighRiskCount: number;
  currentCostExposure: number;
}

export default function GoalTracker({
  currentHighRiskCount,
  currentCostExposure,
}: GoalTrackerProps) {
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: 'Reduce Critical Risk Patients',
      target: 15,
      current: 8,
      unit: '%',
      deadline: 'Q2 2026',
    },
    {
      id: 2,
      name: 'Increase Intervention Enrollment',
      target: 500,
      current: 312,
      unit: 'patients',
      deadline: 'Q1 2026',
    },
    {
      id: 3,
      name: 'Post-Discharge Contact Rate',
      target: 90,
      current: 72,
      unit: '%',
      deadline: 'Q2 2026',
    },
  ]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  const addGoal = () => {
    if (newGoalName && newGoalTarget) {
      setGoals([
        ...goals,
        {
          id: Date.now(),
          name: newGoalName,
          target: Number(newGoalTarget),
          current: 0,
          unit: '%',
          deadline: 'TBD',
        },
      ]);
      setNewGoalName('');
      setNewGoalTarget('');
      setShowAddGoal(false);
    }
  };

  const updateProgress = (id: number, increment: number) => {
    setGoals(goals.map(g =>
      g.id === id
        ? { ...g, current: Math.max(0, Math.min(g.target, g.current + increment)) }
        : g
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Goal Tracking</h2>
          <p className="text-sm text-gray-500">Monitor progress toward targets</p>
        </div>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Goal name"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Target value"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addGoal}
              className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setShowAddGoal(false)}
              className="text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const isComplete = progress >= 100;
          const isOnTrack = progress >= 50;

          return (
            <div key={goal.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <span className="text-green-500 text-lg">✓</span>
                  ) : (
                    <span className="text-gray-300 text-lg">○</span>
                  )}
                  <span className="font-medium text-gray-900">{goal.name}</span>
                </div>
                <span className="text-xs text-gray-500">Due: {goal.deadline}</span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                    isComplete ? 'bg-green-500' : isOnTrack ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {goal.current} / {goal.target} {goal.unit}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateProgress(goal.id, -5)}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm"
                  >
                    -
                  </button>
                  <span className={`text-sm font-bold ${
                    isComplete ? 'text-green-600' : isOnTrack ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {progress.toFixed(0)}%
                  </span>
                  <button
                    onClick={() => updateProgress(goal.id, 5)}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t flex justify-between text-sm">
        <span className="text-gray-500">
          {goals.filter(g => (g.current / g.target) >= 1).length} of {goals.length} goals complete
        </span>
        <span className="text-blue-600 font-medium">
          Avg progress: {(goals.reduce((sum, g) => sum + (g.current / g.target) * 100, 0) / goals.length).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
