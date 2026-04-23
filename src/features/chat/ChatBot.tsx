import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Trash2, Key, Bot, User, Sparkles,
  ChevronDown, AlertCircle, Settings, ArrowLeft,
} from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import type { ChatEntry } from '../../hooks/useChat';
import { getApiKey, saveApiKey, removeApiKey } from '../../lib/groq';
import './chat.css';

function renderContent(text: string) {
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

const MessageBubble: React.FC<{ entry: ChatEntry; index: number }> = ({ entry, index }) => {
  const isUser = entry.role === 'user';
  return (
    <motion.div
      className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
    >
      <div className={`chat-avatar ${isUser ? 'chat-avatar--user' : 'chat-avatar--bot'}`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--bot'}`}>
        <div className="chat-bubble__content" dangerouslySetInnerHTML={{ __html: renderContent(entry.content) }} />
        <span className="chat-bubble__time">
          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};

const StreamingBubble: React.FC<{ content: string }> = ({ content }) => (
  <motion.div className="chat-message chat-message--assistant" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
    <div className="chat-avatar chat-avatar--bot"><Bot size={14} /></div>
    <div className="chat-bubble chat-bubble--bot chat-bubble--streaming">
      <div className="chat-bubble__content" dangerouslySetInnerHTML={{ __html: renderContent(content) }} />
      <span className="chat-streaming-cursor" />
    </div>
  </motion.div>
);

const TypingIndicator: React.FC = () => (
  <motion.div className="chat-message chat-message--assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="chat-avatar chat-avatar--bot"><Bot size={14} /></div>
    <div className="chat-bubble chat-bubble--bot chat-typing">
      <span className="chat-typing__dot" /><span className="chat-typing__dot" /><span className="chat-typing__dot" />
    </div>
  </motion.div>
);

const QUICK_PROMPTS = [
  { label: '😮‍💨 Stressed', prompt: "I'm feeling really stressed right now. Can you help me calm down?" },
  { label: '😴 Can\'t sleep', prompt: "I'm having trouble sleeping. Any tips?" },
  { label: '🧘 Breathe', prompt: 'Guide me through a quick breathing exercise.' },
  { label: '💭 Anxious', prompt: "I'm having anxious thoughts and can't stop overthinking." },
];

const SettingsPanel: React.FC<{ onBack: () => void; onClear: () => void; messageCount: number }> = ({ onBack, onClear, messageCount }) => {
  const [key, setKey] = useState(getApiKey() || '');
  const [saved, setSaved] = useState(!!getApiKey());
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => { if (key.trim()) { saveApiKey(key.trim()); setSaved(true); setTimeout(() => onBack(), 600); } };
  const handleRemove = () => { removeApiKey(); setKey(''); setSaved(false); };

  return (
    <motion.div className="chat-settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
      <div className="chat-settings__header">
        <button className="chat-icon-btn" onClick={onBack}><ArrowLeft size={18} /></button>
        <h3>Settings</h3>
      </div>
      <div className="chat-settings__section">
        <label className="chat-settings__label"><Key size={14} /> Groq API Key</label>
        <div className="chat-settings__input-group">
          <input type={showKey ? 'text' : 'password'} value={key} onChange={(e) => { setKey(e.target.value); setSaved(false); }} placeholder="gsk_..." className="chat-settings__input" />
          <button className="chat-settings__toggle" onClick={() => setShowKey(!showKey)}>{showKey ? 'Hide' : 'Show'}</button>
        </div>
        <div className="chat-settings__actions">
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!key.trim()} style={{ flex: 1 }}>{saved ? '✓ Saved' : 'Save Key'}</button>
          {getApiKey() && <button className="btn btn-secondary btn-sm" onClick={handleRemove}>Remove</button>}
        </div>
        <p className="chat-settings__hint">Get your free key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com</a></p>
      </div>
      <div className="chat-settings__section">
        <label className="chat-settings__label"><Trash2 size={14} /> Chat History</label>
        <p className="chat-settings__hint" style={{ marginBottom: '0.75rem' }}>{messageCount} messages stored locally</p>
        <button className="btn btn-secondary btn-sm" onClick={onClear} disabled={messageCount === 0} style={{ width: '100%' }}>Clear All Messages</button>
      </div>
    </motion.div>
  );
};

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const { messages, isLoading, error, streamingContent, send, clearHistory } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasApiKey = !!getApiKey();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamingContent, isLoading]);

  useEffect(() => {
    const c = messagesContainerRef.current;
    if (!c) return;
    const h = () => setShowScrollBtn(c.scrollHeight - c.scrollTop - c.clientHeight > 100);
    c.addEventListener('scroll', h);
    return () => c.removeEventListener('scroll', h);
  }, [isOpen]);

  useEffect(() => { if (isOpen && !showSettings) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen, showSettings]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSend = () => {
    const t = input.trim();
    if (!t || isLoading) return;
    setInput('');
    send(t);
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button className="chat-fab" onClick={() => setIsOpen(true)} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} aria-label="Open AI Chat" id="chat-fab-button">
            <div className="chat-fab__glow" />
            <MessageCircle size={24} />
            <span className="chat-fab__pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="chat-window" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
            <div className="chat-header">
              <div className="chat-header__info">
                <div className="chat-header__avatar"><Sparkles size={16} /></div>
                <div>
                  <h3 className="chat-header__title">Aura</h3>
                  <span className="chat-header__status">{isLoading ? 'Thinking...' : 'Your Wellness Companion'}</span>
                </div>
              </div>
              <div className="chat-header__actions">
                <button className="chat-icon-btn" onClick={() => setShowSettings(!showSettings)}><Settings size={18} /></button>
                <button className="chat-icon-btn" onClick={() => { setIsOpen(false); setShowSettings(false); }}><X size={18} /></button>
              </div>
            </div>

            <div className="chat-body">
              <AnimatePresence mode="wait">
                {showSettings ? (
                  <SettingsPanel key="settings" onBack={() => setShowSettings(false)} onClear={clearHistory} messageCount={messages.length} />
                ) : (
                  <motion.div key="chat" className="chat-messages-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="chat-messages" ref={messagesContainerRef}>
                      {messages.length === 0 && !isLoading && (
                        <motion.div className="chat-welcome" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                          <div className="chat-welcome__icon"><Sparkles size={28} /></div>
                          <h3>Hey there! I'm Aura ✨</h3>
                          <p>Your AI wellness companion. I'm here to help you manage stress, practice mindfulness, and feel better.</p>
                          {!hasApiKey && (
                            <div className="chat-welcome__setup">
                              <AlertCircle size={16} />
                              <span>Add your <button className="chat-link" onClick={() => setShowSettings(true)}>Groq API key</button> to get started</span>
                            </div>
                          )}
                          {hasApiKey && (
                            <div className="chat-quick-prompts">
                              {QUICK_PROMPTS.map((qp) => (
                                <button key={qp.label} className="chat-quick-prompt" onClick={() => send(qp.prompt)}>{qp.label}</button>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                      {messages.map((msg, i) => <MessageBubble key={msg.id} entry={msg} index={i} />)}
                      {streamingContent && <StreamingBubble content={streamingContent} />}
                      {isLoading && !streamingContent && <TypingIndicator />}
                      <AnimatePresence>
                        {error && (
                          <motion.div className="chat-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <AlertCircle size={14} /><span>{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                    <AnimatePresence>
                      {showScrollBtn && (
                        <motion.button className="chat-scroll-btn" onClick={scrollToBottom} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                          <ChevronDown size={16} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!showSettings && (
              <div className="chat-input-area">
                <div className="chat-input-wrapper">
                  <textarea ref={inputRef} className="chat-input" value={input} onChange={handleTextareaChange} onKeyDown={handleKeyDown} placeholder={hasApiKey ? 'Talk to Aura...' : 'Add API key in settings...'} disabled={!hasApiKey || isLoading} rows={1} />
                  <button className={`chat-send-btn ${input.trim() && !isLoading ? 'chat-send-btn--active' : ''}`} onClick={handleSend} disabled={!input.trim() || isLoading || !hasApiKey} aria-label="Send">
                    <Send size={16} />
                  </button>
                </div>
                <span className="chat-input-hint">Powered by Groq · LLaMA 3.3</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
