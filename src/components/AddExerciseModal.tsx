import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useGym } from '../context/GymContext';
type AddExerciseModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
const muscleGroups = ['Chest', 'Legs', 'Back', 'Shoulders', 'Arms', 'Core'];
export function AddExerciseModal({ isOpen, onClose }: AddExerciseModalProps) {
  const { state, addExercise } = useGym();
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
    prev.includes(day) ?
    prev.filter((d) => d !== day) :
    [...prev, day].sort()
    );
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedDays.length === 0) return;
    addExercise({
      name: name.trim(),
      muscleGroup,
      iconName: 'Dumbbell',
      days: selectedDays
    });
    setName('');
    setMuscleGroup('Chest');
    setSelectedDays([1]);
    onClose();
  };
  return (
    <AnimatePresence>
      {isOpen &&
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">New Exercise</h3>
                <button
                onClick={onClose}
                className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                    Exercise Name
                  </label>
                  <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
                  placeholder="e.g. Cable Flyes"
                  required
                  autoFocus />
                
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                    Muscle Group
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {muscleGroups.map((group) =>
                  <button
                    key={group}
                    type="button"
                    onClick={() => setMuscleGroup(group)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${muscleGroup === group ? 'bg-lime-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                    
                        {group}
                      </button>
                  )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                    Training Days
                  </label>
                  <div className="flex gap-2">
                    {Array.from(
                    {
                      length: state.routineDays
                    },
                    (_, i) => i + 1
                  ).map((day) =>
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`w-11 h-11 rounded-xl text-sm font-bold transition-colors ${selectedDays.includes(day) ? 'bg-lime-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                    
                        D{day}
                      </button>
                  )}
                  </div>
                </div>

                <button
                type="submit"
                className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-bold py-4 rounded-xl transition-colors active:scale-[0.98]">
                
                  Add Exercise
                </button>
              </form>
            </div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}