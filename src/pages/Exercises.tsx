import React, { useMemo, useState } from 'react';
import { Search, Users, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGym, Exercise } from '../context/GymContext';
import { ExerciseCard } from '../components/ExerciseCard';
import { ExerciseModal } from '../components/ExerciseModal';
import { AddExerciseModal } from '../components/AddExerciseModal';
export function Exercises() {
  const { state, setActiveUser } = useGym();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeDayFilter, setActiveDayFilter] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const activeUser = state.users.find((u) => u.id === state.activeUserId);
  const muscleGroups = [
  'All',
  ...Array.from(new Set(state.exercises.map((e) => e.muscleGroup)))];

  const filteredExercises = useMemo(() => {
    // All workout session dates for the active user (newest first)
    const sessionDates = Array.from(
      new Set(
        state.logs
          .filter((l) => l.userId === state.activeUserId)
          .map((l) => l.date.split('T')[0])
      )
    ).sort((a, b) => b.localeCompare(a));

    // For each exercise: how many sessions ago was it last done?
    const sessionsMissed = (exerciseId: string): number => {
      const lastLogDate = state.logs
        .filter((l) => l.exerciseId === exerciseId && l.userId === state.activeUserId)
        .map((l) => l.date.split('T')[0])
        .sort((a, b) => b.localeCompare(a))[0];
      if (!lastLogDate) return sessionDates.length; // never done
      const idx = sessionDates.indexOf(lastLogDate);
      return idx === -1 ? sessionDates.length : idx;
    };

    const filtered = state.exercises.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || ex.muscleGroup === activeFilter;
      const matchesDay = activeDayFilter === null || (ex.days && ex.days.includes(activeDayFilter));
      return matchesSearch && matchesFilter && matchesDay;
    });

    // In All Days view sort by staleness descending (most overdue first)
    if (activeDayFilter === null && activeFilter === 'All' && !searchQuery) {
      return [...filtered].sort((a, b) => sessionsMissed(b.id) - sessionsMissed(a.id));
    }
    return filtered;
  }, [state.exercises, state.logs, state.activeUserId, searchQuery, activeFilter, activeDayFilter]);
  // Compute sessionsMissed per exercise to pass to card
  const sessionDates = useMemo(() => Array.from(
    new Set(
      state.logs
        .filter((l) => l.userId === state.activeUserId)
        .map((l) => l.date.split('T')[0])
    )
  ).sort((a, b) => b.localeCompare(a)), [state.logs, state.activeUserId]);

  const getSessionsMissed = (exerciseId: string): number => {
    const lastLogDate = state.logs
      .filter((l) => l.exerciseId === exerciseId && l.userId === state.activeUserId)
      .map((l) => l.date.split('T')[0])
      .sort((a, b) => b.localeCompare(a))[0];
    if (!lastLogDate) return sessionDates.length;
    const idx = sessionDates.indexOf(lastLogDate);
    return idx === -1 ? sessionDates.length : idx;
  };

  const toggleUser = () => {
    const currentIndex = state.users.findIndex(
      (u) => u.id === state.activeUserId
    );
    const nextIndex = (currentIndex + 1) % state.users.length;
    setActiveUser(state.users[nextIndex].id);
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      exit={{
        opacity: 0,
        y: -10
      }}
      className="pb-24 pt-6 px-4 sm:px-6 max-w-md mx-auto w-full min-h-screen">
      
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Gym<span className="text-lime-400">Bro</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-lime-400 rounded-full text-zinc-950 hover:bg-lime-500 transition-colors">
            
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={toggleUser}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full py-1.5 px-3 hover:bg-zinc-800 transition-colors">
            
            <div className={`w-3 h-3 rounded-full ${activeUser?.color}`} />
            <span className="text-sm font-medium text-white">
              {activeUser?.name}
            </span>
            <Users className="w-4 h-4 text-zinc-500 ml-1" />
          </button>
        </div>
      </header>

      {/* Day filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveDayFilter(null)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeDayFilter === null ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
          
          All Days
        </button>
        {Array.from(
          {
            length: state.routineDays
          },
          (_, i) => i + 1
        ).map((day) =>
        <button
          key={day}
          onClick={() =>
          setActiveDayFilter(activeDayFilter === day ? null : day)
          }
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeDayFilter === day ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
          
            Day {day}
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all" />
        
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {muscleGroups.map((group) =>
        <button
          key={group}
          onClick={() => setActiveFilter(group)}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeFilter === group ? 'bg-lime-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
          
            {group}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) =>
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          sessionsMissed={getSessionsMissed(exercise.id)}
          onClick={() => setSelectedExercise(exercise)} />

        )}
      </div>

      {filteredExercises.length === 0 &&
      <div className="text-center py-12">
          <p className="text-zinc-500">No exercises found.</p>
        </div>
      }

      <ExerciseModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)} />
      
      <AddExerciseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)} />
      
    </motion.div>);

}