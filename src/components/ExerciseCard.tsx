import { Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Exercise, useGym } from '../context/GymContext';

type ExerciseCardProps = {
  exercise: Exercise;
  sessionsMissed: number;
  onClick: () => void;
};
export function ExerciseCard({ exercise, sessionsMissed, onClick }: ExerciseCardProps) {
  const { state } = useGym();

  // Gauge: 0 sessions missed = full green, 3+ = full red
  const MAX_SESSIONS = 3;
  const fill = Math.max(0, 1 - sessionsMissed / MAX_SESSIONS); // 1.0 → 0.0
  const gaugeColor =
    fill > 0.66 ? '#a3e635' :   // lime
    fill > 0.33 ? '#fb923c' :   // orange
    '#f87171';                   // red (includes never done)
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
          <Dumbbell className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">
            {exercise.muscleGroup}
          </span>
          {/* Freshness gauge: 4 segments */}
          <div className="flex gap-0.5">
            {Array.from({ length: MAX_SESSIONS + 1 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    i < (MAX_SESSIONS + 1) - sessionsMissed
                      ? gaugeColor
                      : '#3f3f46',
                }}
              />
            ))}
          </div>
        </div>
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

      <div className="mt-auto">
        {(() => {
          const latestLog = getLatestLog(state.activeUserId);
          return latestLog ? (
            <span className="text-white font-bold whitespace-nowrap text-sm">
              {latestLog.weight}{state.units} × {latestLog.reps} × {latestLog.sets}
            </span>
          ) : (
            <span className="text-zinc-600 text-sm">No logs yet</span>
          );
        })()}
      </div>
    </motion.div>);

}