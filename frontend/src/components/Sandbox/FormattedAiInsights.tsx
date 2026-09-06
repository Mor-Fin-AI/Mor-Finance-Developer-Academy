import React, { useState } from 'react';
import './FormattedAiInsights.css';

interface FormattedAiInsightsProps {
  content: string;
  isLoading?: boolean;
  onClear?: () => void;
}

interface ParsedSection {
  title: string;
  icon: string;
  badge: string;
  variant: 'security' | 'compiler' | 'optimization' | 'default';
  items: string[];
  isNumbered: boolean;
  paragraphs: string[];
  code?: { lang: string; code: string };
}

interface ParsedAnalysis {
  lead: string | null;
  sections: ParsedSection[];
  outro: string | null;
}

/**
 * Render inline markdown tags: **bold**, `inline code`, *italic*, [link](url)
 */
export function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="ai-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="ai-strong">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="ai-em">
          {part.slice(1, -1)}
        </em>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="ai-link"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function getSectionMeta(rawTitle: string) {
  const t = rawTitle.toLowerCase();
  if (t.includes('security') || t.includes('vulnerab')) {
    return { icon: '🛡️', variant: 'security' as const, badge: 'Security Audit' };
  }
  if (t.includes('compiler') || t.includes('compatib') || t.includes('syntax')) {
    return { icon: '⚡', variant: 'compiler' as const, badge: 'Runtime & Compiler' };
  }
  if (t.includes('optim') || t.includes('suggest') || t.includes('gas') || t.includes('recommend')) {
    return { icon: '🚀', variant: 'optimization' as const, badge: 'Optimization Plan' };
  }
  if (t.includes('architect') || t.includes('pattern') || t.includes('structur')) {
    return { icon: '📐', variant: 'default' as const, badge: 'Architecture' };
  }
  return { icon: '📌', variant: 'default' as const, badge: 'Assessment' };
}

/**
 * Parses raw AI mentor markdown responses into structured lead, sections, and verdict.
 */
function parseAnalysisContent(rawText: string): ParsedAnalysis {
  const lines = rawText.trim().split('\n');
  const sections: ParsedSection[] = [];
  let lead: string | null = null;
  let outro: string | null = null;

  let currentSection: ParsedSection | null = null;
  let initialParagraphs: string[] = [];
  let trailingParagraphs: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    // 1. Code Block Fence
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      const codeObj = { lang, code: codeLines.join('\n') };
      if (currentSection) {
        currentSection.code = codeObj;
      } else {
        const meta = getSectionMeta('Code Example');
        currentSection = {
          title: 'Code Example',
          icon: meta.icon,
          badge: meta.badge,
          variant: meta.variant,
          items: [],
          isNumbered: false,
          paragraphs: [],
          code: codeObj,
        };
        sections.push(currentSection);
      }
      continue;
    }

    // 2. Section Heading Match: e.g. "### Security" or "**Security:**"
    const hMatch = line.match(/^(?:#{1,6}\s*(.+)|(?:\*\*(.+?)\*\*[:]?))$/);
    if (hMatch) {
      const rawTitle = (hMatch[1] || hMatch[2]).trim().replace(/:$/, '');
      const meta = getSectionMeta(rawTitle);

      currentSection = {
        title: rawTitle,
        icon: meta.icon,
        badge: meta.badge,
        variant: meta.variant,
        items: [],
        isNumbered: false,
        paragraphs: [],
      };
      sections.push(currentSection);
      i++;
      continue;
    }

    // 3. Bullet List Item: e.g. "- The `nonReentrant` modifier..."
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      if (currentSection) {
        currentSection.items.push(...items);
        currentSection.isNumbered = false;
      } else {
        const meta = getSectionMeta('Key Points');
        currentSection = {
          title: 'Key Points',
          icon: meta.icon,
          badge: meta.badge,
          variant: meta.variant,
          items,
          isNumbered: false,
          paragraphs: [],
        };
        sections.push(currentSection);
      }
      continue;
    }

    // 4. Numbered List Item: e.g. "1. **Use OpenZeppelin's ReentrancyGuard:**..."
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      if (currentSection) {
        currentSection.items.push(...items);
        currentSection.isNumbered = true;
      } else {
        const meta = getSectionMeta('Step-by-Step Recommendations');
        currentSection = {
          title: 'Step-by-Step Recommendations',
          icon: meta.icon,
          badge: meta.badge,
          variant: meta.variant,
          items,
          isNumbered: true,
          paragraphs: [],
        };
        sections.push(currentSection);
      }
      continue;
    }

    // 5. Paragraph text
    const paraLines = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !/^(?:#{1,6}\s+|(?:\*\*.+?\*\*[:]?$)|[-*]\s+|\d+\.\s+)/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    const fullPara = paraLines.join(' ');
    if (sections.length === 0) {
      initialParagraphs.push(fullPara);
    } else {
      // Check if this looks like a concluding takeaway (starts with "Overall," or "In summary," or is at the end)
      if (
        fullPara.toLowerCase().startsWith('overall') ||
        fullPara.toLowerCase().startsWith('in summary') ||
        fullPara.toLowerCase().startsWith('conclusion')
      ) {
        trailingParagraphs.push(fullPara);
      } else if (currentSection) {
        currentSection.paragraphs.push(fullPara);
      } else {
        trailingParagraphs.push(fullPara);
      }
    }
  }

  if (initialParagraphs.length > 0) {
    lead = initialParagraphs.join('\n\n');
  }
  if (trailingParagraphs.length > 0) {
    outro = trailingParagraphs.join('\n\n');
  }

  return { lead, sections, outro };
}

export const FormattedAiInsights: React.FC<FormattedAiInsightsProps> = ({
  content,
  isLoading = false,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);

  if (!content && !isLoading) return null;

  const { lead, sections, outro } = parseAnalysisContent(content);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ai-insights-container">
      {/* Header */}
      <div className="ai-insights-header">
        <div className="ai-insights-header-left">
          <span className="ai-insights-badge-icon">💡</span>
          <div>
            <div className="ai-insights-title">Hermes / OpenClaw AI Mentor Insights</div>
          </div>
          <span className="ai-insights-model-tag">Multi-Runtime Logic Review</span>
          {isLoading && (
            <div className="ai-streaming-indicator">
              <span className="ai-pulse-dot" />
              <span>Analyzing Code...</span>
            </div>
          )}
        </div>

        <div className="ai-insights-header-actions">
          <button
            className="ai-btn-action"
            onClick={handleCopy}
            title="Copy entire review to clipboard"
          >
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
          {onClear && (
            <button
              className="ai-btn-dismiss"
              onClick={onClear}
              title="Dismiss AI Insights"
              aria-label="Dismiss AI Insights"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Lead Assessment */}
      {lead && (
        <div className="ai-insights-lead">
          {lead.split('\n\n').map((p, idx) => (
            <p key={idx} style={{ margin: idx === 0 ? 0 : '8px 0 0 0' }}>
              {renderInlineMarkdown(p)}
            </p>
          ))}
        </div>
      )}

      {/* Structured Sections */}
      {sections.length > 0 && (
        <div className="ai-insights-sections">
          {sections.map((sec, idx) => (
            <div key={idx} className={`ai-section-card ai-section--${sec.variant}`}>
              <div className="ai-section-header">
                <div className="ai-section-title">
                  <span className="ai-section-icon">{sec.icon}</span>
                  <span>{sec.title}</span>
                </div>
                <span className="ai-section-badge">{sec.badge}</span>
              </div>

              {/* Section Paragraphs */}
              {sec.paragraphs.length > 0 && (
                <div className="ai-section-paragraphs">
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} style={{ margin: '4px 0', fontSize: '0.84rem', color: '#cbd5e1' }}>
                      {renderInlineMarkdown(p)}
                    </p>
                  ))}
                </div>
              )}

              {/* Code Snippet if present */}
              {sec.code && (
                <pre className="ai-code-block">
                  <code>{sec.code.code}</code>
                </pre>
              )}

              {/* Items List */}
              {sec.items.length > 0 && (
                <ul className="ai-list">
                  {sec.items.map((item, itemIdx) =>
                    sec.isNumbered ? (
                      <li key={itemIdx} className="ai-numbered-item">
                        <span className="ai-step-badge">{itemIdx + 1}</span>
                        <div className="ai-item-body">{renderInlineMarkdown(item)}</div>
                      </li>
                    ) : (
                      <li key={itemIdx} className="ai-bullet-item">
                        <span className="ai-bullet-icon">✦</span>
                        <div className="ai-item-body">{renderInlineMarkdown(item)}</div>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Outro / Verdict */}
      {outro && (
        <div className="ai-insights-outro">
          <div className="ai-outro-title">
            <span>⚖️ Mentor Evaluation &amp; Verdict</span>
          </div>
          <div>{renderInlineMarkdown(outro)}</div>
        </div>
      )}
    </div>
  );
};

export default FormattedAiInsights;
