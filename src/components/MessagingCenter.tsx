import React, { useState } from 'react';
import { Send, FileText, ShieldCheck, Check, Plus, MessageSquare, User } from 'lucide-react';
import { ChatThread, ChatMessage } from '../types';

interface MessagingCenterProps {
  threads: ChatThread[];
  activeThreadId?: string;
  onSendMessage: (threadId: string, text: string, proposal?: ChatMessage['proposal']) => void;
  isOnline: boolean;
  isShared?: boolean;
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({
  threads,
  activeThreadId,
  onSendMessage,
  isOnline,
  isShared = false,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    activeThreadId || (threads[0]?.id || '')
  );
  const [inputText, setInputText] = useState('');
  const [showProposalForm, setShowProposalForm] = useState(false);

  // Proposal form state
  const [propCrop, setPropCrop] = useState('');
  const [propTonnes, setPropTonnes] = useState(1);
  const [propPrice, setPropPrice] = useState(0);

  const activeThread = threads.find((t) => t.id === selectedId) || threads[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;
    onSendMessage(activeThread.id, inputText.trim());
    setInputText('');
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread) return;
    const total = propTonnes * propPrice;
    onSendMessage(
      activeThread.id,
      `I would like to discuss ${propTonnes} MT of ${propCrop} at $${propPrice}/MT (quoted subtotal: $${total.toLocaleString()}).`,
      {
        cropName: propCrop,
        tonnes: propTonnes,
        pricePerTonne: propPrice,
        total,
        status: 'Pending',
      }
    );
    setShowProposalForm(false);
  };

  return (
    <div className="pb-16">
      <div className="space-y-6">
          {/* Page Header */}
          <div className="pb-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749] mb-1">
                <span>Buyer &amp; Producer Messages</span>
                <span aria-hidden="true">·</span>
                <span>{isShared ? 'Shared Conversations' : 'Locally Stored Conversations'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900">
                Direct Trade · Conversations and Proposals
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                {isShared ? 'Messages are stored in Supabase and visible to both conversation participants.' : 'Messages are stored in this browser; no live messaging service is connected.'}
              </p>
            </div>

          {/* Main Messaging Layout */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
            {/* Left Column: Threads List */}
            <div className="md:col-span-4 border-r border-stone-200 flex flex-col bg-stone-50/50">
              <div className="p-4 border-b border-stone-200">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Active Conversations ({threads.length})
                </h2>
              </div>

              <div className="divide-y divide-stone-200 overflow-y-auto flex-1">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setSelectedId(thread.id);
                      setShowProposalForm(false);
                    }}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 cursor-pointer ${
                      activeThread?.id === thread.id
                        ? 'bg-white border-l-4 border-l-[#0D5C3A] shadow-xs'
                        : 'hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0D5C3A]/10 text-[#0D5C3A] flex items-center justify-center font-bold text-xs shrink-0">
                      {thread.avatarSeed}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-stone-900 truncate font-display">
                          {thread.contactName}
                        </p>
                        <span className="text-[10px] text-stone-400 tabular-nums">{thread.lastTimestamp}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{thread.contactFarm}</p>
                      <p className="text-[11px] text-stone-600 truncate mt-1">
                        {thread.lastMessage}
                      </p>
                      <span className="inline-block mt-1 text-[10px] text-[#0D5C3A] font-bold truncate">
                        {thread.cropSubject}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Chat Window */}
            {activeThread ? (
              <div className="md:col-span-8 flex flex-col bg-white">
                {/* Thread Header */}
                <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0D5C3A] text-white flex items-center justify-center font-bold text-xs">
                      {activeThread.avatarSeed}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 font-display">{activeThread.contactName}</h3>
                      <p className="text-xs text-stone-500">
                        {activeThread.contactRole} · {activeThread.contactFarm}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowProposalForm(!showProposalForm)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D5C3A] hover:bg-[#094B2E] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#F7B500]" />
                      <span>Send Trade Quote</span>
                    </button>
                  </div>
                </div>

            {/* Proposal Generator Drawer (if open) */}
            {showProposalForm && (
              <div className="p-4 bg-stone-100/80 border-b border-stone-200 text-xs">
                <form onSubmit={handleSendProposal} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 font-display">
                      Share a trade quote for discussion
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowProposalForm(false)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-stone-600 mb-1">Crop Subject</label>
                      <input
                        type="text"
                        required
                        value={propCrop}
                        onChange={(e) => setPropCrop(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">Tonnes (MT)</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={propTonnes}
                        onChange={(e) => setPropTonnes(parseFloat(e.target.value) || 0.01)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">Price / MT ($)</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={propPrice}
                        onChange={(e) => setPropPrice(parseFloat(e.target.value) || 0.01)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-600">
                      Quoted subtotal: <strong className="text-[#0D5C3A] tabular-nums">${(propTonnes * propPrice).toLocaleString()}</strong>
                    </span>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#0D5C3A] text-white rounded-lg font-bold hover:bg-[#094B2E] cursor-pointer"
                    >
                      Post Proposal to Chat
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Chat Messages Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {activeThread.messages.map((msg) => {
                const isMe = msg.senderRole === 'buyer';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-stone-400 mb-1 px-1">
                      {msg.senderName} · {msg.timestamp}
                    </span>

                    <div
                      className={`max-w-md rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                        isMe
                          ? 'bg-[#0D5C3A] text-white rounded-tr-none'
                          : 'bg-stone-100 text-stone-900 border border-stone-200 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Interactive Proposal Card in Chat */}
                      {msg.proposal && (
                        <div
                          className={`mt-3 p-3 rounded-xl border text-xs space-y-2 ${
                            isMe
                              ? 'bg-black/20 border-white/20 text-white'
                              : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold uppercase tracking-wider text-[10px] text-[#F7B500]">
                              Trade quote · discussion only
                            </span>
                            <span className="font-semibold text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded">
                              {msg.proposal.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div>
                              <span className="opacity-70 block">Commodity</span>
                              <span className="font-semibold">{msg.proposal.cropName}</span>
                            </div>
                            <div>
                              <span className="opacity-70 block">Volume</span>
                              <span className="font-semibold tabular-nums">{msg.proposal.tonnes} MT</span>
                            </div>
                            <div>
                              <span className="opacity-70 block">Price / MT</span>
                              <span className="font-semibold tabular-nums">${msg.proposal.pricePerTonne}</span>
                            </div>
                            <div>
                              <span className="opacity-70 block">Quoted subtotal</span>
                              <span className="font-bold text-[#F7B500] tabular-nums">
                                ${msg.proposal.total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] opacity-75">
                            This quote does not create an order or process payment. Use an active marketplace listing to submit an order request.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Offline notification badge in chat */}
            {!isOnline && (
              <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
                <span>Offline messages are stored on this device only and are not delivered or synced automatically.</span>
              </div>
            )}

            {/* Message Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-stone-200 flex items-center gap-2 bg-stone-50/50">
              <input
                type="text"
                placeholder={`Message ${activeThread.contactName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0D5C3A]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-[#0D5C3A] hover:bg-[#094B2E] text-white rounded-xl transition disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#F7B500]" />
              </button>
            </form>
          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-8 text-stone-400 text-xs">
            Select a thread on the left to start direct negotiation.
          </div>
        )}
      </div>
      </div>
      </div>
    </div>
  );
};
