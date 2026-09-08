// ─── ChatMessage — renders one assistant or user message ──────────────────────
import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../types';
import { CodeBlock } from './CodeBlock';
import './ChatMessage.css';

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Parse message content into text/code segments.
 * Detects fenced code blocks: ```lang\n...\n```
 */
function parseContent(content: string): Array<{ type: 'text' | 'code'; value: string; lang?: string }> {
  const segments: Array<{ type: 'text' | 'code'; value: string; lang?: string }> = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', lang: match[1] || 'solidity', value: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: content }];
}

/** Render a plain text segment with basic markdown-like formatting. */
function TextSegment({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        // Bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <p key={i} className={`chat-msg__text-line ${line === '' ? 'chat-msg__text-line--empty' : ''}`}>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={j}>{part.slice(1, -1)}</code>;
              }
              return <React.Fragment key={j}>{part}</React.Fragment>;
            })}
          </p>
        );
      })}
    </>
  );
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const segments = parseContent(message.content);

  return (
    <div className={`chat-msg ${isUser ? 'chat-msg--user' : 'chat-msg--assistant'}`}>
      {/* Avatar */}
      <div className="chat-msg__avatar">
        {isUser ? '👤' : '🤖'}
      </div>

      <div className="chat-msg__bubble">
        <div className="chat-msg__role">{isUser ? 'You' : 'AI Mentor'}</div>
        <div className={`chat-msg__content ${message.isStreaming ? 'typing-cursor' : ''}`}>
          {segments.map((seg, i) =>
            seg.type === 'code'
              ? <CodeBlock key={i} code={seg.value} language={seg.lang} />
              : <TextSegment key={i} text={seg.value} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
