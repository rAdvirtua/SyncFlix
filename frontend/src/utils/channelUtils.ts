import { collection, query, where, getDocs, deleteDoc, Timestamp, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Deletes messages older than 24 hours for a specific channel
 */
export const deleteOldMessages = async (channelId: string) => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  try {
    // Query for messages older than 24 hours
    const messagesQuery = query(
      collection(db, 'channelMessages'),
      where('channelId', '==', channelId),
      where('timestamp', '<', oneDayAgo.toISOString())
    );
    
    const messageDocs = await getDocs(messagesQuery);
    
    // Delete in batches of 500 (Firestore limit)
    const batch = writeBatch(db);
    let count = 0;
    
    messageDocs.forEach(doc => {
      batch.delete(doc.ref);
      count++;
      
      // If batch reaches 500, commit and start a new batch
      if (count >= 500) {
        batch.commit();
        count = 0;
      }
    });
    
    // Commit any remaining deletes
    if (count > 0) {
      await batch.commit();
    }
    
    return messageDocs.size;
  } catch (error) {
    console.error("Error deleting old messages:", error);
    throw error;
  }
};

/**
 * Cleanup function to be called on app initialization
 * Checks for channels that have expired messages
 */
export const cleanupChannelMessages = async () => {
  try {
    // Get all channels
    const channelsQuery = query(collection(db, 'channels'));
    const channelDocs = await getDocs(channelsQuery);
    
    // Process each channel
    for (const channelDoc of channelDocs.docs) {
      const channelId = channelDoc.id;
      await deleteOldMessages(channelId);
    }
  } catch (error) {
    console.error("Error during message cleanup:", error);
  }
};

/**
 * Generate a shareable join link for a channel
 */
export const generateJoinLink = (channelCode: string): string => {
  return `${window.location.origin}/join?code=${channelCode}`;
};
