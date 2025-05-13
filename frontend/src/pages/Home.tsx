import { Link } from 'react-router-dom';
import { MessageSquare, Music, Play } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
            Watch Together, Even When Apart
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            SyncFlix keeps you connected with friends through synchronized video experiences. 
            Share music, movies, and memories in perfect harmony.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/register" 
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
            >
              Get Started
            </Link>
            <Link 
              to="/login" 
              className="px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">How SyncFlix Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-xl shadow-lg">
              <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Music size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Create Your Channel</h3>
              <p className="text-slate-300">
                Start your own music or video channel and invite friends to join. Set the vibe with your favorite playlists.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-xl shadow-lg">
              <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Play size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Synchronized Playback</h3>
              <p className="text-slate-300">
                Everyone watches in perfect sync. When you play, pause, or skip, everyone experiences it together.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-xl shadow-lg">
              <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Live Chat</h3>
              <p className="text-slate-300">
                React in real-time with text, images, audio, and video messages. Share the moment as it happens.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-16 px-4 bg-gradient-to-t from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-white">What Friends Are Saying</h2>
          
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-8 rounded-xl shadow-lg">
            <p className="text-xl italic text-slate-300 mb-6">
              "Since my best friend moved to a different school, we use SyncFlix every weekend to watch our favorite bands together. It's like she never left!"
            </p>
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                J
              </div>
              <div className="ml-4 text-left">
                <p className="font-semibold text-white">Asmita C.</p>
                <p className="text-slate-400 text-sm">Music enthusiast</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Sync Up?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of friends who stay connected through music and videos.
          </p>
          <Link 
            to="/register" 
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg text-lg"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
