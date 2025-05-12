import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { db, auth } from '../firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { ReactNode } from 'react';

const Button = ({ children, className = '', ...props }: { children: ReactNode; className?: string; [key: string]: any }) => (
  <button
    className={`px-4 py-2 rounded text-white font-medium ${className}`}
    {...props}
  >
    {children}
  </button>
);


const JoinChannelDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [channelId, setChannelId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in.');
      return;
    }

    if (!channelId.trim()) {
      setError('Channel ID cannot be empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const channelRef = doc(db, 'channels', channelId);
      const channelSnap = await getDoc(channelRef);

      if (!channelSnap.exists()) {
        setError('Channel not found.');
        setLoading(false);
        return;
      }

      // Add to channelMembers
      const memberRef = doc(
        collection(db, 'channelMembers'),
        `${channelId}_${user.uid}`
      );

      await setDoc(memberRef, {
        channelId,
        userId: user.uid,
        joinedAt: new Date(),
      });

      setIsOpen(false);
      setChannelId('');
    } catch (err) {
      console.error('Error joining channel:', err);
      setError('An error occurred while joining the channel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsOpen(true)}>
        Join a Channel
      </Button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-white mb-4">
              Join a Channel
            </Dialog.Title>

            <input
              type="text"
              placeholder="Enter Channel ID"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white mb-3"
            />

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleJoin}
                disabled={loading}
              >
                {loading ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default JoinChannelDialog;
