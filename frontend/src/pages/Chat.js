// src/components/Chat.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, MoreVertical, ArrowLeft, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import { API_CONFIG } from '../config/config';
import io from 'socket.io-client';
import { format } from 'date-fns';

const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// Helper: dedupe array of objects by _id
const uniqueById = (arr) => {
  const seen = new Set();
  return arr.filter((item) => {
    if (!item || !item._id) return false;
    const id = String(item._id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const Chat = () => {
  const { user: currentUser, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const handledUserParamRef = useRef(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch conversations (only those backend returns — now only with lastMessage)
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API_CONFIG.CHAT.CONVERSATIONS);
      if (res.success) {
        // Handle different response structures
        const conversationsData = res.data?.data || res.data || [];
        const uniqueConversations = uniqueById(conversationsData);
        setConversations(uniqueConversations);
        return uniqueConversations;
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Helper: create or open a conversation by recipient userId
  const createOrOpenConversation = useCallback(async (userId) => {
    try {
      // Prevent self-conversation
      if (String(userId) === String(currentUser?._id)) {
        console.warn('Attempted to start a conversation with self; ignoring.');
        return null;
      }
      const res = await apiClient.post(API_CONFIG.CHAT.CREATE_CONVERSATION, { recipientId: userId });
      if (res.success) {
        const conv = res.data?.data || res.data;
        setSelectedConversation(conv);
        
        // Always add to conversations list, even if no lastMessage yet
        setConversations(prev => {
          const existing = prev.find(c => String(c._id) === String(conv._id));
          if (existing) {
            // Update existing conversation and move to top
            const filtered = prev.filter(c => String(c._id) !== String(conv._id));
            return [conv, ...filtered];
          }
          // Add new conversation to top
          return [conv, ...prev];
        });
        return conv;
      }
    } catch (error) {
      console.error('Error creating/opening conversation', error);
    }
    return null;
  }, []);

  // Handle URL parameter for direct messaging from Directory (robust)
  useEffect(() => {
    const userId = searchParams.get('user') || location.state?.user;
    if (!userId) return;
    if (!currentUser) return; // wait for auth
    if (handledUserParamRef.current) return; // already handled
    if (loading) return; // wait until conversations initial load completes

    // Mark handled to avoid duplicate attempts
    handledUserParamRef.current = true;

    // Try to find existing conversation first
    const existingConversation = conversations.find(conv =>
      Array.isArray(conv.participants) && conv.participants.some(p => String(p._id) === String(userId))
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation);
      // Clear param after successful selection
      setSearchParams({});
      if (location.state?.user) {
        // Clear navigation state to prevent re-handling on back/forward
        navigate(location.pathname, { replace: true, state: {} });
      }
      return;
    }

    // Otherwise create or open, then clear param when successful
    (async () => {
      const conv = await createOrOpenConversation(userId);
      if (conv) {
        setSearchParams({});
        if (location.state?.user) {
          navigate(location.pathname, { replace: true, state: {} });
        }
      } else {
        // If failed, allow retry on next render
        handledUserParamRef.current = false;
      }
    })();
  }, [searchParams, currentUser, conversations, loading, createOrOpenConversation, setSearchParams]);

  // Socket setup
  useEffect(() => {
    if (!token) return;
    
    // Clean up existing socket
    if (socketRef.current) {
      try {
        if (socketRef.current.connected) {
          socketRef.current.disconnect();
        } else {
          socketRef.current.close();
        }
      } catch (e) {
        // no-op
      }
    }
    
    const newSocket = io(API_CONFIG.BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = newSocket;

    newSocket.on('connect_error', (err) => {
      console.log('socket connect_error:', err?.message || err);
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      // Join user room for receiving conversation updates
      if (currentUser?._id) {
        newSocket.emit('join', `user_${currentUser._id}`);
      }
    });

    // New incoming message for currently opened conversation
    newSocket.on('newMessage', (message) => {
      // Only append if conversation is currently shown and message is not duplicate
      if (selectedConversation && String(message.conversationId) === String(selectedConversation._id)) {
        setMessages(prev => {
          const exists = prev.find(m => String(m._id) === String(message._id));
          if (exists) return prev;
          return [...prev, message];
        });
      }
    });

    // Updated conversation (when lastMessage changes)
    newSocket.on('updateConversation', (updatedConv) => {
      setConversations(prev => {
        const existing = prev.find(c => String(c._id) === String(updatedConv._id));
        if (existing) {
          // Move updated conversation to top and update it
          const filtered = prev.filter(c => String(c._id) !== String(updatedConv._id));
          return [updatedConv, ...filtered];
        }
        // Add new conversation to top if it doesn't exist
        return [updatedConv, ...prev];
      });
      
      // If this is the currently selected conversation, update it too
      if (selectedConversation && String(selectedConversation._id) === String(updatedConv._id)) {
        setSelectedConversation(updatedConv);
      }
    });

    return () => {
      if (newSocket) {
        try {
          newSocket.off('newMessage');
          newSocket.off('updateConversation');
          if (newSocket.connected) {
            newSocket.disconnect();
          } else {
            newSocket.close();
          }
        } catch (e) {
          // no-op
        }
      }
    };
  }, [token, currentUser?._id]); // Remove selectedConversation dependency to avoid reconnections

  // Fetch messages when selecting conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await apiClient.get(`${API_CONFIG.CHAT.CONVERSATIONS}/${selectedConversation._id}/messages`);
        if (res.success) {
          const messagesData = res.data?.data || res.data || [];
          setMessages(messagesData);
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
        setMessages([]);
      }
    };
    fetchMessages();

    // Join conversation room for real-time messages
    if (socketRef.current) {
      socketRef.current.emit('join', `conversation_${selectedConversation._id}`);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave', `conversation_${selectedConversation._id}`);
      }
    };
  }, [selectedConversation]);

  // Auto-scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search users (debounced)
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      if (!currentUser) return;
      try {
        const res = await apiClient.get(`${API_CONFIG.USERS.SEARCH}?q=${encodeURIComponent(searchQuery)}`);
        if (res.success) {
          // Handle different response structures and exclude self
          const searchData = res.data?.data || res.data?.users || res.data || [];
          const results = searchData.filter(u => String(u._id) !== String(currentUser._id));
          setSearchResults(uniqueById(results));
        }
      } catch (err) {
        console.error("Search users error", err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, currentUser]);

  // Send message (optimistic)
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      conversationId: selectedConversation._id,
      sender: { _id: currentUser._id, name: currentUser.name, profileImage: currentUser.profileImage },
      text: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const res = await apiClient.post(`${API_CONFIG.CHAT.CONVERSATIONS}/${selectedConversation._id}/messages`, { text: optimisticMessage.text });
      if (res.success) {
        const realMessage = res.data?.data || res.data;
        // Replace optimistic message with real message (by matching temp id)
        setMessages(prev => {
          return prev.map(m => (m._id === tempId ? realMessage : m));
        });

        // Update the conversation in the list with the new lastMessage and move to top
        setConversations(prev => {
          const updatedConv = {
            ...selectedConversation,
            lastMessage: realMessage,
            updatedAt: new Date().toISOString()
          };
          
          // Remove the old conversation and add updated one at the top
          const filtered = prev.filter(c => String(c._id) !== String(selectedConversation._id));
          return [updatedConv, ...filtered];
        });

        // Update selectedConversation to reflect the new lastMessage
        setSelectedConversation(prev => ({
          ...prev,
          lastMessage: realMessage,
          updatedAt: new Date().toISOString()
        }));
      } else {
        // Remove optimistic message if API call failed
        setMessages(prev => prev.filter(m => m._id !== tempId));
      }
    } catch (error) {
      console.error("Failed to send message", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  // When user selects a search result — create or return conversation and open it
  const handleSelectUser = async (selectedUser) => {
    setSearchQuery('');
    setSearchResults([]);

    await createOrOpenConversation(selectedUser._id);
  };

  if (!currentUser) return null;

  const recipient = selectedConversation?.participants?.find(p => String(p._id) !== String(currentUser._id));

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-white dark:bg-gray-800">
      {/* Sidebar */}
      <div className={`w-full lg:w-1/3 xl:w-1/4 border-r border-gray-200 dark:border-gray-700 flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Alumni Network</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Connect with fellow graduates</p>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search alumni..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Search results (render only when searching) */}
          {searchQuery ? (
            <>
              {searchResults.length > 0 ? (
                searchResults.map(userResult => (
                  <div key={userResult._id} onClick={() => handleSelectUser(userResult)} className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <img src={userResult.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userResult.name)}&background=random`} alt={userResult.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{toTitleCase(userResult.name)}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{userResult.batch || ''} {userResult.branch || ''}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-gray-500">No results</p>
              )}
            </>
          ) : (
            // Conversations list (sorted by most recent activity)
            uniqueById(conversations)
              .sort((a, b) => {
                const aTime = a.lastMessage?.createdAt || a.updatedAt || a.createdAt;
                const bTime = b.lastMessage?.createdAt || b.updatedAt || b.createdAt;
                return new Date(bTime) - new Date(aTime);
              })
              .map((conv) => {
              // find the other participant
              const otherParticipant = conv.participants?.find(p => String(p._id) !== String(currentUser._id));
              if (!otherParticipant) return null;

              const isSelected = selectedConversation && String(selectedConversation._id) === String(conv._id);
              return (
                <div
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 flex items-center gap-4 cursor-pointer ${isSelected ? 'bg-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <img src={otherParticipant.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name)}&background=random`} alt={otherParticipant.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{toTitleCase(otherParticipant.name)}</h3>
                      {conv.lastMessage && (
                        <p className={`text-xs text-right mt-1 ${isSelected ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                          {format(new Date(conv.lastMessage.createdAt), "p")}
                        </p>
                      )}
                    </div>
                    <p className={`text-sm truncate ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {conv.lastMessage ? `${String(conv.lastMessage.sender?._id) === String(currentUser._id) ? "You: " : ""}${conv.lastMessage.text}` : "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Message view */}
      <div className={`flex-1 flex-col ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
        {selectedConversation && recipient ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConversation(null)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" /></button>
                <img src={recipient.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient.name)}&background=random`} alt={recipient.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">{toTitleCase(recipient.name)}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{recipient.batch || ''} {recipient.branch || ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map(message => {
                  const isMine = String(message.sender?._id) === String(currentUser._id);
                  return (
                    <div key={message._id} className={`flex items-end w-full gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${isMine ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border dark:border-gray-600 rounded-bl-none'}`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs text-right mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                          {format(new Date(message.createdAt), 'p')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="max-w-4xl mx-auto flex items-center gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={1}
                />
                <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center p-8">
              <GraduationCap className="w-24 h-24 mx-auto mb-6 text-blue-300 dark:text-blue-700" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Welcome to Alumni Network</h2>
              <p className="text-gray-600 dark:text-gray-400">Select a conversation or search for an alum to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
