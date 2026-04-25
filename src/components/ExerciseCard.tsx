import React from 'react';
import {
  Dumbbell,
  Activity,
  ArrowUpCircle,
  ArrowUp,
  ArrowDown,
  MoveHorizontal,
  Minus } from
'lucide-react';
import { motion } from 'framer-motion';
import { Exercise, useGym } from '../context/GymContext';
const iconMap: Record<string, React.ElementType> = {
  Dumbbell,
  Activity,
  ArrowUpCircle,
  ArrowUp,
  ArrowDown,
  MoveHorizontal,
  Minus
};
type ExerciseCardProps = {
  exercise: Exercise;
  onClick: () => void;
};
export function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  const { state } = useGym();
  const Icon = iconMap[exercise.iconName] || Dumbbell;
  // Get latest log for each user
  const getLatestLog = (userId: string) => {
    const userLogs = state.logs.
    filter((l) => l.exerciseId === exercise.id && l.userId === userId).
    sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return userLogs[0];
  };
  return (
    <motion.div
      whileHover={{
        scale: 1.02
      }}
      whileTap={{
        scale: 0.98
      }}
      onClick={onClick}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-zinc-700 transition-colors flex flex-col h-full">
      
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-zinc-800 rounded-xl text-lime-400">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">
          {exercise.muscleGroup}
        </span>
      </div>

      {exercise.days && exercise.days.length > 0 &&
      <div className="flex gap-1 mb-3">
          {exercise.days.map((day) =>
        <span
          key={day}
          className="text-[10px] font-bold text-lime-400/70 bg-lime-400/10 px-1.5 py-0.5 rounded">
          
              D{day}
            </span>
        )}
        </div>
      }

      <h3 className="text-white font-bold text-lg mb-4 flex-grow">
        {exercise.name}
      </h3>

      <div className="space-y-2 mt-auto">
        {state.users.map((user) => {
          const latestLog = getLatestLog(user.id);
          return (
            <div
              key={user.id}
              className="flex justify-between items-center text-sm">
              
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user.color}`} />
                <span className="text-zinc-400">{user.name}</span>
              </div>
              <span className="text-white font-medium">
                {latestLog ?
                `${latestLog.weight}${state.units} × ${latestLog.reps}` :
                '-'}
              </span>
            </div>);

        })}
      </div>
    </motion.div>);

}