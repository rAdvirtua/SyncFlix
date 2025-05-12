import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { LogOut, Plus, Users } from 'lucide-react';
import CreateChannelModal from './modals/CreateChannelModal';
import JoinChannelModal from './modals/JoinChannelModal';

interface SidebarProps {
  closeMobileSidebar?: () => void;
}

const Sidebar = ({ closeMobileSidebar }: SidebarProps) => {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);  // Track selected channel ID
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchChannels = async () => {
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
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [user]);

  const handleChannelClick = (channelId: string) => {
    navigate(`/channel/${channelId}`);
    if (closeMobileSidebar) closeMobileSidebar();
  };

  const handleJoinModal = (channelId: string) => {
    setSelectedChannelId(channelId);  // Set the selected channel ID
    setShowJoinModal(true);  // Open the Join Modal
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          {/* Dashboard link */}
          <div 
            className={`flex items-center space-x-2 px-4 py-2 mb-2 rounded cursor-pointer ${
              location.pathname === '/dashboard' 
                ? 'bg-slate-700 text-orange-500' 
                : 'text-slate-300 hover:bg-slate-700'
            }`}
            onClick={() => {
              navigate('/dashboard');
              if (closeMobileSidebar) closeMobileSidebar();
            }}
          >
            <Users size={18} />
            <span>Dashboard</span>
          </div>

          {/* Channels section */}
          <div className="mt-6">
            <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase">
              My Channels
            </div>
            
            {loading ? (
              <div className="px-4 py-2 text-slate-400">Loading channels...</div>
            ) : channels.length === 0 ? (
              <div className="px-4 py-2 text-slate-400">No channels yet</div>
            ) : (
              <div className="space-y-1">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`px-4 py-2 cursor-pointer rounded ${
                      location.pathname === `/channel/${channel.id}`
                        ? 'bg-slate-700 text-orange-500'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                    onClick={() => handleChannelClick(channel.id)}
                  >
                    # {channel.name}
                    {/* Button to open the Join Channel modal */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();  // Prevent the channel click event
                        handleJoinModal(channel.id);
                      }}
                      className="ml-2 text-sm text-blue-500 hover:text-blue-400"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Channel actions */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white rounded py-2 px-4"
          >
            <Plus size={18} />
            <span>Create Channel</span>
          </button>
          
          <button
            onClick={() => setShowJoinModal(true)}
            className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white rounded py-2 px-4"
          >
            <Users size={18} />
            <span>Join Channel</span>
          </button>
        </div>
        
        {/* Sign out button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 text-slate-300 hover:text-white"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateChannelModal onClose={() => setShowCreateModal(false)} />
      )}
      
      {showJoinModal && selectedChannelId && (
        <JoinChannelModal
          onClose={() => setShowJoinModal(false)}
          channelId={selectedChannelId}  // Pass the selected channel ID here
        />
      )}
    </>
  );
};

export default Sidebar;
