'use client';

import { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiBarChart2, FiHome, FiActivity, FiDatabase, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const tabs = [
    { id: 'futures', name: 'BINANCE FUTURES' },
    { id: 'spot', name: 'BINANCE SPOT' },
    { id: 'signals', name: 'MULTI-EXCHANGE' },
    { id: 'backtester', name: 'BACKTESTER' },
    { id: 'strategy', name: 'STRATEGY' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <FiBarChart2 className="text-black text-2xl mr-2" />
            <div className="leading-tight">
              <p className="font-bold text-black text-lg">Coinpree</p>
              <p className="text-violet-500 text-xs font-semibold">ALGO TERMINAL</p>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex space-x-2 ml-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-md text-sm transition
                ${activeTab === tab.id
                  ? 'bg-violet-100 text-violet-500'
                  : 'text-gray-600 hover:bg-violet-100 hover:text-violet-500'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            
            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            >
              {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon />}
            </button>

            {/* Logout */}
            <FiLogOut className="text-orange-400 cursor-pointer" />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FiX className='text-red-500 cursor-pointer' /> : <FiMenu className='text-violet-500 cursor-pointer'/>}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-2 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-md text-sm
                ${activeTab === tab.id
                  ? 'bg-violet-100 text-violet-500'
                  : 'text-gray-600 hover:bg-violet-100 hover:text-violet-500'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}

      </div>
    </nav>
  );
}


