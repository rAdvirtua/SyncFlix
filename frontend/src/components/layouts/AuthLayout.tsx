import { Outlet } from 'react-router-dom';
import Footer from '../Footer';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex-1 flex">
        {/* Left side - auth form */}
        <div className="w-full md:w-1/2 bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-8">
          <Outlet />
        </div>
        
        {/* Right side - illustration/branding (visible only on medium screens and up) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 flex-col items-center justify-center p-8">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-orange-500 mb-4">SyncFlix</h1>
            <p className="text-slate-300 text-xl max-w-md">
              Harmonize YouTube watching with live chat. Sync, chat, laugh, repeat!
            </p>
          </div>
          <div className="w-3/4 h-64 bg-slate-800 rounded-lg flex items-center justify-center p-6 shadow-lg border border-slate-700">
            <div className="w-full bg-slate-900 rounded p-3 text-center">
              <div className="bg-orange-500 h-2 w-2/3 mx-auto rounded mb-4"></div>
              <div className="bg-slate-800 h-32 w-full rounded mb-4 flex items-center justify-center">
                <div className="text-slate-600 text-5xl">▶️</div>
              </div>
              <div className="flex space-x-2">
                <div className="bg-slate-800 h-6 w-full rounded"></div>
                <div className="bg-orange-500 h-6 w-20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthLayout;
