import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link as LinkIcon, LogOut, Plus, Users } from 'lucide-react';
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
  const [showInviteTooltip, setShowInviteTooltip] = useState(false);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;

  // Get current channel ID from location
  useEffect(() => {
    const match = location.pathname.match(/\/channel\/([^/]+)/);
    if (match && match[1]) {
      setCurrentChannelId(match[1]);
    } else {
      setCurrentChannelId(null);
    }
  }, [location]);

  useEffect(() => {
    const fetchChannels = async () => {
      if (!user) return;

      try {
        // Fetch channels where the user is a member (limit to 100)
        const membershipQuery = query(
          collection(db, 'channelMembers'),
          where('userId', '==', user.uid),
          limit(100)
        );
        
        const membershipDocs = await getDocs(membershipQuery);
        const channelIds = membershipDocs.docs.map(doc => doc.data().channelId);
        
        if (channelIds.length === 0) {
          setChannels([]);
          setLoading(false);
          return;
        }

        // Fetch the actual channel documents
        // Note: Firestore "in" queries are limited to 10 items per query
        // For larger sets, we need to batch the requests
        let allChannelData: any[] = [];
        
        // Process in batches of 10
        for (let i = 0; i < channelIds.length; i += 10) {
          const batch = channelIds.slice(i, i + 10);
          if (batch.length > 0) {
            const channelsQuery = query(
              collection(db, 'channels'),
              where('id', 'in', batch)
            );
            
            const channelDocs = await getDocs(channelsQuery);
            const batchData = channelDocs.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            allChannelData = [...allChannelData, ...batchData];
          }
        }
        
        // Sort channels by most recently joined/created first
        allChannelData.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setChannels(allChannelData);
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

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const copyInviteLink = () => {
    if (!currentChannelId) return;
    
    // Find current channel in list
    const currentChannel = channels.find(c => c.id === currentChannelId);
    if (currentChannel && currentChannel.joinCode) {
      // Create invite link with code
      const inviteLink = `${window.location.origin}/join?code=${currentChannel.joinCode}`;
      navigator.clipboard.writeText(inviteLink);
      
      // Show tooltip
      setShowInviteTooltip(true);
      setTimeout(() => setShowInviteTooltip(false), 2000);
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

          {/* Invite Link Button (only show when in a channel) */}
          {currentChannelId && (
            <div className="px-4 mb-4 relative">
              <button
                onClick={copyInviteLink}
                className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white rounded py-2 px-4"
              >
                <LinkIcon size={16} />
                <span>Copy Invite Link</span>
              </button>
              
              {showInviteTooltip && (
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 bg-slate-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                  Invite link copied!
                </div>
              )}
            </div>
          )}

          {/* Channels section */}
          <div className="mt-2">
            <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
              <span>My Channels</span>
              <span className="text-slate-400">{channels.length}/100</span>
            </div>
            
            {loading ? (
              <div className="px-4 py-2 text-slate-400">Loading channels...</div>
            ) : channels.length === 0 ? (
              <div className="px-4 py-2 text-slate-400">No channels yet</div>
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
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
                    <div className="flex items-center">
                      <span className="truncate"># {channel.name}</span>
                    </div>
                    {location.pathname === `/channel/${channel.id}` && channel.joinCode && (
                      <div className="text-xs text-slate-400 mt-1">
                        Code: {channel.joinCode}
                      </div>
                    )}
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
      
      {showJoinModal && (
        <JoinChannelModal onClose={() => setShowJoinModal(false)} />
      )}
    </>
  );
};

export default Sidebar;
