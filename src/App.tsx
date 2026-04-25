import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GymProvider } from './context/GymContext';
import { BottomNav } from './components/BottomNav';
import { Exercises } from './pages/Exercises';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Exercises />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AnimatePresence>);

}
export function App() {
  return (
    <GymProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-lime-400/30">
          <AnimatedRoutes />
          <BottomNav />
        </div>
      </BrowserRouter>
    </GymProvider>);

}