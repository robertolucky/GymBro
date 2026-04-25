import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Scale, Trash2, Info, ChevronRight, Calendar } from 'lucide-react';
import { useGym } from '../context/GymContext';
const colorOptions = [
'bg-lime-400',
'bg-blue-400',
'bg-purple-400',
'bg-rose-400',
'bg-amber-400',
'bg-emerald-400'];

export function Settings() {
  const { state, updateUser, setUnits, resetData, setRoutineDays } = useGym();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const handleNameChange = (id: string, name: string) => {
    updateUser(id, {
      name
    });
  };
  const handleColorChange = (id: string, color: string) => {
    updateUser(id, {
      color
    });
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
      
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Settings
        </h1>
      </header>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 px-2">
          Profiles
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {state.users.map((user, index) =>
          <div
            key={user.id}
            className={`p-4 ${index !== 0 ? 'border-t border-zinc-800' : ''}`}>
            
              <div className="flex items-center justify-between mb-3">
                <input
                type="text"
                value={user.name}
                onChange={(e) => handleNameChange(user.id, e.target.value)}
                className="bg-transparent text-white font-bold text-lg focus:outline-none focus:border-b focus:border-lime-400 w-1/2" />
              
                <div className="flex gap-2">
                  {colorOptions.map((color) =>
                <button
                  key={color}
                  onClick={() => handleColorChange(user.id, color)}
                  className={`w-6 h-6 rounded-full ${color} ${user.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''}`} />

                )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 px-2">
          Preferences
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-3 text-white">
              <Scale className="w-5 h-5 text-zinc-400" />
              <span className="font-medium">Units</span>
            </div>
            <div className="flex bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setUnits('kg')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${state.units === 'kg' ? 'bg-zinc-600 text-white' : 'text-zinc-400'}`}>
                
                kg
              </button>
              <button
                onClick={() => setUnits('lbs')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${state.units === 'lbs' ? 'bg-zinc-600 text-white' : 'text-zinc-400'}`}>
                
                lbs
              </button>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-3 text-white">
              <Calendar className="w-5 h-5 text-zinc-400" />
              <div>
                <span className="font-medium">Routine Days</span>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Number of training days per week
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                state.routineDays > 1 && setRoutineDays(state.routineDays - 1)
                }
                className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center font-bold transition-colors">
                
                −
              </button>
              <span className="w-8 text-center text-white font-bold">
                {state.routineDays}
              </span>
              <button
                onClick={() =>
                state.routineDays < 7 && setRoutineDays(state.routineDays + 1)
                }
                className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center font-bold transition-colors">
                
                +
              </button>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Moon className="w-5 h-5 text-zinc-400" />
              <span className="font-medium">Dark Mode</span>
            </div>
            <div className="w-12 h-6 bg-lime-400 rounded-full relative cursor-not-allowed opacity-80">
              <div className="absolute right-1 top-1 w-4 h-4 bg-zinc-900 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 px-2">
          Data
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {showResetConfirm ?
          <div className="p-4">
              <p className="text-white text-sm mb-4">
                Are you sure? This will delete all logged workouts and
                biometrics.
              </p>
              <div className="flex gap-3">
                <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-zinc-800 text-white py-2 rounded-xl font-medium">
                
                  Cancel
                </button>
                <button
                onClick={() => {
                  resetData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl font-medium">
                
                  Yes, Reset
                </button>
              </div>
            </div> :

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full p-4 flex items-center justify-between text-red-400 hover:bg-zinc-800/50 transition-colors">
            
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Reset All Data</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </button>
          }
        </div>
      </section>

      <section>
        <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
          <Info className="w-4 h-4" />
          <span>GymBro v1.0.0</span>
        </div>
      </section>
    </motion.div>);

}