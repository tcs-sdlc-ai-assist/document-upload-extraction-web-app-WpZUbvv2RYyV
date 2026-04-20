import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    { name: 'Dashboard', to: '/' },
    { name: 'Upload', to: '/upload' },
    { name: 'History', to: '/history' },
  ];

  return (
    <aside className="w-56 min-h-screen bg-gray-800 text-white flex flex-col py-6 px-4">
      <div className="mb-8 flex items-center space-x-2 px-2">
        <span className="text-2xl font-bold tracking-tight">DocExtract</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
                end={item.to === '/'}
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;