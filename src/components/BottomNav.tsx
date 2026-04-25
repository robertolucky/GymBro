import React from 'react';
import { NavLink } from 'react-router-dom';
import { Dumbbell, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
export function BottomNav() {
  const navItems = [
  {
    path: '/',
    icon: Dumbbell,
    label: 'Exercises'
  },
  {
    path: '/stats',
    icon: BarChart3,
    label: 'Stats'
  },
  {
    path: '/settings',
    icon: Settings,
    label: 'Settings'
  }];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
      <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 px-6 py-3 flex justify-between items-center">
        {navItems.map((item) =>
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
          `relative flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-lime-400' : 'text-zinc-500 hover:text-zinc-300'}`
          }>
          
            {({ isActive }) =>
          <>
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive &&
            <motion.div
              layoutId="bottomNavIndicator"
              className="absolute -top-3 w-12 h-1 bg-lime-400 rounded-b-full"
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30
              }} />

            }
              </>
          }
          </NavLink>
        )}
      </div>
    </div>);

}