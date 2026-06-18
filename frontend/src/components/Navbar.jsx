import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0099FF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-[#0099FF]">Smart</span>{' '}
              <span className="text-[#FFCC00]">Transit</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" label="Home" />
            <NavLink to="/route-planner" label="Route Planner" />
            <NavLink to="/stops" label="Bus Stops" />
            <NavLink to="/track-bus" label="Track Bus" />
            <NavLink to="/weather" label="Weather" />
            <NavLink to="/assistant" label="Chatbot" />
            <NavLink to="/emergency" label="Emergency" />
            {user?.role === 'admin' && (
              <NavLink to="/admin" label="Admin" />
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-sm text-gray-600 hidden sm:block hover:text-[#0099FF] transition-colors"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-red-500 hover:text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-[#0099FF] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#0099FF] rounded-full hover:bg-[#0077CC] transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 text-sm text-gray-600 hover:text-[#0099FF] hover:bg-[#F0F8FF] rounded-lg transition-all"
    >
      {label}
    </Link>
  );
}
