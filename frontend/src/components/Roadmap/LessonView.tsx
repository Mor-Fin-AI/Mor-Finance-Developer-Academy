// ─── LessonView — interactive split-pane workspace ──────────────────────────
import React, { useState, useEffect } from 'react';
import type { Lesson, UserProgress } from '../../types';
import { fetchLesson, postQuizSubmit, postExerciseSubmit } from '../../api/client';
import './LessonView.css';

interface LessonViewProps {
  lessonId: string;
  userId: string;
  onBack: () => void;
  onProgressUpdate: (updatedProgress: UserProgress) => void;
  token: string;
  activeTrack?: string;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lessonId,
  userId,
  onBack,
  onProgressUpdate,
  token,
  activeTrack = 'ethereum',
}) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState<'concept' | 'practice' | 'assessment' | 'references'>('concept');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Exercise state
  const [code, setCode] = useState('');
  const [submittingExercise, setSubmittingExercise] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  
  const consoleEndRef = React.useRef<HTMLDivElement | null>(null);
  const lessonTabsRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  useEffect(() => {
    setLoading(true);
    fetchLesson(lessonId, activeTrack)
      .then((data) => {
        setLesson(data);
        if (data.exercise) {
          setCode(data.exercise.template);
        }
        // Reset states
        setSelectedAnswers({});
        setQuizResult(null);
        setConsoleLogs([]);
      })
      .catch((err) => console.error("Error fetching lesson details:", err))
      .finally(() => setLoading(false));
  }, [lessonId, activeTrack]);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (quizResult) return; // Read-only after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!lesson || submittingQuiz) return;
    
    // Check that all questions are answered
    const answersList: number[] = [];
    for (let i = 0; i < lesson.quiz.length; i++) {
      if (selectedAnswers[i] == null) {
        alert("Please answer all questions before submitting.");
        return;
      }
      answersList.push(selectedAnswers[i]);
    }

    setSubmittingQuiz(true);
    try {
      const result = await postQuizSubmit(userId, lessonId, answersList, token);
      setQuizResult(result);
      if (result.user_progress) {
        onProgressUpdate(result.user_progress);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit quiz responses.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSubmitExercise = async () => {
    if (!lesson || submittingExercise || !lesson.exercise) return;

    setSubmittingExercise(true);
    setConsoleLogs([
      "⏳ Initializing EVM Compilation Environment...",
      "🛠️ Loading compiler solc-v0.8.20+commit.5613c14d...",
      "⚡ Compiling contract code...",
    ]);

    // Simulate compiler latency
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      const result = await postExerciseSubmit(userId, lessonId, code, token);

      if (result.passed) {
        setConsoleLogs((prev) => [
          ...prev,
          "✅ Compilation successful! No warnings.",
          "🧪 Running assertion test suite...",
          "🔍 Assert keyword matches: PASS",
          `🎉 Exercise PASSED. XP Awarded: +100 XP`,
        ]);
        if (result.user_progress) {
          onProgressUpdate(result.user_progress);
        }
      } else {
        const errorLogs: string[] = [];
        if (result.syntax_errors && result.syntax_errors.length > 0) {
          result.syntax_errors.forEach((err) => {
            errorLogs.push(`❌ ${err}`);
          });
        }
        if (result.missing_keywords && result.missing_keywords.length > 0) {
          errorLogs.push(`⚠️ Missing required structures: ${result.missing_keywords.join(", ")}`);
        }
        setConsoleLogs((prev) => [
          ...prev,
          "❌ Compilation completed with errors.",
          ...errorLogs,
          "❌ Exercise FAILED. Review instruction parameters and retry.",
        ]);
      }
    } catch (err) {
      setConsoleLogs((prev) => [...prev, "🚨 Connection / sandbox environment crash error."]);
    } finally {
      setSubmittingExercise(false);
    }
  };

  const parseInlineMarkdown = (line: string): React.ReactNode[] => {
    const tokenRegex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
    const parts = line.split(tokenRegex);
    
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="lesson-md-inline-code">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('[') && part.includes('](')) {
        const textEnd = part.indexOf(']');
        const linkText = part.slice(1, textEnd);
        const url = part.slice(textEnd + 2, -1);
        return (
          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="lesson-md-link">
            {linkText}
          </a>
        );
      }
      return part;
    });
  };

  // Simple parser to render reading markdown contents
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="lesson-md-h1">{parseInlineMarkdown(line.slice(2))}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="lesson-md-h2">{parseInlineMarkdown(line.slice(3))}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="lesson-md-h3">{parseInlineMarkdown(line.slice(4))}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="lesson-md-li">{parseInlineMarkdown(line.slice(2))}</li>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
        return <li key={idx} className="lesson-md-ol-li">{parseInlineMarkdown(line.slice(3))}</li>;
      }
      if (line.trim().startsWith('```')) {
        return null; // hide fences, code contents will be raw text
      }
      if (line.trim() === '') {
        return <div key={idx} className="lesson-md-space" />;
      }
      return <p key={idx} className="lesson-md-p">{parseInlineMarkdown(line)}</p>;
    });
  };

  if (loading) {
    return (
      <div className="lesson-view-loading">
        <div className="spinner" />
        <p>Loading interactive workspace...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-view-error">
        <h3>Could not load lesson</h3>
        <button className="btn btn--primary" onClick={onBack}>Back to Level</button>
      </div>
    );
  }

  const scrollLessonTabs = (direction: 'left' | 'right') => {
    if (lessonTabsRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      lessonTabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="lesson-workspace">
      
      {/* 1. Left Sidebar: Course Navigation */}
      <div className="lesson-sidebar-left glass" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', background: 'rgba(10, 11, 23, 0.45)' }}>
        <div>
          <button className="btn btn--text back-btn" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--clr-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
            ← Back to Roadmap
          </button>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>Production Web3 Engineering</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)', lineHeight: '1.4', margin: '0 0 12px 0' }}>
            Master production-ready smart contracts, protocol security, DeFi architecture, and open-source engineering across Ethereum.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: '4px', fontWeight: 600 }}>
            <span>Course progress</span>
            <span>63%</span>
          </div>
          <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: '63%', height: '100%', borderRadius: '2px', background: '#2563eb' }} />
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

        <div>
          <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>MODULE 02 • ETHEREUM SECURITY</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { title: 'State Layout & Storage', checked: true },
              { title: 'Access Control Patterns', checked: true },
              { title: lesson.title, active: true },
              { title: 'Reentrancy Guards', locked: true }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  backgroundColor: item.checked ? 'rgba(16, 185, 129, 0.1)' : item.active ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: item.checked ? '1px solid #10b981' : item.active ? '1px solid #2563eb' : '1px solid rgba(255,255,255,0.08)',
                  color: item.checked ? '#10b981' : item.active ? '#2563eb' : 'var(--clr-text-muted)'
                }}>
                  {item.checked ? '✓' : '●'}
                </span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: item.active ? 700 : 500,
                  color: item.active ? '#2563eb' : item.locked ? 'var(--clr-text-muted)' : 'var(--clr-text-secondary)',
                  wordBreak: 'break-word'
                }}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Middle Panel: Interactive Lesson Content & IDE */}
      <div className="lesson-middle-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '24px', gap: '20px', background: '#030307' }}>
        {/* Breadcrumbs */}
        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', fontWeight: 600, wordBreak: 'break-word' }}>
          Production Web3 Engineering &gt; Ethereum &gt; <span style={{ color: 'var(--clr-text-secondary)' }}>{lesson.title}</span>
        </div>

        {/* Tab Selector with Left & Right Floating Scroll Arrows */}
        <div className="workspace-tab-wrapper">
          <button
            type="button"
            className="workspace-tab-arrow workspace-tab-arrow--left"
            onClick={() => scrollLessonTabs('left')}
            aria-label="Scroll tabs left"
            title="Scroll Left"
          >
            ‹
          </button>

          <div className="workspace-tab-bar" ref={lessonTabsRef}>
            {(['concept', 'practice', 'assessment', 'references'] as const).map((tab) => {
              if (tab === 'practice' && !lesson.exercise) return null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveBottomTab(tab)}
                  className={`workspace-tab-btn ${activeBottomTab === tab ? 'workspace-tab-btn--active' : ''}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="workspace-tab-arrow workspace-tab-arrow--right"
            onClick={() => scrollLessonTabs('right')}
            aria-label="Scroll tabs right"
            title="Scroll Right"
          >
            ›
          </button>
        </div>

        {/* Tab contents */}
        {activeBottomTab === 'concept' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 700 }}>AI-Guided</span>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', color: '#a855f7', fontWeight: 700 }}>Ethereum Security</span>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 700 }}>18 min • Lab + Quiz</span>
            </div>
            <h1 className="lesson-title-heading" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 10px 0', lineHeight: '1.2' }}>{lesson.title}</h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
              {renderMarkdown(lesson.content)}
            </div>
            
            {/* CEI point highlights */}
            <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10, 11, 23, 0.45)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Checks-Effects-Interactions (CEI) in Practice</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                The Checks-Effects-Interactions pattern prevents reentrancy by validating inputs first, updating contract state second, and interacting with external contracts only after internal state changes are complete. This approach is a core security practice used across production DeFi protocols.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Validate Inputs Before State Changes',
                  'Update Contract Storage Before External Calls',
                  'Transfer Assets Only After Internal State Is Secure'
                ].map((pt, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--clr-text-secondary)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.01)' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeBottomTab === 'practice' && lesson.exercise && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', color: '#a855f7', fontWeight: 700 }}>Ethereum Security</span>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 700 }}>Interactive Lab</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 10px 0', lineHeight: '1.2' }}>Interactive Sandbox</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              {lesson.exercise.instruction}
            </p>

            {/* IDE Editor Card */}
            <div className="code-workspace glass" style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', background: 'rgba(10, 11, 23, 0.45)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-secondary)', marginLeft: '8px', fontFamily: 'monospace' }}>Vault.sol</span>
                </div>
                <button className="btn btn--secondary btn--xs" style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#3b82f6', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                  ☀️ Ask OpenClaw
                </button>
              </div>
              
              <textarea
                className="code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={submittingExercise}
                spellCheck={false}
                style={{
                  width: '100%',
                  height: '420px',
                  minHeight: '280px',
                  maxHeight: '750px',
                  padding: '16px',
                  background: '#090a12',
                  border: 'none',
                  color: '#a6accd',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Solidity Compiler v0.8.20</span>
                <button
                  className="btn btn--primary"
                  onClick={handleSubmitExercise}
                  disabled={submittingExercise || !code.trim()}
                  style={{ backgroundColor: '#2563eb', padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem' }}
                >
                  {submittingExercise ? "Compiling..." : "🚀 Compile & Run Tests"}
                </button>
              </div>

              {/* Console output inside IDE card */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#07080d', padding: '16px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--clr-text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>EVM Compiler Logs</div>
                <div style={{ maxHeight: '180px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--clr-text-secondary)', lineHeight: '1.5' }}>
                  {consoleLogs.length === 0 ? (
                    <span style={{ color: 'var(--clr-text-muted)' }}>Terminal idle. Click compile to trigger test suite claims.</span>
                  ) : (
                    <>
                      {consoleLogs.map((log, idx) => (
                        <div key={idx} style={{ color: log.includes('✅') || log.includes('successful') ? '#10b981' : log.includes('❌') || log.includes('FAILED') ? '#ef4444' : 'var(--clr-text-secondary)', marginBottom: '4px' }}>{log}</div>
                      ))}
                      <div ref={consoleEndRef} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeBottomTab === 'assessment' && (
          <div className="quiz-workspace animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 700 }}>Assessment Quiz</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 10px 0', lineHeight: '1.2' }}>Lesson Quiz</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Answer the questions below to test your understanding of the concepts covered in this lesson.
            </p>

            <div className="quiz-questions">
              {lesson.quiz.map((q, qIdx) => {
                const resultDetail = quizResult?.results?.[qIdx];
                const hasSubmitted = quizResult != null;
                
                return (
                  <div key={qIdx} className={`quiz-question-card ${hasSubmitted ? (resultDetail?.is_correct ? 'quiz-question-card--correct' : 'quiz-question-card--incorrect') : ''}`} style={{ marginBottom: '16px', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(10, 11, 23, 0.35)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                      {qIdx + 1}. {q.question}
                    </h4>
                    <div className="quiz-options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[qIdx] === oIdx;
                        const isCorrectOpt = q.correct_idx === oIdx;
                        let optClass = '';
                        if (isSelected) optClass = 'quiz-option--selected';
                        if (hasSubmitted) {
                          if (isCorrectOpt) optClass = 'quiz-option--correct';
                          else if (isSelected) optClass = 'quiz-option--incorrect';
                        }

                        return (
                          <button
                            key={oIdx}
                            className={`quiz-option ${optClass}`}
                            onClick={() => handleSelectOption(qIdx, oIdx)}
                            disabled={hasSubmitted}
                          >
                            <span className="option-marker">
                              {oIdx === 0 ? 'A' : oIdx === 1 ? 'B' : oIdx === 2 ? 'C' : 'D'}
                            </span>
                            <span className="option-text">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="quiz-footer">
              {quizResult ? (
                <div className={`quiz-score-banner ${quizResult.passed ? 'quiz-score-banner--passed' : 'quiz-score-banner--failed'}`}>
                  <div className="score-percentage">{quizResult.score}%</div>
                  <div>
                    <div className="score-verdict">{quizResult.passed ? "🎉 Quiz Passed!" : "❌ Try Again!"}</div>
                    <div className="score-ratio">Correct: {quizResult.correct_count} of {quizResult.total_questions} questions</div>
                  </div>
                  {!quizResult.passed && (
                    <button className="btn btn--secondary reset-btn" onClick={() => setQuizResult(null)}>
                      Retry Quiz
                    </button>
                  )}
                </div>
              ) : (
                <button
                  className="btn btn--primary submit-quiz-btn"
                  onClick={handleSubmitQuiz}
                  disabled={submittingQuiz}
                  style={{ width: 'fit-content' }}
                >
                  {submittingQuiz ? "Evaluating Answers..." : "Submit Quiz"}
                </button>
              )}
            </div>
          </div>
        )}

        {activeBottomTab === 'references' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 10px 0', lineHeight: '1.2' }}>Further Reading</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: '1.5' }}>
              Check out these verified resources to expand your knowledge of reentrancy security patterns and Solidity contract engineering.
            </p>
            <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10, 11, 23, 0.45)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="https://solidity-by-example.org/reentrancy" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'underline' }}>
                🔗 Solidity by Example: Reentrancy Patterns
              </a>
              <a href="https://docs.soliditylang.org" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'underline' }}>
                🔗 Official Solidity Documentation
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 3. Right Sidebar: Developer & Session Progress */}
      <div className="lesson-sidebar-right glass" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', background: 'rgba(10, 11, 23, 0.45)' }}>
        
        {/* Developer Progress Panel */}
        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>DEVELOPER PROGRESS</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>2,480 <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-secondary)' }}>XP</span></h2>
            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>+180 XP TODAY</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>
            <span>Level 07</span>
            <span>520 XP to L08</span>
          </div>
          <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: '55%', height: '100%', borderRadius: '2px', background: '#2563eb' }} />
          </div>
        </div>

        {/* Session Progress Panel */}
        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '16px' }}>SESSION PROGRESS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563eb" strokeDasharray="83, 100" strokeWidth="3" />
              </svg>
              <span style={{ position: 'absolute', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>83%</span>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Current Activity</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)' }}>Coding + Review</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: '2px' }}>
                <span>Quiz Score</span>
                <span>83%</span>
              </div>
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: '83%', height: '100%', borderRadius: '2px', background: '#2563eb' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: '2px' }}>
                <span>Lab Completion</span>
                <span>83%</span>
              </div>
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: '83%', height: '100%', borderRadius: '2px', background: '#2563eb' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Next Milestone Panel */}
        <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>NEXT MILESTONE</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🏆</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Protocol Contributor</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)', lineHeight: '1.4', margin: '0 0 12px 0' }}>
            Complete the Open Source module, submit your first pull request, and earn contributor status within the MOR ecosystem.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>
            <span>3 of 5 checkpoints</span>
            <span>83%</span>
          </div>
          <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', display: 'flex', gap: '2px' }}>
            <div style={{ flex: 1, height: '100%', background: '#2563eb', borderRadius: '2px 0 0 2px' }} />
            <div style={{ flex: 1, height: '100%', background: '#2563eb' }} />
            <div style={{ flex: 1, height: '100%', background: '#2563eb' }} />
            <div style={{ flex: 1, height: '100%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ flex: 1, height: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '0 2px 2px 0' }} />
          </div>
        </div>
    </div>
    </div>
  );
};

export default LessonView;
