"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import Icon from "@/components/shared/Icon";

type Message = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  propertyId: string | null;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null; role?: string };
  receiver: { id: string; name: string | null; image: string | null; role?: string };
};

export const MessagesTab: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local storage unread state tracking
  const [readStatus, setReadStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ghar_chat_read_status");
      if (stored) {
        setReadStatus(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    refetchInterval: 6000, // Refresh every 6 seconds for live feel
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { receiverId: string; content: string }) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setNewMessage("");
      // Mark as read immediately on send
      if (activeConversationId) {
        markAsRead(activeConversationId, data.id);
      }
    },
  });

  // Group messages by conversation partner
  const conversations = useMemo(() => {
    const map = new Map<string, { partner: { id: string; name: string | null; image: string | null; role?: string }; messages: Message[] }>();
    
    messages.forEach((msg) => {
      const isSender = msg.senderId === user?.id;
      const partnerId = isSender ? msg.receiverId : msg.senderId;
      const partner = isSender ? msg.receiver : msg.sender;
      
      if (!map.has(partnerId)) {
        map.set(partnerId, { partner, messages: [] });
      }
      map.get(partnerId)!.messages.push(msg);
    });

    // Sort messages in each conversation by time (oldest to newest for rendering)
    map.forEach((conv) => {
      conv.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    return Array.from(map.values()).sort((a, b) => {
      const latestA = a.messages[a.messages.length - 1];
      const latestB = b.messages[b.messages.length - 1];
      return new Date(latestB.createdAt).getTime() - new Date(latestA.createdAt).getTime();
    });
  }, [messages, user?.id]);

  const activeConversation = conversations.find((c) => c.partner.id === activeConversationId);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  // Mark conversation as read
  const markAsRead = (partnerId: string, lastMsgId: string) => {
    setReadStatus((prev) => {
      const updated = { ...prev, [partnerId]: lastMsgId };
      try {
        localStorage.setItem("ghar_chat_read_status", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Trigger mark as read when selecting conversation
  useEffect(() => {
    if (activeConversationId && activeConversation) {
      const lastMsg = activeConversation.messages[activeConversation.messages.length - 1];
      if (lastMsg) {
        markAsRead(activeConversationId, lastMsg.id);
      }
    }
  }, [activeConversationId, activeConversation]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;
    sendMessageMutation.mutate({ receiverId: activeConversationId, content: newMessage });
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#022c22] rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50/50 h-[calc(100vh-76px)]">
      {/* Sidebar: Conversations List */}
      <div className="w-[360px] bg-white border-r border-slate-100 flex flex-col shrink-0 h-full">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Inbox</h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{conversations.length} active threads</p>
          </div>
          <button className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
            <Icon name="edit_note" size={22} />
          </button>
        </div>

        {/* Conversation Items list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 mt-10">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                <Icon name="chat_bubble_outline" size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No active threads</p>
              <p className="text-xs text-slate-400 mt-1">Send a message to an owner or tenant to start chatting.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const latestMsg = conv.messages[conv.messages.length - 1];
              const isActive = activeConversationId === conv.partner.id;
              
              // Unread if latest message receiver is current user and last read message ID is not this latest ID
              const isUnread = latestMsg.receiverId === user.id && readStatus[conv.partner.id] !== latestMsg.id;

              return (
                <button
                  key={conv.partner.id}
                  onClick={() => setActiveConversationId(conv.partner.id)}
                  className={`w-full p-4 flex items-start gap-3.5 transition-all relative text-left border-l-2 select-none outline-none ${
                    isActive 
                      ? 'bg-slate-50 border-l-[#022c22]' 
                      : isUnread 
                        ? 'bg-emerald-50/20 border-l-blue-500 hover:bg-slate-50/80' 
                        : 'border-l-transparent hover:bg-slate-50/50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {conv.partner.image ? (
                      <img 
                        src={conv.partner.image} 
                        alt={conv.partner.name || "User"} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#022c22]/5 border border-slate-100 flex items-center justify-center text-[#022c22] font-bold text-sm">
                        {conv.partner.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>

                  {/* Thread details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className={`text-[13px] truncate ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                          {conv.partner.name || "User"}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {new Date(latestMsg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    <p className={`text-xs truncate leading-relaxed ${isUnread ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                      {latestMsg.senderId === user.id ? "You: " : ""}
                      {latestMsg.content}
                    </p>
                  </div>

                  {/* Dot status */}
                  {isUnread && (
                    <span className="w-2 h-2 bg-emerald-600 rounded-full shrink-0 mt-2 ml-1 animate-pulse"></span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full relative">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-[76px] bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm shadow-slate-100/50">
              <div className="flex items-center">
                {activeConversation.partner.image ? (
                  <img 
                    src={activeConversation.partner.image} 
                    alt="Partner" 
                    className="w-10 h-10 rounded-full object-cover mr-3 border border-slate-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#022c22]/5 text-[#022c22] font-bold text-sm flex items-center justify-center mr-3 border border-slate-100">
                    {activeConversation.partner.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-800">{activeConversation.partner.name || "User"}</h3>
                    <span className="text-[9px] font-bold bg-[#022c22]/5 text-[#022c22] px-1.5 py-0.5 rounded tracking-wide uppercase">Partner</span>
                  </div>
                  <p className="text-[11px] font-medium text-green-600 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> Active
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-2">
                <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <Icon name="phone" size={18} />
                </button>
                <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <Icon name="more_vert" size={18} />
                </button>
              </div>
            </div>

            {/* Chat Messages viewport */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeConversation.messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className="flex items-start gap-2 max-w-[70%]">
                      {!isMe && (
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                          {activeConversation.partner.image ? (
                            <img src={activeConversation.partner.image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            activeConversation.partner.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 1) || "U"
                          )}
                        </div>
                      )}
                      <div>
                        <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-slate-800 border ${
                          isMe 
                            ? "bg-[#022c22] text-white border-transparent rounded-tr-none" 
                            : "bg-white text-slate-800 border-slate-100 rounded-tl-none"
                        }`}>
                          <p className="text-xs leading-relaxed font-medium break-words">{msg.content}</p>
                        </div>
                        <p className={`text-[9px] mt-1 font-semibold text-slate-400 ${isMe ? "text-right" : "text-left"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input bar */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex gap-2 items-center bg-slate-50 border border-slate-200/60 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-400 transition-all">
                <button type="button" className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-lg transition-colors shrink-0">
                  <Icon name="add" size={20} />
                </button>
                <input 
                  type="text" 
                  placeholder={`Send a message to ${activeConversation.partner.name || "User"}...`}
                  className="flex-1 bg-transparent border-none px-2 py-2 text-xs text-slate-800 focus:outline-none focus:ring-0 placeholder-slate-400 font-medium"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sendMessageMutation.isPending}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-[#022c22] text-white flex items-center justify-center shrink-0 hover:bg-[#15345a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm text-xs font-bold gap-1.5"
                >
                  {sendMessageMutation.isPending ? (
                    <Icon name="sync" size={14} className="animate-spin" />
                  ) : (
                    <>
                      <span>Send</span>
                      <Icon name="send" size={12} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 select-none">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200/40 shadow-inner">
              <Icon name="chat" size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-700">Select a thread</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs text-center leading-relaxed">Choose an existing conversation from the inbox sidebar to review messages or reply.</p>
          </div>
        )}
      </div>
    </div>
  );
};
