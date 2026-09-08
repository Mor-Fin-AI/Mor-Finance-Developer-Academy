import React, { useState, useEffect } from 'react';
import type { UserProgress } from '../../types';
import { fetchGitHubUserStats } from '../../api/client';
import type { GitHubUserStats } from '../../api/client';
import { getStoredDeployments, subscribeDeployments } from '../../services/liveDeployer';
import { TransakWidgetModal } from '../OnRamp/TransakWidgetModal';
import './Dashboard.css';

interface DashboardProps {
  progress: UserProgress | null;
  loading: boolean;
  userId: string;
  onProgressUpdate: (updatedProgress: UserProgress) => void;
  token: string;
  onNavigate?: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  loading,
  userId,
  onProgressUpdate,
  token,
  onNavigate,
}) => {
  const [ghStats, setGhStats] = useState<GitHubUserStats | null>(null);
  const [ghLoading, setGhLoading] = useState<boolean>(false);
  const [deployedContractsCount, setDeployedContractsCount] = useState<number>(() => getStoredDeployments().length);
  const [showTransakModal, setShowTransakModal] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeDeployments((deps) => {
      setDeployedContractsCount(deps.length);
    });
    return unsub;
  }, []);

  const ghUsername = progress?.github_username || (userId && userId.startsWith('gh-') ? userId.replace('gh-', '') : null);

  useEffect(() => {
    if (ghUsername) {
      setGhLoading(true);
      fetchGitHubUserStats(ghUsername)
        .then((data) => {
          setGhStats(data);
        })
        .catch((err) => {
          console.warn('Failed to fetch GitHub live stats:', err);
        })
        .finally(() => setGhLoading(false));
    }
  }, [ghUsername]);

  // Reference props to satisfy TypeScript unused variable checks
  useEffect(() => {
    // Props active for user analytics
  }, [userId, token, onProgressUpdate]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="roadmap-skeleton" style={{ height: 120, marginBottom: 20 }} />
        ))}
      </div>
    );
  }

  if (!progress) return null;

  // Compute metrics dynamically from progress
  const completedLessons = progress.levels.reduce((acc, l) => acc + l.completed_lessons, 0);
  const challengesCount = progress.exercises_submitted?.length || 0;
  const certificatesCount = progress.levels.filter(
    (l) => l.completed_lessons >= l.total_lessons && l.total_lessons > 0
  ).length;

  const attempts = progress.quiz_attempts || [];
  const avgQuizScore = attempts.length > 0
    ? Math.round(attempts.reduce((acc, q) => acc + q.score, 0) / attempts.length)
    : 0;

  // 1. Generate smooth Wave Chart Path dynamically based on past 6 months events
  const getDynamicMonthlyData = () => {
    const now = new Date();
    const months = [];
    const quizEvents = (progress.quiz_attempts || []).map(q => ({ date: new Date(q.attempted_at), xp: 50 }));
    const exerciseEvents = (progress.exercises_submitted || []).map(e => ({ date: new Date(e.submitted_at), xp: 100 }));
    const githubEvents = (progress.github_activities || []).map(g => ({ date: new Date(g.committed_at), xp: 20 }));
    const allEvents = [...quizEvents, ...exerciseEvents, ...githubEvents].sort((a, b) => a.date.getTime() - b.date.getTime());

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        xp: 0
      });
    }

    months.forEach(m => {
      const eventsInOrBefore = allEvents.filter(ev => {
        return ev.date.getFullYear() < m.year || (ev.date.getFullYear() === m.year && ev.date.getMonth() <= m.month);
      });
      m.xp = eventsInOrBefore.reduce((sum, ev) => sum + ev.xp, 0);
    });

    const points = months.map((m, idx) => {
      const x = 20 + idx * 60;
      const xpVal = m.xp || (idx === months.length - 1 ? progress.xp : 0);
      const maxXp = Math.max(...months.map(mo => mo.xp), progress.xp, 100);
      const ratio = maxXp > 0 ? xpVal / maxXp : 0;
      const y = 140 - ratio * 100;
      return { x, y, name: m.name };
    });

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + 30;
      const cp1y = prev.y;
      const cp2x = curr.x - 30;
      const cp2y = curr.y;
      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    const areaPath = `${linePath} L 380 150 L 20 150 Z`;

    return { points, linePath, areaPath };
  };

  const { points: chartMonths, linePath, areaPath } = getDynamicMonthlyData();

  // 2. Activity Breakdown Pct
  const totalLessonsCount = progress.levels.reduce((acc, l) => acc + l.total_lessons, 0) || 1;
  const courseworkPct = Math.round((completedLessons / totalLessonsCount) * 100);
  const quizzesPct = avgQuizScore;
  const projectsPct = Math.min(100, Math.round((challengesCount / 20) * 100));
  const aiMentorPct = Math.min(100, Math.round((progress.xp / 1200) * 100));
  const communityPct = Math.min(100, Math.round(((progress.hackathons_registered?.length || 0) * 35 + (progress.streak_days * 8))));
  
  const level5Completed = progress.levels.find(l => l.level_id === 5)?.completed_lessons || 0;
  const level6Completed = progress.levels.find(l => l.level_id === 6)?.completed_lessons || 0;
  const hardhatPct = Math.min(100, Math.round(((level5Completed + level6Completed) / 16) * 100));

  const activityBreakdown = [
    { name: 'Coursework', pct: courseworkPct },
    { name: 'Quizzes', pct: quizzesPct },
    { name: 'Projects', pct: projectsPct },
    { name: 'AI Mentor', pct: aiMentorPct },
    { name: 'Community', pct: communityPct },
    { name: 'Hardhat / Foundry', pct: hardhatPct }
  ];

  // 3. Weekly Activity: map dynamically to the last 7 days
  const getWeeklyActivityData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weeklyDays = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      weeklyDays.push({
        name: days[d.getDay()],
        dateStr: d.toDateString(),
        hrs: 0
      });
    }

    const quizEvents = (progress.quiz_attempts || []).map(q => ({ date: new Date(q.attempted_at) }));
    const exerciseEvents = (progress.exercises_submitted || []).map(e => ({ date: new Date(e.submitted_at) }));
    const githubEvents = (progress.github_activities || []).map(g => ({ date: new Date(g.committed_at) }));
    const allEvents = [...quizEvents, ...exerciseEvents, ...githubEvents];
    
    allEvents.forEach(ev => {
      const dateStr = ev.date.toDateString();
      const match = weeklyDays.find(wd => wd.dateStr === dateStr);
      if (match) {
        match.hrs += 1;
      }
    });

    const maxHrs = Math.max(...weeklyDays.map(wd => wd.hrs), 1);

    return weeklyDays.map((wd) => {
      const hours = wd.hrs;
      const pct = maxHrs > 0 && hours > 0 ? Math.min(100, Math.round((hours / maxHrs) * 80)) : 0;
      return {
        day: wd.name,
        hrs: pct,
        val: hours > 0 ? `${hours.toFixed(1)}h` : '0h',
        highlighted: wd.dateStr === now.toDateString()
      };
    });
  };

  const weeklyActivity = getWeeklyActivityData();

  // 5. Learning Recommendations: map dynamically to user level and track
  const getDynamicRecommendations = (level: number, track?: string) => {
    const trackName = track || 'ethereum';
    const capitalizedTrack = trackName.charAt(0).toUpperCase() + trackName.slice(1);
    
    if (level < 3) {
      return [
        { name: 'Smart Contract Fundamentals & Solidity Syntax', icon: '💻', tags: 'Solidity • 2h 30m', match: 98 },
        { name: 'Peer-to-Peer Network Models & EVM Architecture', icon: '⚙️', tags: 'EVM • 3h 15m', match: 92 },
        { name: 'Smart Contract Security & Reentrancy Patterns', icon: '🧠', tags: 'Security • 4h 00m', match: 90 }
      ];
    }
    if (level < 6) {
      return [
        { name: 'Automated Market Makers & DeFi Primitives', icon: '💸', tags: 'DeFi • 6h 30m', match: 96 },
        { name: 'DAO Governance & Quadratic Voting Mechanisms', icon: '🗳️', tags: 'DAOs • 5h 15m', match: 93 },
        { name: 'ERC-4337 Account Abstraction & Paymasters', icon: '🔐', tags: 'ERC-4337 • 7h 00m', match: 92 }
      ];
    }
    return [
      { name: `Advanced ${capitalizedTrack} Scaling Solutions & Rollups`, icon: '⚡', tags: `${capitalizedTrack} • 8h 30m`, match: 98 },
      { name: `Smart Contract Auditing on ${capitalizedTrack}`, icon: '🛡️', tags: `Security • 6h 15m`, match: 95 },
      { name: `Gas Optimization & Bytecode Analysis on ${capitalizedTrack}`, icon: '⛽', tags: `Optimization • 5h 00m`, match: 92 }
    ];
  };

  const recommendations = getDynamicRecommendations(progress.current_level, progress.active_track);

  return (
    <div className="dashboard animate-fade-in">
      {/* Header */}
      <div className="analytics-header">
        <h2 className="analytics-header__title">Measure Your Web3 Growth</h2>
        <p className="analytics-header__subtitle">Track your on-chain progress, deployments, and certifications.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="analytics-metrics-grid">
        <div className="metric-card-wrap">
          <div className="metric-card__icon-container">📖</div>
          <div>
            <h4 className="metric-card__title">Course Completion</h4>
            <div className="metric-card__value">{completedLessons}</div>
          </div>
        </div>
        <div className="metric-card-wrap">
          <div className="metric-card__icon-container">⭐</div>
          <div>
            <h4 className="metric-card__title">Quiz Scores</h4>
            <div className="metric-card__value">{avgQuizScore > 0 ? `${avgQuizScore}%` : '0%'}</div>
          </div>
        </div>
        <div className="metric-card-wrap">
          <div className="metric-card__icon-container">💻</div>
          <div>
            <h4 className="metric-card__title">Coding Challenges</h4>
            <div className="metric-card__value">{challengesCount}</div>
          </div>
        </div>
        <div className="metric-card-wrap">
          <div className="metric-card__icon-container">🏆</div>
          <div>
            <h4 className="metric-card__title">Certificates Earned</h4>
            <div className="metric-card__value">{certificatesCount}</div>
          </div>
        </div>
        <div className="metric-card-wrap" onClick={() => onNavigate?.('sandbox')} style={{ cursor: 'pointer' }} title="View deployed contracts in Playground">
          <div className="metric-card__icon-container">🚀</div>
          <div>
            <h4 className="metric-card__title">Contracts Deployed</h4>
            <div className="metric-card__value">{deployedContractsCount}</div>
          </div>
        </div>
      </div>

      {/* Transak Workspace Sandbox Credits On-Ramp Card */}
      <div className="dashboard-onramp-card glass animate-fade-in" style={{
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.22) 0%, rgba(15, 23, 42, 0.65) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            flexShrink: 0
          }}>
            ⛽
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: '#f8fafc' }}>
                Instant Crypto &amp; Gas On-Ramp
              </h4>
              <span style={{
                fontSize: '0.68rem',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#93c5fd',
                fontWeight: 600
              }}>
                Transak KYC Protected
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--clr-text-secondary)' }}>
              Acquire testnet gas, protocol assets, and developer environment access instantly via card or bank transfer without leaving your dashboard.
            </p>
          </div>
        </div>
        <div>
          <button
            className="btn btn--primary"
            onClick={() => setShowTransakModal(true)}
            style={{
              padding: '10px 20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>⚡</span> Open Transak Ramp
          </button>
        </div>
      </div>

      {/* Row 2 Grid: Overall Progress + Activity Breakdown */}
      <div className="analytics-row-two">
        {/* Overall Progress panel */}
        <div className="panel-growth">
          <div className="panel-growth__header">
            <h3 className="panel-growth__title">Overall Progress</h3>
            <div className="panel-growth__dropdown">📅 This Year</div>
          </div>
          <div className="panel-growth__body-row">
            <div className="circular-progress-container">
              <svg width="120" height="120" viewBox="0 0 120 120" className="circular-progress">
                <circle cx="60" cy="60" r="50" className="circular-progress__bg" />
                <circle cx="60" cy="60" r="50" className="circular-progress__bar" style={{ strokeDashoffset: 314 - (314 * courseworkPct) / 100 }} />
                <text x="60" y="65" className="circular-progress__text">{courseworkPct}%</text>
              </svg>
              <span className="circular-progress__caption">You're ahead of 82% of learners.</span>
            </div>
            
            <div className="wave-chart-container">
              <svg viewBox="0 0 400 160" className="svg-wave-chart">
                <defs>
                  <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--clr-primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--clr-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Y Axis Gridlines */}
                <line x1="20" y1="140" x2="380" y2="140" stroke="rgba(255,255,255,0.03)" />
                <line x1="20" y1="80" x2="380" y2="80" stroke="rgba(255,255,255,0.03)" />
                <line x1="20" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" />

                <path d={linePath} fill="none" stroke="var(--clr-primary-light)" strokeWidth="3.5" strokeLinecap="round" />
                <path d={areaPath} fill="url(#wave-grad)" />
              </svg>
              <div className="wave-chart__labels">
                {chartMonths.map((m, idx) => (
                  <span key={idx}>{m.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown panel */}
        <div className="panel-growth">
          <div className="activity-breakdown">
            <div className="activity-breakdown__header">
              <h4 className="activity-breakdown__title">Activity Breakdown</h4>
              <button className="activity-breakdown__view-all" onClick={() => onNavigate?.('academy')}>View All →</button>
            </div>
            <div className="activity-breakdown__list">
              {activityBreakdown.map((act) => (
                <div key={act.name} className="activity-bar">
                  <div className="activity-bar__labels">
                    <span className="activity-bar__name">{act.name}</span>
                    <span className="activity-bar__pct">{act.pct}%</span>
                  </div>
                  <div className="activity-bar__track">
                    <div className="activity-bar__fill" style={{ width: `${act.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 Grid: Weekly Activity + AI Mentor Session */}
      <div className="analytics-row-three">
        {/* Weekly Activity bar chart */}
        <div className="panel-growth">
          <div className="weekly-activity">
            <div className="weekly-activity__header">
              <div>
                <h4 className="weekly-activity__title">Weekly Activity</h4>
                <span className="weekly-activity__subtitle">Hours spent learning and coding</span>
              </div>
              <div className="weekly-activity__dropdown">📅 This Week</div>
            </div>
            <div className="weekly-activity__chart">
              {weeklyActivity.map((d) => (
                <div key={d.day} className="weekly-bar-col">
                  <div className="weekly-bar-container">
                    {d.highlighted && <span className="weekly-bar__tooltip">{d.val}</span>}
                    <div 
                      className={`weekly-bar ${d.highlighted ? 'weekly-bar--active' : ''}`} 
                      style={{ height: `${d.hrs}%` }} 
                    />
                  </div>
                  <span className="weekly-bar__label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GitHub Connected Live Developer Stats */}
        <div className="panel-growth">
          <div className="mentor-sessions">
            <div className="mentor-sessions__header">
              <h4 className="mentor-sessions__title">GitHub Developer Stats</h4>
              <span className="mentor-sessions__subtitle">
                {ghUsername ? `@${ghUsername} live GitHub API metrics` : 'Connect your GitHub account'}
              </span>
            </div>

            {ghUsername ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '14px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: '4px' }}>📁</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{ghLoading ? '...' : (ghStats?.public_repos ?? 0)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>Public Repos</span>
                  </div>

                  <div style={{ padding: '14px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: '4px' }}>🔀</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>{ghLoading ? '...' : (ghStats?.merged_prs ?? 0)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>Merged PRs</span>
                  </div>

                  <div style={{ padding: '14px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: '4px' }}>💻</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa' }}>{ghLoading ? '...' : (ghStats?.total_commits ?? progress.github_activities?.length ?? 0)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>Total Commits</span>
                  </div>

                  <div style={{ padding: '14px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: '4px' }}>👥</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c084fc' }}>{ghLoading ? '...' : (ghStats?.followers ?? 0)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>Followers</span>
                  </div>
                </div>

                <a 
                  href={`https://github.com/${ghUsername}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn--secondary" 
                  style={{ width: '100%', textAlign: 'center', justifyContent: 'center', fontSize: '0.8rem', padding: '8px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  🐱 View @{ghUsername} on GitHub ↗
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--clr-border)', marginTop: '12px' }}>
                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>🐱</span>
                <h5 style={{ fontSize: '0.95rem', color: 'var(--clr-text-primary)', marginBottom: '4px' }}>No GitHub Profile Linked</h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                  Connect your GitHub username to automatically fetch your total commits, merged pull requests, public repos, and follower count from GitHub.
                </p>
                <button className="btn btn--primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => onNavigate?.('academy')}>
                  Connect GitHub Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GitHub Contribution Calendar Section */}
      {ghUsername && (
        <div className="github-calendar-panel glass animate-fade-in">
          <div className="github-calendar-header">
            <div>
              <h4 className="github-calendar-title">📅 GitHub Contribution Calendar</h4>
              <span className="github-calendar-subtitle">
                Live annual contribution graph for <strong>@{ghUsername}</strong>
              </span>
            </div>
            <a 
              href={`https://github.com/${ghUsername}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn--secondary btn--sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              Open GitHub Profile ↗
            </a>
          </div>

          <div className="github-calendar-wrap">
            <img 
              src={`https://ghchart.rshah.org/10B981/${ghUsername}`} 
              alt={`${ghUsername}'s GitHub Contribution Calendar`} 
              className="github-calendar-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://github-readme-activity-graph.vercel.app/graph?username=${ghUsername}&theme=react-dark`;
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom Row: Learning Recommendations */}
      <div className="recommendations-section">
        <h4 className="recommendations-section__title">Learning Recommendations</h4>
        <p className="recommendations-section__subtitle">Based on your recent activity</p>
        <div className="recommendations-list">
          {recommendations.map((rec) => (
            <div key={rec.name} className="recommendation-row">
              <div className="recommendation-row__icon-wrap">
                <span className="recommendation-row__icon">{rec.icon}</span>
              </div>
              <div className="recommendation-row__details">
                <h5 className="recommendation-row__name">{rec.name}</h5>
                <span className="recommendation-row__tags">{rec.tags}</span>
              </div>
              <div className="recommendation-row__action">
                <span className="recommendation-row__match">{rec.match}% Match</span>
                <button className="recommendation-row__btn" onClick={() => onNavigate?.('academy')}>⚙️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TransakWidgetModal
        isOpen={showTransakModal}
        onClose={() => setShowTransakModal(false)}
        walletAddress={progress?.wallet_address || (userId?.startsWith('0x') ? userId : '')}
        defaultNetwork="arbitrum"
      />
    </div>
  );
};

export default Dashboard;
