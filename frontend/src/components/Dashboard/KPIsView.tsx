// ─── KPIsView — renders Platform Core KPIs in real-time ─────────────────────
import React, { useState, useEffect } from 'react';
import type { PlatformKPIs } from '../../types';
import { fetchDashboardData } from '../../api/client';
import './KPIsView.css';

interface KPIsViewProps {
  userId: string;
}

export const KPIsView: React.FC<KPIsViewProps> = ({ userId }) => {
  const [kpis, setKpis] = useState<PlatformKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData(userId)
      .then((data) => setKpis(data.kpis))
      .catch((err) => console.error("Error fetching KPI details:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="kpi-view-loading">
        <div className="spinner" />
        <p>Fetching platform metrics...</p>
      </div>
    );
  }

  if (!kpis) return null;

  const KPI_METADATA = [
    { label: 'Registered Users',      val: kpis.registered_users,      icon: '👥', desc: 'Total accounts registered on MongoDB' },
    { label: 'Active Learners',       val: kpis.active_learners,       icon: '🔥', desc: 'Active student sessions (last 7 days)' },
    { label: 'Course Completions',     val: kpis.course_completion,     icon: '🎓', desc: 'Students completing 100% of curriculum' },
    { label: 'Average Quiz Score',     val: `${kpis.avg_quiz_score}%`,  icon: '📋', desc: 'Average grade on quiz evaluations' },
    { label: 'Coding Exercises',       val: kpis.coding_exercises,      icon: '💻', desc: 'Total software logic modules compiled' },
    { label: 'Deployed Modules',       val: kpis.deployed_contracts || 0, icon: '🚀', desc: 'Verified software modules deployed to cloud runtimes' },
    { label: 'Certificates Generated', val: kpis.certificates_issued,   icon: '🏆', desc: 'Verifiable credentials issued' },
    { label: 'GitHub Activities',      val: kpis.github_activity,       icon: '🐱', desc: 'Simulated dev commit logs pushed' },
    { label: 'AI Mentor Chats',        val: kpis.ai_mentor_sessions,    icon: '🤖', desc: 'AI assistant streaming SSE chats' },
  ];

  return (
    <div className="kpis-container animate-fade-up">
      <div className="kpis-header">
        <h2 className="kpis-title">Platform Statistics</h2>
        <p className="kpis-subtitle">
          Real-time aggregated analytics captured across the Developer Academy MongoDB database.
        </p>
      </div>

      <div className="kpis-grid">
        {KPI_METADATA.map((kpi, idx) => (
          <div key={idx} className="kpi-card glass">
            <div className="kpi-card__top">
              <span className="kpi-card__icon">{kpi.icon}</span>
              <span className="kpi-card__label">{kpi.label}</span>
            </div>
            <div className="kpi-card__value">{kpi.val}</div>
            <p className="kpi-card__desc">{kpi.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPIsView;
