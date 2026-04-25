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
import { Activity, TrendingUp, Calendar } from 'lucide-react';
export function Stats() {
  const { state, updateUser } = useGym();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    weight: 0,
    height: 0,
    bodyFat: 0
  });
  const handleEditClick = (user: any) => {
    setEditingUserId(user.id);
    setEditForm({
      weight: user.weight,
      height: user.height,
      bodyFat: user.bodyFat
    });
  };
  const handleSaveBio = (userId: string) => {
    updateUser(userId, editForm);
    setEditingUserId(null);
  };
  // Prepare chart data
  const chartData = useMemo(() => {
    const dates = Array.from(
      new Set(state.biometricLogs.map((l) => l.date.split('T')[0]))
    ).sort();
    return dates.map((date) => {
      const entry: any = {
        date: new Date(date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        })
      };
      state.users.forEach((user) => {
        const log = state.biometricLogs.find(
          (l) => l.userId === user.id && l.date.startsWith(date)
        );
        if (log) entry[user.name] = log.weight;
      });
      return entry;
    });
  }, [state.biometricLogs, state.users]);
  // Calculate total volume this week
  const getVolumeThisWeek = (userId: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return state.logs.
    filter((l) => l.userId === userId && new Date(l.date) >= oneWeekAgo).
    reduce((total, log) => total + log.weight * log.reps, 0);
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
                  <label className="text-xs text-zinc-500">Body Fat %</label>
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
                  <span className="text-zinc-500">Weight</span>
                  <span className="text-white font-medium">
                    {user.weight} {state.units}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Height</span>
                  <span className="text-white font-medium">
                    {user.height} cm
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Body Fat</span>
                  <span className="text-white font-medium">
                    {user.bodyFat}%
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
        <StatCard
          title={`Volume (${state.users[0].name})`}
          value={`${getVolumeThisWeek(state.users[0].id).toLocaleString()} ${state.units}`}
          icon={<Activity className="w-5 h-5" />} />
        
        <StatCard
          title={`Volume (${state.users[1].name})`}
          value={`${getVolumeThisWeek(state.users[1].id).toLocaleString()} ${state.units}`}
          icon={<Activity className="w-5 h-5" />} />
        
        <StatCard
          title="Active Streak"
          value="3 Days"
          icon={<TrendingUp className="w-5 h-5" />} />
        
        <StatCard
          title="Workouts"
          value="4"
          subtitle="This week"
          icon={<Calendar className="w-5 h-5" />} />
        
      </div>

      <h2 className="text-xl font-bold text-white mb-4">Bodyweight Trend</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 5,
              left: -20,
              bottom: 0
            }}>
            
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false} />
            
            <XAxis
              dataKey="date"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false} />
            
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 2', 'dataMax + 2']} />
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px'
              }}
              itemStyle={{
                color: '#fff'
              }} />
            
            {state.users.map((user, index) =>
            <Line
              key={user.id}
              type="monotone"
              dataKey={user.name}
              stroke={index === 0 ? '#BFFF00' : '#60A5FA'}
              strokeWidth={3}
              dot={{
                r: 4,
                fill: '#18181b',
                strokeWidth: 2
              }}
              activeDot={{
                r: 6
              }} />

            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>);

}