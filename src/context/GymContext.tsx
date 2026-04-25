import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

export type User = {
  id: string;
  name: string;
  color: string;
  weight: number;
  height: number;
  bodyFat: number;
  muscleMass: number;
};
export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  iconName: string;
  days: number[];
};
export type Log = {
  id: string;
  exerciseId: string;
  userId: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
};
export type BiometricLog = {
  id: string;
  userId: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  date: string;
};
type GymState = {
  users: User[];
  activeUserId: string;
  exercises: Exercise[];
  logs: Log[];
  biometricLogs: BiometricLog[];
  units: 'kg' | 'lbs';
  routineDays: number;
};
type GymContextType = {
  state: GymState;
  setActiveUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  addLog: (log: Omit<Log, 'id' | 'date'>) => void;
  deleteLog: (id: string) => void;
  addBiometricLog: (log: Omit<BiometricLog, 'id' | 'date'>) => void;
  setUnits: (units: 'kg' | 'lbs') => void;
  resetData: () => void;
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (id: string, data: Partial<Omit<Exercise, 'id'>>) => void;
  deleteExercise: (id: string) => void;
  setRoutineDays: (days: number) => void;
};
const emptyState: GymState = {
  users: [],
  activeUserId: '',
  exercises: [],
  logs: [],
  biometricLogs: [],
  units: 'kg',
  routineDays: 3
};

const GymContext = createContext<GymContextType | undefined>(undefined);

// Helper to map Supabase snake_case rows to our camelCase types
const mapUser = (r: any): User => ({
  id: r.id,
  name: r.name,
  color: r.color,
  weight: Number(r.weight),
  height: Number(r.height),
  bodyFat: Number(r.body_fat),  muscleMass: Number(r.muscle_mass ?? 0),});
const mapExercise = (r: any): Exercise => ({
  id: r.id,
  name: r.name,
  muscleGroup: r.muscle_group,
  iconName: r.icon_name,
  days: r.days ?? [],
});
const mapLog = (r: any): Log => ({
  id: r.id,
  exerciseId: r.exercise_id,
  userId: r.user_id,
  weight: Number(r.weight),
  reps: Number(r.reps),
  sets: Number(r.sets ?? 1),
  date: r.date,
});
const mapBiometricLog = (r: any): BiometricLog => ({
  id: r.id,
  userId: r.user_id,
  weight: Number(r.weight),
  bodyFat: Number(r.body_fat ?? 0),
  muscleMass: Number(r.muscle_mass ?? 0),
  date: r.date,
});

export const GymProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [state, setState] = useState<GymState>(emptyState);
  const [loading, setLoading] = useState(true);

  // ---- Fetch everything from Supabase on mount ----
  useEffect(() => {
    async function fetchAll() {
      const [usersRes, exercisesRes, logsRes, bioRes, settingsRes] =
        await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('exercises').select('*'),
          supabase.from('logs').select('*').order('date', { ascending: true }),
          supabase.from('biometric_logs').select('*').order('date', { ascending: true }),
          supabase.from('settings').select('*').single(),
        ]);

      setState({
        users: (usersRes.data ?? []).map(mapUser),
        exercises: (exercisesRes.data ?? []).map(mapExercise),
        logs: (logsRes.data ?? []).map(mapLog),
        biometricLogs: (bioRes.data ?? []).map(mapBiometricLog),
        activeUserId: settingsRes.data?.active_user_id ?? '',
        units: settingsRes.data?.units ?? 'kg',
        routineDays: settingsRes.data?.routine_days ?? 3,
      });
      setLoading(false);
    }
    fetchAll();
  }, []);
  // ---- Mutations that persist to Supabase ----
  const setActiveUser = async (id: string) => {
    setState((prev) => ({ ...prev, activeUserId: id }));
    await supabase.from('settings').update({ active_user_id: id }).eq('id', 1);
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    }));
    const mapped: Record<string, unknown> = {};
    if (data.weight !== undefined) mapped.weight = data.weight;
    if (data.height !== undefined) mapped.height = data.height;
    if (data.bodyFat !== undefined) mapped.body_fat = data.bodyFat;
    if (data.muscleMass !== undefined) mapped.muscle_mass = data.muscleMass;
    if (data.name !== undefined) mapped.name = data.name;
    if (data.color !== undefined) mapped.color = data.color;
    await supabase.from('users').update(mapped).eq('id', id);
  };

  const addLog = async (log: Omit<Log, 'id' | 'date'>) => {
    const { data, error } = await supabase
      .from('logs')
      .insert({
        exercise_id: log.exerciseId,
        user_id: log.userId,
        weight: log.weight,
        reps: log.reps,
        sets: log.sets,
      })
      .select()
      .single();
    if (!error && data) {
      setState((prev) => ({ ...prev, logs: [...prev.logs, mapLog(data)] }));
    }
  };

  const deleteLog = async (id: string) => {
    setState((prev) => ({ ...prev, logs: prev.logs.filter((l) => l.id !== id) }));
    await supabase.from('logs').delete().eq('id', id);
  };

  const addBiometricLog = async (log: Omit<BiometricLog, 'id' | 'date'>) => {
    const { data, error } = await supabase
      .from('biometric_logs')
      .insert({ user_id: log.userId, weight: log.weight, body_fat: log.bodyFat, muscle_mass: log.muscleMass })
      .select()
      .single();
    if (!error && data) {
      setState((prev) => ({
        ...prev,
        biometricLogs: [...prev.biometricLogs, mapBiometricLog(data)],
      }));
    }
  };

  const setUnits = async (units: 'kg' | 'lbs') => {
    setState((prev) => ({ ...prev, units }));
    await supabase.from('settings').update({ units }).eq('id', 1);
  };

  const resetData = async () => {
    // Delete all logs, keep users & exercises
    await Promise.all([
      supabase.from('logs').delete().neq('id', ''),
      supabase.from('biometric_logs').delete().neq('id', ''),
    ]);
    setState((prev) => ({ ...prev, logs: [], biometricLogs: [] }));
  };

  const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        name: exercise.name,
        muscle_group: exercise.muscleGroup,
        icon_name: exercise.iconName,
        days: exercise.days,
      })
      .select()
      .single();
    if (!error && data) {
      setState((prev) => ({
        ...prev,
        exercises: [...prev.exercises, mapExercise(data)],
      }));
    }
  };

  const updateExercise = async (id: string, data: Partial<Omit<Exercise, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => ex.id === id ? { ...ex, ...data } : ex),
    }));
    const mapped: Record<string, unknown> = {};
    if (data.name !== undefined) mapped.name = data.name;
    if (data.muscleGroup !== undefined) mapped.muscle_group = data.muscleGroup;
    if (data.days !== undefined) mapped.days = data.days;
    await supabase.from('exercises').update(mapped).eq('id', id);
  };

  const deleteExercise = async (id: string) => {
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== id),
      logs: prev.logs.filter((l) => l.exerciseId !== id),
    }));
    await supabase.from('logs').delete().eq('exercise_id', id);
    await supabase.from('exercises').delete().eq('id', id);
  };

  const setRoutineDays = async (routineDays: number) => {
    setState((prev) => ({
      ...prev,
      routineDays,
      exercises: prev.exercises.map((ex) => ({
        ...ex,
        days: ex.days.filter((d) => d <= routineDays),
      })),
    }));
    await supabase.from('settings').update({ routine_days: routineDays }).eq('id', 1);
    // Also clean up exercise days in the DB
    const { data: exercises } = await supabase.from('exercises').select('id, days');
    if (exercises) {
      await Promise.all(
        exercises.map((ex) =>
          supabase
            .from('exercises')
            .update({ days: (ex.days as number[]).filter((d) => d <= routineDays) })
            .eq('id', ex.id)
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <p className="text-zinc-400 text-lg">Loading…</p>
      </div>
    );
  }
  return (
    <GymContext.Provider
      value={{
        state,
        setActiveUser,
        updateUser,
        addLog,
        deleteLog,
        addBiometricLog,
        setUnits,
        resetData,
        addExercise,
        updateExercise,
        deleteExercise,
        setRoutineDays
      }}>
      
      {children}
    </GymContext.Provider>);

};
export const useGym = () => {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};