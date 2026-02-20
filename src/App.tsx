import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import DailyLog from './pages/DailyLog';
import Insights from './pages/Insights';

function App() {
  const [_, setRefresh] = useState(0);

  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto px-4 pb-8">
        {/* Header */}
        <header className="flex items-center justify-center gap-2 py-4">
          <svg className="w-6 h-6 text-accent-deep" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
          <h1 className="text-xl font-semibold">Sleep Tracker</h1>
        </header>

        {/* Tab Navigation */}
        <nav className="flex bg-surface-light rounded-lg p-1 mb-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`
            }
            onClick={() => setRefresh(n => n + 1)}
          >
            Daily Log
          </NavLink>
          <NavLink
            to="/insights"
            className={({ isActive }) =>
              `flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            Insights
          </NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<DailyLog />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
