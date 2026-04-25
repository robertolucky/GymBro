import React, { useEffect, useState, createContext, useContext } from 'react';
export type User = {
  id: string;
  name: string;
  color: string;
  weight: number;
  height: number;
  bodyFat: number;
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
  date: string;
};
export type BiometricLog = {
  id: string;
  userId: string;
  weight: number;
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
  addBiometricLog: (log: Omit<BiometricLog, 'id' | 'date'>) => void;
  setUnits: (units: 'kg' | 'lbs') => void;
  resetData: () => void;
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  setRoutineDays: (days: number) => void;
};
const defaultExercises: Exercise[] = [
{
  id: '1',
  name: 'Bench Press',
  muscleGroup: 'Chest',
  iconName: 'Dumbbell',
  days: [1]
},
{
  id: '2',
  name: 'Squat',
  muscleGroup: 'Legs',
  iconName: 'Activity',
  days: [2]
},
{
  id: '3',
  name: 'Deadlift',
  muscleGroup: 'Back',
  iconName: 'Dumbbell',
  days: [2]
},
{
  id: '4',
  name: 'Overhead Press',
  muscleGroup: 'Shoulders',
  iconName: 'ArrowUpCircle',
  days: [1]
},
{
  id: '5',
  name: 'Barbell Row',
  muscleGroup: 'Back',
  iconName: 'Dumbbell',
  days: [3]
},
{
  id: '6',
  name: 'Pull-ups',
  muscleGroup: 'Back',
  iconName: 'ArrowUp',
  days: [3]
},
{
  id: '7',
  name: 'Bicep Curls',
  muscleGroup: 'Arms',
  iconName: 'Dumbbell',
  days: [3]
},
{
  id: '8',
  name: 'Tricep Dips',
  muscleGroup: 'Arms',
  iconName: 'ArrowDown',
  days: [1]
},
{
  id: '9',
  name: 'Leg Press',
  muscleGroup: 'Legs',
  iconName: 'Activity',
  days: [2]
},
{
  id: '10',
  name: 'Lateral Raises',
  muscleGroup: 'Shoulders',
  iconName: 'MoveHorizontal',
  days: [1, 3]
},
{
  id: '11',
  name: 'Romanian Deadlift',
  muscleGroup: 'Legs',
  iconName: 'Dumbbell',
  days: [2]
},
{
  id: '12',
  name: 'Plank',
  muscleGroup: 'Core',
  iconName: 'Minus',
  days: [1, 2, 3]
}];

const defaultUsers: User[] = [
{
  id: 'u1',
  name: 'You',
  color: 'bg-lime-400',
  weight: 80,
  height: 180,
  bodyFat: 15
},
{
  id: 'u2',
  name: 'Bro',
  color: 'bg-blue-400',
  weight: 85,
  height: 185,
  bodyFat: 14
}];

// Generate some mock biometric data for the chart
const generateMockBiometrics = () => {
  const logs: BiometricLog[] = [];
  const now = new Date();
  for (let i = 8; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    logs.push({
      id: `b_u1_${i}`,
      userId: 'u1',
      weight: 80 + Math.random() * 2 - 1,
      date: date.toISOString()
    });
    logs.push({
      id: `b_u2_${i}`,
      userId: 'u2',
      weight: 85 + Math.random() * 2 - 1,
      date: date.toISOString()
    });
  }
  return logs;
};
const initialState: GymState = {
  users: defaultUsers,
  activeUserId: 'u1',
  exercises: defaultExercises,
  logs: [],
  biometricLogs: generateMockBiometrics(),
  units: 'kg',
  routineDays: 3
};
const GymContext = createContext<GymContextType | undefined>(undefined);
export const GymProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [state, setState] = useState<GymState>(() => {
    const saved = localStorage.getItem('gymbro_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse state', e);
      }
    }
    return initialState;
  });
  useEffect(() => {
    localStorage.setItem('gymbro_state', JSON.stringify(state));
  }, [state]);
  const setActiveUser = (id: string) => {
    setState((prev) => ({
      ...prev,
      activeUserId: id
    }));
  };
  const updateUser = (id: string, data: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
      u.id === id ?
      {
        ...u,
        ...data
      } :
      u
      )
    }));
  };
  const addLog = (log: Omit<Log, 'id' | 'date'>) => {
    const newLog: Log = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, newLog]
    }));
  };
  const addBiometricLog = (log: Omit<BiometricLog, 'id' | 'date'>) => {
    const newLog: BiometricLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };
    setState((prev) => ({
      ...prev,
      biometricLogs: [...prev.biometricLogs, newLog]
    }));
  };
  const setUnits = (units: 'kg' | 'lbs') => {
    setState((prev) => ({
      ...prev,
      units
    }));
  };
  const resetData = () => {
    setState(initialState);
  };
  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: Math.random().toString(36).substr(2, 9)
    };
    setState((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };
  const setRoutineDays = (routineDays: number) => {
    setState((prev) => ({
      ...prev,
      routineDays,
      // Clean up exercises that reference days beyond the new limit
      exercises: prev.exercises.map((ex) => ({
        ...ex,
        days: ex.days.filter((d) => d <= routineDays)
      }))
    }));
  };
  return (
    <GymContext.Provider
      value={{
        state,
        setActiveUser,
        updateUser,
        addLog,
        addBiometricLog,
        setUnits,
        resetData,
        addExercise,
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