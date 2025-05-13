import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { LogOut, Shield, Trash, UserPlus, X } from 'lucide-react';

interface MemberListModalProps {
  channelId: string;
  isAdmin: boolean;
  onClose: () => void;
  onDeleteChannel: () => void;
}

interface Member {
  id: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  joinedAt: string;
}

const MemberListModal = ({ channelId, isAdmin, onClose, onDeleteChannel }: MemberListModalProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersQuery = query(
          collection(db, 'channelMembers'),
          where('channelId', '==', channelId)
        );
        
        const memberDocs = await getDocs(membersQuery);
        const membersList = memberDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Member[];
        
        // Sort members (admins first, then by join date)
        membersList.sort((a, b) => {
          if (a.isAdmin && !b.isAdmin) return -1;
          if (!a.isAdmin && b.isAdmin) return 1;
          return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        });
        
        setMembers(membersList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError('Failed to load members');
        setLoading(false);
      }
    };

    fetchMembers();
  }, [channelId]);

  const makeAdmin = async (memberId: string, userId: string) => {
    try {
      const memberRef = doc(db, 'channelMembers', memberId);
      await updateDoc(memberRef, {
        isAdmin: true
      });
      
      // Update local state
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, isAdmin: true } : member
      ));
    } catch (err) {
      console.error("Error making user admin:", err);
      setError('Failed to update admin status');
    }
  };

  const leaveChannel = async () => {
    if (!currentUser) return;
    
    try {
      // Remove user from channel members
      const memberDocId = `${channelId}_${currentUser.uid}`;
      await deleteDoc(doc(db, 'channelMembers', memberDocId));
      
      // Update channel member count
      const channelRef = doc(db, 'channels', channelId);
      await updateDoc(channelRef, {
        memberCount: members.length - 1
      });
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error("Error leaving channel:", err);
      setError('Failed to leave channel');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold">Channel Members</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading members...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : members.length === 0 ? (
            <div className="text-slate-400 text-center py-4">No members found</div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                      {member.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium flex items-center">
                        {member.userName}
                        {member.isAdmin && (
                          <Shield size={14} className="ml-1 text-orange-500" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && currentUser && member.userId !== currentUser.uid && !member.isAdmin && (
                    <button
                      onClick={() => makeAdmin(member.id, member.userId)}
                      className="p-1 text-slate-300 hover:text-orange-500"
                      title="Make Admin"
                    >
                      <UserPlus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-700">
          {isAdmin ? (
            <button
              onClick={onDeleteChannel}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white rounded py-2 px-4"
            >
              <Trash size={16} />
              <span>Delete Channel</span>
            </button>
          ) : (
            <button
              onClick={leaveChannel}
              className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white rounded py-2 px-4"
            >
              <LogOut size={16} />
              <span>Leave Channel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberListModal;