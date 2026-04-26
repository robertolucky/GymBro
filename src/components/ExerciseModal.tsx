import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Trash2, TrendingUp } from 'lucide-react';
import { useGym, Exercise } from '../context/GymContext';
import { getOverloadSuggestion } from '../utils/overload';
type ExerciseModalProps = {
  exercise: Exercise | null;
  onClose: () => void;
};
export function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  const { state, addLog, deleteExercise, updateExercise } = useGym();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingDays, setEditingDays] = useState(false);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('3');
  const [logTarget, setLogTarget] = useState<'both' | string>('both');

  useEffect(() => { setConfirmDelete(false); setEditingDays(false); }, [exercise]);

  const toggleDay = (day: number) => {
    if (!exercise) return;
    const current = exercise.days ?? [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    updateExercise(exercise.id, { days: next });
  };

  // Pre-fill with the last logged values whenever a new exercise is opened
  useEffect(() => {
    if (!exercise) return;
    const userId = logTarget === 'both' ? state.activeUserId : logTarget;
    const lastLog = state.logs
      .filter((l) => l.exerciseId === exercise.id && l.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    setWeight(lastLog ? String(lastLog.weight) : '');
    setReps(lastLog ? String(lastLog.reps) : '');
    setSets(lastLog ? String(lastLog.sets) : '3');
  }, [exercise]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise || !weight || !reps) return;
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    const s = parseInt(sets, 10);
    if (logTarget === 'both') {
      state.users.forEach((user) => {
        addLog({
          exerciseId: exercise.id,
          userId: user.id,
          weight: w,
          reps: r,
          sets: s
        });
      });
    } else {
      addLog({
        exerciseId: exercise.id,
        userId: logTarget,
        weight: w,
        reps: r,
        sets: s
      });
    }
    setWeight('');
    setReps('');
    setSets('3');
    setLogTarget('both');
    onClose();
  };
  const getTargetLabel = () => {
    if (logTarget === 'both') return 'Both';
    return state.users.find((u) => u.id === logTarget)?.name ?? '';
  };
  return (
    <AnimatePresence>
      {exercise &&
      <>
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        
          <motion.div
          initial={{
            y: '100%'
          }}
          animate={{
            y: 0
          }}
          exit={{
            y: '100%'
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 200
          }}
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
          
            <div className="w-full max-w-md bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {exercise.name}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Logging for {getTargetLabel()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {confirmDelete ? (
                    <>
                      <button
                        type="button"
                        onClick={() => { deleteExercise(exercise.id); onClose(); }}
                        className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-colors">
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={onClose}
                        className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progressive overload suggestion */}
              {(() => {
                const userId = logTarget === 'both' ? state.activeUserId : logTarget;
                const suggestion = getOverloadSuggestion(exercise.id, userId, state.logs, state.units);
                if (!suggestion) return null;
                return (
                  <div className="flex items-start gap-3 bg-lime-400/10 border border-lime-400/30 rounded-xl px-4 py-3 mb-5">
                    <TrendingUp className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-lime-400 text-xs font-bold uppercase tracking-wider mb-0.5">Ready to progress</p>
                      <p className="text-white text-sm">{suggestion.message}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2 mb-5">
                <button
                type="button"
                onClick={() => setLogTarget('both')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${logTarget === 'both' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                
                  <Users className="w-3.5 h-3.5" />
                  Both
                </button>
                {state.users.map((user) =>
              <button
                key={user.id}
                type="button"
                onClick={() => setLogTarget(user.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${logTarget === user.id ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                
                    <div className={`w-2.5 h-2.5 rounded-full ${user.color}`} />
                    {user.name}
                  </button>
              )}
              </div>

              {/* Day assignment */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Training Days</span>
                  <button
                    type="button"
                    onClick={() => setEditingDays((v) => !v)}
                    className="text-xs text-lime-400 hover:text-lime-300 transition-colors">
                    {editingDays ? 'Done' : 'Edit'}
                  </button>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: state.routineDays }, (_, i) => i + 1).map((day) => {
                    const active = exercise.days?.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={!editingDays}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${active ? 'bg-lime-400 text-zinc-950' : 'bg-zinc-800 text-zinc-500'} ${editingDays ? 'cursor-pointer' : 'cursor-default'}`}>
                        D{day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                      Weight ({state.units})
                    </label>
                    <input
                    type="number"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
                    placeholder="0.0"
                    required
                    autoFocus />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                      Reps
                    </label>
                    <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
                    placeholder="0"
                    required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                      Sets
                    </label>
                    <input
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
                    placeholder="3"
                    required />
                  </div>
                </div>

                <button
                type="submit"
                className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-bold py-4 rounded-xl mt-4 transition-colors active:scale-[0.98]">
                
                  Save Set
                </button>
              </form>
            </div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}