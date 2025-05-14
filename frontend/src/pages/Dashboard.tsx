import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import JoinChannelDialog from '../components/JoinChannelDialog';

const Dashboard = () => {
  const [, setChannels] = useState<any[]>([]);
  const [recentChannels, setRecentChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch channels where the user is a member
        const membershipQuery = query(
          collection(db, 'channelMembers'),
          where('userId', '==', user.uid)
        );
        
        const membershipDocs = await getDocs(membershipQuery);
        const channelIds = membershipDocs.docs.map(doc => doc.data().channelId);
        
        if (channelIds.length === 0) {
          setChannels([]);
          setRecentChannels([]);
          setLoading(false);
          return;
        }

        // Fetch the actual channel documents
        const channelsQuery = query(
          collection(db, 'channels'),
          where('id', 'in', channelIds)
        );
        
        const channelDocs = await getDocs(channelsQuery);
        const channelData = channelDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setChannels(channelData);
        
        // Get recent channels (just showing first 3 for this demo)
        setRecentChannels(channelData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">Welcome back, {user?.displayName || "Streamer"}!</h1>
      
      {/* Recent Channels */}
      <section className="mb-10">
        <div className="flex items-center mb-4">
          <Clock className="text-orange-500 mr-2" size={24} />
          <h2 className="text-xl font-semibold">Recent Channels</h2>
        </div>
        
        {recentChannels.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 text-center shadow-lg">
            <p className="text-slate-400">You haven't joined any watch parties yet.</p>
            <p className="text-slate-500 text-sm mt-2">
              Use the sidebar to create or join a channel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentChannels.map(channel => (
              <div 
                key={channel.id}
                className="bg-slate-800 rounded-lg p-5 cursor-pointer hover:scale-101 hover:bg-slate-750 transition-transform"
                onClick={() => navigate(`/channel/${channel.id}`)}
              >
                <h3 className="font-semibold text-lg mb-2 text-orange-500">
                  #{channel.name}
                </h3>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                  {channel.description || "No description provided"}
                </p>
                <div className="flex items-center text-slate-500 text-xs">
                  <Users size={14} className="mr-1" />
                  <span>{channel.memberCount || "?"} members</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Tips & Info Section */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">How SyncFlix Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-750 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-500 mb-2">Join Watch Parties</h3>
            <p className="text-slate-300 text-sm">
              Connect with friends by joining channels. Each channel is a dedicated space for watching videos together.
            </p>
          </div>
          
          <div className="bg-slate-750 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-500 mb-2">Watch Together</h3>
            <p className="text-slate-300 text-sm">
              Experience synchronized YouTube playback controlled by the channel admin - everyone watches the same content at the same time!
            </p>
          </div>
          
          <div className="bg-slate-750 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-500 mb-2">Chat Live</h3>
            <p className="text-slate-300 text-sm">
              React to videos in real-time with text, images, audio, and video sharing in the integrated chat.
            </p>
          </div>
          
          <div className="bg-slate-750 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-500 mb-2">Create Your Own</h3>
            <p className="text-slate-300 text-sm">
              Start your own channel and invite others to join. As admin, you'll control the video playback for everyone!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

<div className="mb-6">
  <JoinChannelDialog />
</div>
export default Dashboard;