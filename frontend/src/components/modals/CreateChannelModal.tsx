import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';
import { X } from 'lucide-react';

interface CreateChannelModalProps {
  onClose: () => void;
}

// Generate a random 6-digit code
const generateJoinCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const CreateChannelModal = ({ onClose }: CreateChannelModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a channel');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Generate a unique channel ID and join code
      const channelId = uuidv4();
      const joinCode = generateJoinCode();
      
      // Create channel document
      await setDoc(doc(db, 'channels', channelId), {
        id: channelId,
        name,
        description,
        joinCode,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        memberCount: 1,
        maxMembers: 20,
        expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
      });
      
      // Add creator as member and admin
      await setDoc(doc(db, 'channelMembers', `${channelId}_${user.uid}`), {
        channelId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        isAdmin: true,
        joinedAt: new Date().toISOString(),
      });
      
      // Navigate to the new channel
      navigate(`/channel/${channelId}`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create channel');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold">Create a Channel</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Channel Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700 block w-full px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
              placeholder="My Awesome Channel"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-700 block w-full px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-white"
              placeholder="What's this channel about?"
              rows={3}
            />
          </div>

          <div className="mb-4 p-3 bg-slate-700 rounded-lg">
            <div className="text-sm text-slate-300 mb-1">Channel Details:</div>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Maximum 20 members can join this channel</li>
              <li>• Chat messages will auto-delete after 24 hours</li>
              <li>• You'll be the admin of this channel</li>
              <li>• You can appoint other members as admins</li>
            </ul>
          </div>
          
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;