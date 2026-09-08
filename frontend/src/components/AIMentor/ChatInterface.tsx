// ─── ChatInterface — full AI Mentor chat panel ────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../../types';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { streamMentorChat } from '../../api/client';
import './ChatInterface.css';

const SUGGESTED_PROMPTS = [
  'Explain how the EVM works',
  'What is a reentrancy attack?',
  'Show me a basic ERC-20 token',
  'How does a liquidity pool work?',
  'What is a DAO proposal lifecycle?',
];

export const LEVEL_CONTEXT_OPTIONS = [
  { value: 'General Developer Academy Curriculum', label: '🌐 General Curriculum' },
  { value: 'Level 1 — Blockchain Fundamentals', label: '🎯 Level 1 — Blockchain Fundamentals' },
  { value: 'Level 2 — Wallet Development', label: '⚡ Level 2 — Wallet Development' },
  { value: 'Level 3 — Smart Contract Development', label: '📜 Level 3 — Smart Contract Development' },
  { value: 'Level 4 — DeFi Fundamentals', label: '🏦 Level 4 — DeFi Fundamentals' },
  { value: 'Level 5 — DAO Governance', label: '🏛️ Level 5 — DAO Governance' },
  { value: 'Level 6 — MOR Finance Protocols', label: '🚀 Level 6 — MOR Finance Protocols' },
  { value: 'Level 7 — Ecosystem Learning Track', label: '🌐 Level 7 — Ecosystem Track' },
];

interface ChatInterfaceProps {
  mentorContext?: string;
  userId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  mentorContext = 'General Developer Academy curriculum',
  userId = 'demo-user',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "👋 Hey! I'm your **AI Mentor** for the Developer Academy. You can switch between **OpenClaw** (for lesson guidance, concept explanations, and educational support) and **Hermes** (for code reviews, debugging, and engineering support) using the selectors above.\n\nWhat would you like to discuss today?",
    },
  ]);
  const [input, setInput]         = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [mentorProvider, setMentorProvider] = useState<'openclaw' | 'hermes'>('openclaw');
  
  // Dynamic Level & Question Context management
  const [currentContext, setCurrentContext] = useState<string>(mentorContext);
  const [isCustomContext, setIsCustomContext] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentContext(mentorContext);
    // Check if initial mentorContext matches standard level titles
    const isStandard = LEVEL_CONTEXT_OPTIONS.some(opt => opt.value === mentorContext);
    if (!isStandard && mentorContext && mentorContext !== 'General Developer Academy curriculum') {
      setIsCustomContext(true);
    } else {
      setIsCustomContext(false);
    }
  }, [mentorContext]);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  const handleSelectContextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomContext(true);
    } else if (val === 'none') {
      setCurrentContext('');
      setIsCustomContext(false);
    } else {
      setCurrentContext(val);
      setIsCustomContext(false);
    }
  };

  const handleClearContext = () => {
    setCurrentContext('');
    setIsCustomContext(false);
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const assistantId = `a-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      const gen = streamMentorChat(trimmed, currentContext, (delta) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + delta } : m,
          ),
        );
      }, userId, mentorProvider);

      // Consume the async generator
      for await (const _ of gen) { /* chunks delivered via onChunk callback */ }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` }
            : m,
        ),
      );
    } finally {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m,
        ),
      );
      setIsStreaming(false);
    }
  }, [isStreaming, currentContext, mentorProvider, userId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Determine current dropdown select value
  const selectValue = isCustomContext
    ? 'custom'
    : currentContext === ''
    ? 'none'
    : LEVEL_CONTEXT_OPTIONS.some(opt => opt.value === currentContext)
    ? currentContext
    : 'custom';

  return (
    <div className="chat">
      {/* Mentor switcher bar */}
      <div className="mentor-switcher glass">
        <span className="mentor-switcher__label">Choose AI Mentor:</span>
        <div className="mentor-switcher__options">
          <button
            className={`mentor-btn ${mentorProvider === 'openclaw' ? 'mentor-btn--active' : ''}`}
            onClick={() => setMentorProvider('openclaw')}
            title="OpenClaw: Education Mentor – lesson guidance, concept explanations, quizzes, learning recommendations and educational support."
          >
            🔮 OpenClaw (Education)
          </button>
          <button
            className={`mentor-btn ${mentorProvider === 'hermes' ? 'mentor-btn--active' : ''}`}
            onClick={() => setMentorProvider('hermes')}
            title="Hermes: Engineering Mentor – code review, smart contract templates, debugging, coding exercises, GitHub assistance and engineering support."
          >
            🛠️ Hermes (Engineering)
          </button>
        </div>
      </div>

      {/* Context Level selector & controls */}
      <div className="chat__context-bar glass">
        <div className="chat__context-info">
          <span className="chat__context-icon">📍</span>
          <span className="chat__context-label">Level Context:</span>
          <select
            className="chat__context-select"
            value={selectValue}
            onChange={handleSelectContextChange}
            aria-label="Select Level Context"
          >
            {LEVEL_CONTEXT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            <option value="custom">✏️ Custom Context...</option>
            <option value="none">❌ None (No Context)</option>
          </select>

          {isCustomContext && (
            <input
              type="text"
              className="chat__context-input"
              value={currentContext}
              onChange={(e) => setCurrentContext(e.target.value)}
              placeholder="Enter custom level context..."
              autoFocus
            />
          )}
        </div>

        <div className="chat__context-actions">
          {currentContext ? (
            <button
              type="button"
              className="chat__context-btn chat__context-btn--clear"
              onClick={handleClearContext}
              title="Remove context completely"
            >
              ❌ Remove Context
            </button>
          ) : (
            <span className="chat__context-tag-none">No Active Context</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat__messages" id="chat-messages-container">
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="chat__suggestions">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              className="chat__suggestion-chip"
              onClick={() => sendMessage(p)}
              disabled={isStreaming}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="chat__input-area glass">
        <textarea
          ref={textareaRef}
          id="mentor-chat-input"
          className="chat__textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
          rows={1}
          disabled={isStreaming}
          aria-label="Message to AI Mentor"
        />
        <button
          id="mentor-send-btn"
          className={`btn btn--primary chat__send-btn ${isStreaming ? 'chat__send-btn--loading' : ''}`}
          onClick={() => sendMessage(input)}
          disabled={isStreaming || !input.trim()}
          aria-label="Send message"
        >
          {isStreaming ? (
            <span className="chat__spinner" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
