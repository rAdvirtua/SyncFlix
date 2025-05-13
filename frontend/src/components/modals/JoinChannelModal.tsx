import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, increment, query, collection, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { X } from 'lucide-react';

interface JoinChannelModalProps {
  onClose: () => void;
}

const JoinChannelModal = ({ onClose }: JoinChannelModalProps) => {
  const [channelCode, setChannelCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to join a channel');
      return;
    }
    
    if (channelCode.length !== 6) {
      setError('Channel code must be 6 digits');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Find channel by code
      const channelsQuery = query(
        collection(db, 'channels'),
        where('joinCode', '==', channelCode)
      );
      
      const channelSnap = await getDocs(channelsQuery);
      
      if (channelSnap.empty) {
        setError('Channel not found. Please check the code and try again.');
        setLoading(false);
        return;
      }
      
      const channelDoc = channelSnap.docs[0];
      const channelId = channelDoc.id;
      const channelData = channelDoc.data();
      
      // Check if channel has reached member limit
      if (channelData.memberCount >= 20) {
        setError('This channel has reached its maximum capacity of 20 members');
        setLoading(false);
        return;
      }
      
      // Check if user is already a member
      const memberRef = doc(db, 'channelMembers', `${channelId}_${user.uid}`);
      const memberSnap = await getDoc(memberRef);
      
      if (memberSnap.exists()) {
        // User is already a member, just navigate to the channel
        navigate(`/channel/${channelId}`);
        onClose();
        return;
      }
      
      // Add user as a member
      await setDoc(memberRef, {
        channelId,
        userId: user.uid,
        isAdmin: false,
        joinedAt: new Date().toISOString(),
      });
      
      // Increment member count
      await updateDoc(doc(db, 'channels', channelId), {
        memberCount: increment(1)
      });
      
      // Navigate to the channel
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
          <h2 className="text-xl font-semibold">Join a Channel</h2>
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
              Channel Code
            </label>
            <input
              type="text"
              value={channelCode}
              onChange={(e) => setChannelCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="bg-slate-700 block w-full px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
            <p className="mt-2 text-sm text-slate-400">
              Ask a channel admin for the 6-digit channel code.
            </p>
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
              disabled={loading || channelCode.length !== 6}
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
