// ─── CodeBlock — syntax highlighted code with copy button ─────────────────────
import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import 'highlight.js/styles/atom-one-dark.css';
import './CodeBlock.css';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('logic', javascript);
hljs.registerLanguage('sol', javascript);

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'typescript' }) => {
  const codeRef  = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute('data-highlighted');
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__lang">{language}</span>
        <button
          className={`code-block__copy ${copied ? 'code-block__copy--done' : ''}`}
          onClick={handleCopy}
          aria-label="Copy code"
          id={`copy-code-${language}`}
        >
          {copied ? '✓ Copied!' : '⎘ Copy'}
        </button>
      </div>
      <pre className="code-block__pre">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
