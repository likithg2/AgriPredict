import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Leaf, LayoutDashboard, Calculator, Building2, User, History, LogIn, Moon, Sun, Globe, TrendingUp, Trash2 } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import Button from './Button';
import { authAPI } from '../utils/api';

const TopBar = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { language, changeLanguage, t } = useContext(LanguageContext);
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const getLinks = () => {
    const links = [
      { path: '/dashboard', label: t('Home'), icon: LayoutDashboard },
    ];
    
    if (user.role === 'farmer') {
      links.push({ path: '/predict', label: t('Predict'), icon: Calculator });
    }
    
    if (user.role === 'warehouse_manager' || user.role === 'admin') {
      links.push({ path: '/warehouse', label: t('Warehouse'), icon: Building2 });
      links.push({ path: '/warehouse-logs', label: t('Logs'), icon: History });
    }
    
    if (user.role === 'farmer') {
      links.push({ path: '/history', label: t('History'), icon: History });
      links.push({ path: '/statistics', label: t('Statistics'), icon: TrendingUp });
    }
    
    return links;
  };

  return (
    <nav className="glass-panel mx-6 mt-4 px-6 py-4 flex items-center justify-between sticky top-4 z-50">
      <div className="flex items-center gap-2 text-primary font-bold text-xl">
        <Leaf size={24} />
        <span>AgriPredict</span>
      </div>
      
      <div className="flex items-center gap-6">
        {getLinks().map((link) => (
          <NavLink 
            key={link.path}
            to={link.path}
            className={({ isActive }) => 
              `flex items-center gap-2 font-medium transition-colors ${isActive ? 'text-primary' : 'text-text-muted hover:text-primary'}`
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center gap-2 bg-white/30 dark:bg-black/20 rounded-full px-2 py-1">
              <Globe size={16} className="text-text-muted" />
              <select 
                value={language || 'en'} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-text-main dark:text-white font-medium focus:outline-none cursor-pointer appearance-none"
              >
                <option value="EN" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">English</option>
                <option value="KN" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">ಕನ್ನಡ</option>
                <option value="HI" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">हिन्दी</option>
              </select>
            </div>
            
            <button onClick={toggleTheme} className="p-2 rounded-full bg-white/30 dark:bg-black/20 text-text-main hover:bg-primary/20 transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </>
        )}
        
        {user ? (
          <div className="flex items-center gap-4 ml-2">
            <div className="flex flex-col text-right">
              <span className="font-semibold text-sm">{user.full_name}</span>
              <span className="text-xs text-text-muted uppercase">{user.role}</span>
            </div>
            <Button variant="secondary" onClick={logout} className="!p-2 !rounded-full bg-white/40 hover:bg-red-100 text-danger border border-red-200" title="Logout">
              <LogIn size={18} />
            </Button>
          </div>
        ) : (
          <NavLink to="/login">
            <Button icon={LogIn}>Login</Button>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default TopBar;
