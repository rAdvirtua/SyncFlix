import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot, addDoc, updateDoc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import YouTube from 'react-youtube';
import { Paperclip, Play, Send, Users, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  timestamp: any;
}

const Channel = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [channel, setChannel] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [videoId, setVideoId] = useState('');
  const [inputVideoId, setInputVideoId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerState, setPlayerState] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = auth.currentUser;

  // Fetch channel data and check if user is admin
  useEffect(() => {
    if (!channelId || !user) return;

    const fetchChannelData = async () => {
      try {
        const channelDoc = await getDoc(doc(db, 'channels', channelId));
        if (!channelDoc.exists()) {
          setError('Channel not found');
          setLoading(false);
          return;
        }

        setChannel(channelDoc.data());

        // Check if user is admin
        const memberDoc = await getDoc(doc(db, 'channelMembers', `${channelId}_${user.uid}`));
        if (!memberDoc.exists()) {
          setError('You are not a member of this channel');
          setLoading(false);
          return;
        }

        setIsAdmin(memberDoc.data().isAdmin || false);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching channel:", err);
        setError('Failed to load channel');
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [channelId, user]);

  // Subscribe to video state updates
  useEffect(() => {
    if (!channelId) return;

    const videoStateRef = doc(db, 'channelVideoState', channelId);
    const unsubscribe = onSnapshot(videoStateRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setVideoId(data.videoId || '');
        
        // Only update player if you're not the admin
        if (!isAdmin && playerRef.current) {
          if (data.isPlaying && playerState !== 1) {
            playerRef.current.internalPlayer.playVideo();
          } else if (!data.isPlaying && playerState === 1) {
            playerRef.current.internalPlayer.pauseVideo();
          }
          
          // If time is different by more than 3 seconds, seek to the correct time
          if (Math.abs(data.currentTime - currentTime) > 3) {
            playerRef.current.internalPlayer.seekTo(data.currentTime);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [channelId, isAdmin, playerState, currentTime]);

  // Subscribe to channel messages
  useEffect(() => {
    if (!channelId) return;

    const messagesQuery = query(
      collection(db, 'channelMessages'),
      where('channelId', '==', channelId),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      setMessages(newMessages);
      
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [channelId]);

  const handlePlayVideo = () => {
    if (!channelId || !isAdmin) return;
    
    // Extract YouTube video ID from URL if needed
    let videoIdToUse = inputVideoId;
    
    // If it's a full YouTube URL, extract the ID
    if (inputVideoId.includes('youtube.com') || inputVideoId.includes('youtu.be')) {
      const url = new URL(inputVideoId);
      if (inputVideoId.includes('youtube.com/watch')) {
        videoIdToUse = url.searchParams.get('v') || '';
      } else if (inputVideoId.includes('youtu.be/')) {
        videoIdToUse = url.pathname.substring(1);
      }
    }
    
    if (!videoIdToUse) {
      setError('Please enter a valid YouTube video ID or URL');
      return;
    }

    setVideoId(videoIdToUse);
    updateVideoState(videoIdToUse, true, 0);
  };

  const updateVideoState = async (vid: string, isPlaying: boolean, time: number) => {
    if (!channelId) return;
    
    try {
      const videoStateRef = doc(db, 'channelVideoState', channelId);
      await updateDoc(videoStateRef, {
        videoId: vid,
        isPlaying,
        currentTime: time,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid
      });
    } catch (err) {
      // If document doesn't exist, create it
      try {
        const videoStateRef = doc(db, 'channelVideoState', channelId);
        await updateDoc(videoStateRef, {
          videoId: vid,
          isPlaying,
          currentTime: time,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.uid
        });
      } catch (error) {
        console.error("Error updating video state:", error);
      }
    }
  };

  const handlePlayerStateChange = (event: any) => {
    // Update the player state
    setPlayerState(event.data);
    
    // If admin, sync the state to Firestore
    if (isAdmin) {
      // 1 = playing, 2 = paused
      if (event.data === 1 || event.data === 2) {
        const player = event.target;
        const currentTime = player.getCurrentTime();
        setCurrentTime(currentTime);
        updateVideoState(videoId, event.data === 1, currentTime);
      }
    }
  };

  const handlePlayerReady = (event: any) => {
    playerRef.current = event;
  };

  const handleSendMessage = async () => {
    if (!channelId || !user || (!messageText.trim() && !selectedFile)) return;
    
    try {
      let fileUrl = '';
      let fileType = '';
      
      // Upload file if selected
      if (selectedFile) {
        const fileId = uuidv4();
        const fileRef = ref(storage, `channel_files/${channelId}/${fileId}_${selectedFile.name}`);
        await uploadBytes(fileRef, selectedFile);
        fileUrl = await getDownloadURL(fileRef);
        
        // Determine file type
        if (selectedFile.type.startsWith('image/')) {
          fileType = 'image';
        } else if (selectedFile.type.startsWith('video/')) {
          fileType = 'video';
        } else if (selectedFile.type.startsWith('audio/')) {
          fileType = 'audio';
        } else {
          fileType = 'file';
        }
      }
      
      // Create message
      await addDoc(collection(db, 'channelMessages'), {
        channelId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        content: messageText.trim(),
        fileUrl,
        fileType,
        timestamp: new Date().toISOString()
      });
      
      // Clear input
      setMessageText('');
      setSelectedFile(null);
    } catch (err) {
      console.error("Error sending message:", err);
      setError('Failed to send message');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">{error}</div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">#{channel.name}</h1>
          <p className="text-slate-400 text-sm">{channel.description || "No description"}</p>
        </div>
        <div className="flex items-center text-slate-400">
          <Users size={16} className="mr-1" />
          <span>{channel.memberCount} members</span>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* YouTube player section */}
        <div className="w-full md:w-2/3 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            {videoId ? (
              <div className="aspect-w-16 aspect-h-9">
                <YouTube
                  videoId={videoId}
                  onStateChange={handlePlayerStateChange}
                  onReady={handlePlayerReady}
                  opts={{
                    height: '100%',
                    width: '100%',
                    playerVars: {
                      // https://developers.google.com/youtube/player_parameters
                      autoplay: 1,
                    },
                  }}
                />
              </div>
            ) : (
              <div className="aspect-w-16 aspect-h-9 flex items-center justify-center bg-slate-900">
                <div className="text-center p-4">
                  <div className="text-slate-400 mb-2">No video playing</div>
                  {isAdmin && (
                    <div className="text-sm text-slate-500">
                      Enter a YouTube URL or video ID above to start playing
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Video controls for admin */}
            {isAdmin && (
              <div className="p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputVideoId}
                    onChange={(e) => setInputVideoId(e.target.value)}
                    placeholder="Enter YouTube URL or Video ID"
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={handlePlayVideo}
                    disabled={!inputVideoId}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 flex items-center"
                  >
                    <Play size={16} className="mr-1" />
                    Play
                  </button>
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  As the admin, you control playback for everyone in this channel
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Chat section */}
        <div className="w-full md:w-1/3 flex flex-col border-t md:border-t-0 md:border-l border-slate-700">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-850">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 py-4">
                No messages yet. Be the first to say something!
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.userId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${message.userId === user?.uid ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-200'}`}>
                      <div className="text-xs opacity-75 mb-1">
                        {message.userId === user?.uid ? 'You' : message.userName}
                      </div>
                      
                      {message.content && <div className="mb-2">{message.content}</div>}
                      
                      {message.fileUrl && message.fileType === 'image' && (
                        <img 
                          src={message.fileUrl} 
                          alt="Shared image" 
                          className="rounded max-w-full h-auto"
                        />
                      )}
                      
                      {message.fileUrl && message.fileType === 'video' && (
                        <video 
                          src={message.fileUrl} 
                          controls 
                          className="rounded max-w-full h-auto"
                        />
                      )}
                      
                      {message.fileUrl && message.fileType === 'audio' && (
                        <audio 
                          src={message.fileUrl} 
                          controls 
                          className="w-full"
                        />
                      )}
                      
                      {message.fileUrl && message.fileType === 'file' && (
                        <a 
                          href={message.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Download file
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message input */}
          <div className="p-3 bg-slate-800">
            {selectedFile && (
              <div className="bg-slate-700 p-2 rounded-lg mb-2 flex justify-between items-center">
                <span className="text-sm truncate">{selectedFile.name}</span>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-400"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-orange-500"
              >
                <Paperclip size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() && !selectedFile}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Channel;
