import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { X } from 'lucide-react';

interface JoinChannelModalProps {
  onClose: () => void;
  channelId: string; // Accept channelId as a prop to join an existing channel
}

const JoinChannelModal = ({ onClose, channelId }: JoinChannelModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleJoin = async () => {
    if (!user) {
      setError('You must be logged in to join a channel');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if the channel exists
      const channelDocRef = doc(db, 'channels', channelId);
      const channelDocSnap = await getDoc(channelDocRef);

      if (!channelDocSnap.exists()) {
        setError('Channel does not exist!');
        setLoading(false);
        return;
      }

      // Add the current user to the channelMembers collection
      await setDoc(doc(db, 'channelMembers', `${channelId}_${user.uid}`), {
        channelId,
        userId: user.uid,
        isAdmin: false, // Default role is member, not admin
        joinedAt: new Date().toISOString(),
      });

      // Navigate to the channel page
      navigate(`/channel/${channelId}`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to join channel');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold">Join Channel</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={(e) => e.preventDefault()} className="p-4">
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
              type="button"
              disabled={loading}
              onClick={handleJoin}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinChannelModal;
