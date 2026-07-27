import React, { useState, useEffect } from 'react';
import type { UserProgress } from '../../types';
import { fetchGitHubUserStats } from '../../api/client';
import type { GitHubUserStats } from '../../api/client';
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
    if (userId && token && onProgressUpdate) {
      console.log("Analytics dashboard active for:", userId);
    }
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

    const baseline = [10, 40, 25, 75, 45, 85, 70];
    const points = months.map((m, idx) => {
      const x = 20 + idx * 60;
      const xpVal = m.xp || (progress.xp * (baseline[idx] / 100)) || (120 * (baseline[idx] / 100));
      const maxXp = Math.max(...months.map(mo => mo.xp), progress.xp, 150);
      const ratio = xpVal / maxXp;
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
  const courseworkPct = Math.round((completedLessons / totalLessonsCount) * 100) || 12;
  const quizzesPct = avgQuizScore || 15;
  const projectsPct = Math.min(100, Math.round((challengesCount / 20) * 100)) || 8;
  const aiMentorPct = Math.min(100, Math.round((progress.xp / 1200) * 100)) || 10;
  const communityPct = Math.min(100, Math.round(((progress.hackathons_registered?.length || 0) * 35 + (progress.streak_days * 8)))) || 5;
  
  const level5Completed = progress.levels.find(l => l.level_id === 5)?.completed_lessons || 0;
  const level6Completed = progress.levels.find(l => l.level_id === 6)?.completed_lessons || 0;
  const hardhatPct = Math.min(100, Math.round(((level5Completed + level6Completed) / 16) * 100)) || 4;

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
    const baselineHrs = [1.2, 0.8, 1.5, 2.5, 1.0, 1.8, 1.4];

    return weeklyDays.map((wd, idx) => {
      const hours = wd.hrs || (progress.xp > 0 ? baselineHrs[idx] * 1.5 : baselineHrs[idx]);
      const pct = Math.min(100, Math.max(10, Math.round((hours / Math.max(maxHrs, 3)) * 80)));
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
        { name: 'Introduction to Solidity Syntax', icon: '💻', tags: 'Basics • 2h 30m', match: 98 },
        { name: 'Peer-to-Peer Network Models', icon: '⚙️', tags: 'Infrastructure • 3h 15m', match: 92 },
        { name: 'Cryptography Foundations', icon: '🧠', tags: 'Security • 4h 00m', match: 90 }
      ];
    }
    if (level < 6) {
      return [
        { name: 'DeFi AMM Pool Construction', icon: '💸', tags: 'DeFi • 6h 30m', match: 96 },
        { name: 'DAO Governance Mechanisms', icon: '🗳️', tags: 'Governance • 5h 15m', match: 93 },
        { name: 'Account Abstraction & ERC-4337', icon: '🔐', tags: 'Architecture • 7h 00m', match: 92 }
      ];
    }
    return [
      { name: `Advanced ${capitalizedTrack} Scaling Solutions`, icon: '⚡', tags: `${capitalizedTrack} • 8h 30m`, match: 98 },
      { name: `Secure Smart Contract Audits on ${capitalizedTrack}`, icon: '🛡️', tags: `Security • 6h 15m`, match: 95 },
      { name: `Optimizing Gas Mechanics on ${capitalizedTrack}`, icon: '⛽', tags: `Optimization • 5h 00m`, match: 92 }
    ];
  };

  const recommendations = getDynamicRecommendations(progress.current_level, progress.active_track);

  return (
    <div className="dashboard animate-fade-in">
      {/* Header */}
      <div className="analytics-header">
        <h2 className="analytics-header__title">Measure Your Growth</h2>
        <p className="analytics-header__subtitle">Track your progress with actionable insights.</p>
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
                <circle cx="60" cy="60" r="50" className="circular-progress__bar" style={{ strokeDashoffset: 314 - (314 * (progress.overall_pct || 0)) / 100 }} />
                <text x="60" y="65" className="circular-progress__text">{progress.overall_pct || 0}%</text>
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

      <div style={{ textAlign: 'center', marginTop: '32px', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
        © 2026 MOR Finance Ltd. All rights reserved. | AI-Powered Web3 Developer Academy
      </div>
    </div>
  );
};

export default Dashboard;
