import { NavLink } from 'react-router-dom';
import { Home, Users, CheckSquare, Award } from 'lucide-react';

function Navigation() {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/people', label: 'People', icon: Users },
    { path: '/chores', label: 'Chores', icon: CheckSquare },
    { path: '/prizes', label: 'Prizes', icon: Award },
  ];

  return (
    <nav className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center justify-around md:justify-center md:gap-8 py-4">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`
              }
            >
              <Icon size={24} />
              <span className="text-sm md:text-base font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
