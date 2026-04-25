import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { useGym } from '../context/GymContext';
import { StatCard } from '../components/StatCard';
import { Calendar, ChevronDown, Trash2 } from 'lucide-react';
export function Stats() {
  const { state, updateUser, addBiometricLog, deleteLog } = useGym();
  const activeUser = state.users.find((u) => u.id === state.activeUserId);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    weight: 0,
    height: 0,
    bodyFat: 0,
    muscleMass: 0,
  });
  const handleEditClick = (user: any) => {
    setEditingUserId(user.id);
    setEditForm({
      weight: user.weight,
      height: user.height,
      bodyFat: user.bodyFat,
      muscleMass: user.muscleMass,
    });
  };
  const handleSaveBio = (userId: string) => {
    updateUser(userId, editForm);
    addBiometricLog({
      userId,
      weight: editForm.weight,
      bodyFat: editForm.bodyFat,
      muscleMass: editForm.muscleMass,
    });
    setEditingUserId(null);
  };
  // Body composition trend — active user only, 3 metrics
  const bodyChartData = useMemo(() => {
    if (!activeUser) return [];
    const dates = Array.from(
      new Set(
        state.biometricLogs
          .filter((l) => l.userId === activeUser.id)
          .map((l) => l.date.split('T')[0])
      )
    ).sort();
    return dates.map((date) => {
      const log = state.biometricLogs.find(
        (l) => l.userId === activeUser.id && l.date.startsWith(date)
      );
      if (!log) return null;
      return {
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        'Bodyweight': log.weight,
        ...(log.bodyFat   > 0 ? { 'Fat (kg)':    log.bodyFat    } : {}),
        ...(log.muscleMass > 0 ? { 'Muscle (kg)': log.muscleMass } : {}),
      };
    }).filter(Boolean);
  }, [state.biometricLogs, activeUser]);
  // Per-user workout days this week
  const workoutsThisWeekByUser = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return state.users.map((user) => {
      const days = new Set(
        state.logs
          .filter((l) => l.userId === user.id && new Date(l.date) >= monday)
          .map((l) => l.date.split('T')[0])
      );
      return { user, count: days.size };
    });
  }, [state.logs, state.users]);

  // Exercise history
  const exercisesWithLogs = useMemo(() =>
    state.exercises.filter((ex) =>
      state.logs.some((l) => l.exerciseId === ex.id)
    ), [state.exercises, state.logs]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  // Auto-select first exercise with logs
  const activeHistoryId = selectedExerciseId || exercisesWithLogs[0]?.id || '';
  const activeHistoryExercise = state.exercises.find((e) => e.id === activeHistoryId);

  // Chart: one data point per unique date, weight per user
  const historyChartData = useMemo(() => {
    if (!activeHistoryId) return [];
    const dates = Array.from(
      new Set(
        state.logs
          .filter((l) => l.exerciseId === activeHistoryId)
          .map((l) => l.date.split('T')[0])
      )
    ).sort();
    return dates.map((date) => {
      const entry: any = {
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      };
      state.users.forEach((user) => {
        const dayLogs = state.logs.filter(
          (l) => l.exerciseId === activeHistoryId && l.userId === user.id && l.date.startsWith(date)
        );
        if (dayLogs.length > 0) {
          const best = dayLogs.reduce((a, b) => a.weight >= b.weight ? a : b);
          entry[user.name] = best.weight;
          entry[`${user.name} reps`] = best.reps;
        }
      });
      return entry;
    });
  }, [activeHistoryId, state.logs, state.users]);

  // Flat list of all sets for the selected exercise, newest first
  const historyLogs = useMemo(() => {
    if (!activeHistoryId) return [];
    return [...state.logs]
      .filter((l) => l.exerciseId === activeHistoryId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeHistoryId, state.logs]);
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
        <h1 className="text-3xl font-black text-white tracking-tight">Stats</h1>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {state.users.map((user) =>
        <div
          key={user.id}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${user.color}`} />
              <h3 className="text-white font-bold">{user.name}</h3>
            </div>

            {editingUserId === user.id ?
          <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-500">
                    Weight ({state.units})
                  </label>
                  <input
                type="number"
                value={editForm.weight}
                onChange={(e) =>
                setEditForm({
                  ...editForm,
                  weight: parseFloat(e.target.value)
                })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm" />
              
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Height (cm)</label>
                  <input
                type="number"
                value={editForm.height}
                onChange={(e) =>
                setEditForm({
                  ...editForm,
                  height: parseFloat(e.target.value)
                })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm" />
              
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Body Fat ({state.units})</label>
                  <input
                type="number"
                value={editForm.bodyFat}
                onChange={(e) =>
                setEditForm({
                  ...editForm,
                  bodyFat: parseFloat(e.target.value)
                })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm" />
              
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Muscle Mass ({state.units})</label>
                  <input
                type="number"
                value={editForm.muscleMass}
                onChange={(e) =>
                setEditForm({
                  ...editForm,
                  muscleMass: parseFloat(e.target.value)
                })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm" />
              
                </div>
                <button
              onClick={() => handleSaveBio(user.id)}
              className="w-full bg-lime-400 text-zinc-950 text-sm font-bold py-2 rounded-lg mt-2">
              
                  Save
                </button>
              </div> :

          <div
            className="space-y-2 cursor-pointer group"
            onClick={() => handleEditClick(user)}>
            
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Bodyweight</span>
                  <span className="text-white font-medium">
                    {user.weight} {state.units}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Fat</span>
                  <span className="text-orange-400 font-medium">
                    {user.bodyFat} {state.units}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Muscle</span>
                  <span className="text-lime-400 font-medium">
                    {user.muscleMass} {state.units}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Height</span>
                  <span className="text-white font-medium">
                    {user.height} cm
                  </span>
                </div>
                <div className="text-xs text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity text-center mt-2">
                  Tap to edit
                </div>
              </div>
          }
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-white mb-4">Weekly Summary</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {workoutsThisWeekByUser.map(({ user, count }) => (
          <StatCard
            key={user.id}
            title={`${user.name}'s workouts`}
            value={String(count)}
            subtitle="Since Monday"
            icon={<Calendar className="w-5 h-5" />} />
        ))}
      </div>

      <h2 className="text-xl font-bold text-white mb-1">Body Composition</h2>
      <p className="text-zinc-500 text-xs mb-4">
        {activeUser?.name} — updates each time you save your stats above
      </p>

      {bodyChartData.length < 2 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center mb-8">
          <p className="text-zinc-500 text-sm">
            Save your stats at least twice to see a trend.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-8">
          {/* Legend */}
          <div className="flex gap-4 mb-4">
            {[
              { label: 'Bodyweight', color: '#ffffff' },
              { label: 'Muscle (kg)', color: '#BFFF00' },
              { label: 'Fat (kg)',    color: '#f97316' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bodyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any, name: string) => [`${value} ${state.units}`, name]} />
                <Line type="monotone" dataKey="Bodyweight" stroke="#ffffff" strokeWidth={2} dot={{ r: 3, fill: '#18181b', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Muscle (kg)" stroke="#BFFF00" strokeWidth={2} dot={{ r: 3, fill: '#18181b', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Fat (kg)" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#18181b', strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Exercise History ── */}
      <h2 className="text-xl font-bold text-white mt-10 mb-4">Exercise History</h2>

      {exercisesWithLogs.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">
          No logs yet — start tracking sets to see your history.
        </p>
      ) : (
        <>
          {/* Exercise picker */}
          <div className="relative mb-6">
            <button
              onClick={() => setShowExercisePicker((v) => !v)}
              className="w-full flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white font-medium hover:border-zinc-700 transition-colors">
              <span>{activeHistoryExercise?.name ?? 'Select exercise'}</span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showExercisePicker ? 'rotate-180' : ''}`} />
            </button>
            {showExercisePicker && (
              <div className="absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                {exercisesWithLogs.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => { setSelectedExerciseId(ex.id); setShowExercisePicker(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-800 transition-colors ${ex.id === activeHistoryId ? 'text-lime-400 font-bold' : 'text-white'}`}>
                    {ex.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Progress chart */}
          {historyChartData.length > 1 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
              <div className="flex gap-4 mb-3 flex-wrap">
                {state.users.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: index === 0 ? '#BFFF00' : '#60A5FA' }} />
                      <span className="text-xs text-zinc-400">{user.name} weight</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 border-t-2 border-dashed" style={{ borderColor: index === 0 ? '#BFFF00' : '#60A5FA', opacity: 0.5 }} />
                      <span className="text-xs text-zinc-400">{user.name} reps</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyChartData} margin={{ top: 5, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="weight" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                    <YAxis yAxisId="reps" orientation="right" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 20]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: any, name: string) => [
                        name.includes('reps') ? `${value} reps` : `${value} ${state.units}`,
                        name
                      ]} />
                    {state.users.map((user, index) => (
                      <React.Fragment key={user.id}>
                        <Line yAxisId="weight" type="monotone" dataKey={user.name} stroke={index === 0 ? '#BFFF00' : '#60A5FA'} strokeWidth={2} dot={{ r: 3, fill: '#18181b', strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls />
                        <Line yAxisId="reps" type="monotone" dataKey={`${user.name} reps`} stroke={index === 0 ? '#BFFF00' : '#60A5FA'} strokeWidth={1.5} strokeDasharray="4 3" strokeOpacity={0.5} dot={false} connectNulls />
                      </React.Fragment>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Log list */}
          <div className="space-y-2">
            {historyLogs.map((log) => {
              const user = state.users.find((u) => u.id === log.userId);
              return (
                <div key={log.id} className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${user?.color}`} />
                    <div>
                      <p className="text-white text-sm font-medium">{user?.name}</p>
                      <p className="text-zinc-500 text-xs">
                        {new Date(log.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold whitespace-nowrap">
                      {log.weight}{state.units} × {log.reps} × {log.sets}
                    </span>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="p-1.5 text-zinc-600 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>);

}