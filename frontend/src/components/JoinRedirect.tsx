import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

const JoinRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const code = searchParams.get('code');
  
  useEffect(() => {
    const joinWithCode = async () => {
      if (!code) {
        setError('No join code provided');
        setLoading(false);
        return;
      }
      
      try {
        // Find channel by code
        const channelsQuery = query(
          collection(db, 'channels'),
          where('joinCode', '==', code)
        );
        
        const channelSnap = await getDocs(channelsQuery);
        
        if (channelSnap.empty) {
          setError('Invalid join code');
          setLoading(false);
          return;
        }
        
        const channelId = channelSnap.docs[0].id;
        
        // Check if user is logged in
        if (!auth.currentUser) {
          // Redirect to login page and save the join code
          localStorage.setItem('pendingJoinCode', code);
          navigate('/login');
          return;
        }
        
        // Redirect to channel page
        navigate(`/channel/${channelId}`);
      } catch (err) {
        console.error("Error joining channel:", err);
        setError('Failed to join channel');
        setLoading(false);
      }
    };
    
    joinWithCode();
  }, [code, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Joining channel...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center bg-slate-800 p-8 rounded-lg max-w-md">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <p className="text-slate-300 mb-6">
            The channel you're trying to join may have been deleted or the link is invalid.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default JoinRedirect;
