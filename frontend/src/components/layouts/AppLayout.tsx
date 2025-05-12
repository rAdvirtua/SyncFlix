import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { LogOut, Menu, X } from 'lucide-react';
import Sidebar from '../Sidebar';
import Footer from '../Footer';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Mobile header */}
      <div className="md:hidden bg-slate-800 p-4 flex items-center justify-between">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="text-slate-300 hover:text-white"
        >
          <Menu size={24} />
        </button>
        <div className="text-orange-500 font-bold text-xl">SyncFlix</div>
        <button 
          onClick={handleLogout}
          className="text-slate-300 hover:text-white"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-56px)] md:min-h-screen">
        {/* Sidebar - Mobile (overlay) */}
        <div 
          className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity md:hidden ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        <div 
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transition-transform transform md:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="text-orange-500 font-bold text-xl">SyncFlix</div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-slate-300 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <Sidebar closeMobileSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Sidebar - Desktop (fixed) */}
        <div className="hidden md:block w-64 bg-slate-800">
          <div className="p-4">
            <div className="text-orange-500 font-bold text-xl mb-6">Syncflix</div>
            <Sidebar />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;