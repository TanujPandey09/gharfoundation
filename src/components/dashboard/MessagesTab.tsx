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
      <div className="w-full max-w-[1320px] mx-auto p-3.5 sm:p-5 text-[#222222]">
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm h-[calc(100vh-148px)] md:h-[calc(100vh-104px)] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-3 border-[#EBEBEB] border-t-[#FF385C] rounded-full animate-spin" />
            <p className="text-[#717171] text-xs font-bold uppercase tracking-wider">Loading Inbox...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1320px] mx-auto p-3.5 sm:p-5 text-[#222222]">
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden flex h-[calc(100vh-148px)] md:h-[calc(100vh-104px)]">
        {/* Sidebar: Conversations List (Full width on mobile when no thread active) */}
        <div
          className={`${
            activeConversation ? "hidden md:flex" : "flex"
          } w-full md:w-[340px] bg-white border-r border-[#EBEBEB] flex-col shrink-0 h-full`}
        >
          {/* Sidebar Header */}
          <div className="hero-mesh-bg p-4 sm:p-5 border-b border-[#EBEBEB] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF385C] block">Zero-Brokerage Inbox</span>
              <h2 className="text-base font-extrabold text-[#222222] tracking-tight mt-0.5">Direct Messages</h2>
              <p className="text-xs text-[#717171] font-medium mt-0.5">{conversations.length} active conversations</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-[#C8E6C9] text-[#008A05] px-2.5 py-1 rounded-full">
              <Icon name="verified" size={12} fill /> Direct
            </span>
          </div>

        {/* Conversation Items list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#EBEBEB]">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-[#717171] mt-8">
              <div className="w-12 h-12 bg-[#F7F7F7] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#EBEBEB]">
                <Icon name="chat_bubble_outline" size={22} className="text-[#717171]" />
              </div>
              <p className="text-sm font-bold text-[#222222]">No messages yet</p>
              <p className="text-xs text-[#717171] mt-1 leading-relaxed">
                Message any verified homeowner from a property page to start a direct zero-brokerage conversation.
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const latestMsg = conv.messages[conv.messages.length - 1];
              const isActive = activeConversationId === conv.partner.id;
              const isUnread = latestMsg.receiverId === user.id && readStatus[conv.partner.id] !== latestMsg.id;

              return (
                <button
                  key={conv.partner.id}
                  type="button"
                  onClick={() => setActiveConversationId(conv.partner.id)}
                  className={`w-full p-4 flex items-start gap-3.5 transition-all relative text-left border-l-2 select-none outline-none ${
                    isActive
                      ? "bg-[#F7F7F7] border-l-[#FF385C]"
                      : isUnread
                        ? "bg-[#FFF0F3]/40 border-l-[#FF385C] hover:bg-[#F7F7F7]"
                        : "border-l-transparent hover:bg-[#F7F7F7]/60"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {conv.partner.image ? (
                      <img
                        src={conv.partner.image}
                        alt={conv.partner.name || "User"}
                        className="w-10 h-10 rounded-full object-cover border border-[#EBEBEB]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center text-white font-bold text-xs">
                        {conv.partner.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#008A05] border-2 border-white rounded-full" />
                  </div>

                  {/* Thread details */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className={`text-xs sm:text-sm truncate ${isUnread ? "font-extrabold text-[#222222]" : "font-bold text-[#222222]"}`}>
                        {conv.partner.name || "Verified User"}
                      </p>
                      <p className="text-[10px] text-[#717171] shrink-0 font-semibold">
                        {new Date(latestMsg.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </p>
                    </div>

                    <p className={`text-xs truncate leading-relaxed ${isUnread ? "font-bold text-[#222222]" : "text-[#717171]"}`}>
                      {latestMsg.senderId === user.id ? "You: " : ""}
                      {latestMsg.content}
                    </p>
                  </div>

                  {isUnread && (
                    <span className="w-2 h-2 bg-[#FF385C] rounded-full shrink-0 mt-2 ml-1" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${activeConversation ? "flex" : "hidden md:flex"} flex-1 flex-col bg-[#F7F7F7] h-full relative`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-[64px] bg-white border-b border-[#EBEBEB] flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1.5 -ml-1 rounded-lg text-[#222222] hover:bg-[#F7F7F7]"
                >
                  <Icon name="arrow_back" size={20} />
                </button>
                {activeConversation.partner.image ? (
                  <img
                    src={activeConversation.partner.image}
                    alt="Partner"
                    className="w-9 h-9 rounded-full object-cover border border-[#EBEBEB] shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#222222] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {activeConversation.partner.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[#222222] truncate">{activeConversation.partner.name || "Verified User"}</h3>
                    <span className="text-[10px] font-bold bg-[#E8F5E9] text-[#008A05] px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-[#717171]">Direct Zero-Brokerage Chat</p>
                </div>
              </div>
            </div>

            {/* Chat Messages viewport */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
              {activeConversation.messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className="flex items-start gap-2 max-w-[82%] sm:max-w-[70%]">
                      {!isMe && (
                        <div className="w-6 h-6 rounded-full bg-[#222222] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                          {activeConversation.partner.image ? (
                            <img src={activeConversation.partner.image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            activeConversation.partner.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 1) || "U"
                          )}
                        </div>
                      )}
                      <div>
                        <div
                          className={`rounded-2xl px-4 py-2.5 border ${
                            isMe
                              ? "bg-[#222222] text-white border-[#222222] rounded-tr-sm"
                              : "bg-white text-[#222222] border-[#EBEBEB] rounded-tl-sm"
                          }`}
                        >
                          <p className="text-xs sm:text-sm leading-relaxed font-medium break-words">{msg.content}</p>
                        </div>
                        <p className={`text-[10px] mt-1 font-semibold text-[#717171] ${isMe ? "text-right" : "text-left"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-[#EBEBEB]">
              <form
                onSubmit={handleSend}
                className="flex gap-2 items-center bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl p-1.5 focus-within:bg-white focus-within:border-[#222222] transition-all"
              >
                <input
                  type="text"
                  placeholder={`Message ${activeConversation.partner.name || "owner"}...`}
                  className="flex-1 min-w-0 bg-transparent border-none px-3 py-2 text-xs sm:text-sm text-[#222222] focus:outline-none placeholder-[#717171] font-medium"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sendMessageMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="px-4 py-2.5 rounded-lg bg-[#FF385C] hover:bg-[#E00B41] text-white flex items-center justify-center shrink-0 disabled:opacity-50 transition-all active:scale-[0.98] text-xs font-bold gap-1.5"
                >
                  {sendMessageMutation.isPending ? (
                    <Icon name="sync" size={14} className="animate-spin" />
                  ) : (
                    <>
                      <span>Send</span>
                      <Icon name="send" size={13} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#717171] select-none p-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 border border-[#EBEBEB]">
              <Icon name="chat" size={26} className="text-[#FF385C]" />
            </div>
            <p className="text-sm font-bold text-[#222222]">Select a conversation</p>
            <p className="text-xs text-[#717171] mt-1 max-w-xs text-center leading-relaxed">
              Choose a thread from the left to message homeowners or prospective tenants directly.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
