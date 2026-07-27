import React, { useState, useEffect, useRef } from 'react';
import type { Hackathon, UserProgress } from '../../types';
import { fetchHackathons, postHackathonRegister, postHackathonSubmit } from '../../api/client';
import './HackathonsView.css';

interface HackathonsViewProps {
  userId: string;
  onProgressUpdate: (updatedProgress: UserProgress) => void;
  token: string;
}

type HackathonSubPage = 'list' | 'detail' | 'submission';
type HackathonTab = 'all' | 'upcoming' | 'ongoing' | 'completed';
type DetailTab = 'overview' | 'rules' | 'tracks' | 'timeline';

export const HackathonsView: React.FC<HackathonsViewProps> = ({ userId, onProgressUpdate, token }) => {
  const [subPage, setSubPage] = useState<HackathonSubPage>('list');
  const [activeTab, setActiveTab] = useState<HackathonTab>('all');
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('overview');
  
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHack, setSelectedHack] = useState<Hackathon | null>(null);
  const [currentHackPage, setCurrentHackPage] = useState(1);
  const [totalHackCount, setTotalHackCount] = useState(0);

  // Reset page index on tab switch
  useEffect(() => {
    setCurrentHackPage(1);
  }, [activeTab]);

  // Submission Form State
  const [projName, setProjName] = useState('');
  const [projTagline, setProjTagline] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projVideo, setProjVideo] = useState('');
  const [projCode, setProjCode] = useState('');
  const [teamSize, setTeamSize] = useState(4);

  // Sync hackathons list
  useEffect(() => {
    setLoading(true);
    fetchHackathons(
      userId,
      activeTab === 'all' ? undefined : activeTab,
      currentHackPage,
      3
    )
      .then((res) => {
        setHackathons(res.hackathons);
        setTotalHackCount(res.total_count);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userId, subPage, activeTab, currentHackPage]);

  const handleSelectHack = (hack: Hackathon) => {
    setSelectedHack(hack);
    setActiveDetailTab('overview');
    setSubPage('detail');
  };

  const handleRegister = async (e: React.MouseEvent, hackId: string) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const updatedProgress = await postHackathonRegister(hackId, userId, token);
      onProgressUpdate(updatedProgress);
      // Reload hackathons
      const res = await fetchHackathons(
        userId,
        activeTab === 'all' ? undefined : activeTab,
        currentHackPage,
        3
      );
      setHackathons(res.hackathons);
      setTotalHackCount(res.total_count);
      // Update selected
      const freshHack = res.hackathons.find(h => h.hackathon_id === hackId);
      if (freshHack) setSelectedHack(freshHack);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmission = () => {
    if (!selectedHack) return;
    const sub = selectedHack.submission;
    if (sub) {
      setProjName(sub.project_name);
      setProjTagline(sub.tagline);
      setProjDesc(sub.description);
      setProjVideo(sub.video_link);
      setProjCode(sub.code_link);
      setTeamSize(sub.team_size);
    } else {
      setProjName('');
      setProjTagline('');
      setProjDesc('');
      setProjVideo('');
      setProjCode('');
      setTeamSize(4);
    }
    setSubPage('submission');
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHack) return;
    try {
      setLoading(true);
      const updatedProgress = await postHackathonSubmit(
        selectedHack.hackathon_id,
        userId,
        projName.trim(),
        projTagline.trim(),
        projDesc.trim(),
        projVideo.trim(),
        projCode.trim(),
        teamSize,
        token
      );
      onProgressUpdate(updatedProgress);
      setSubPage('list');
      setSelectedHack(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isNameFilled = projName.trim().length > 0;
  const isTaglineFilled = projTagline.trim().length > 0;
  const isDescFilled = projDesc.trim().length > 0;
  const isVideoFilled = projVideo.trim().length > 0;
  const isCodeFilled = projCode.trim().length > 0;
  
  const checklistCount = [isNameFilled, isTaglineFilled, isDescFilled, isVideoFilled, isCodeFilled].filter(Boolean).length;
  const checklistPct = Math.round((checklistCount / 5) * 100);

  const filteredHacks = hackathons;

  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <div className="hackathons-view animate-fade-up">
      {subPage === 'list' && (
        <div className="hacks-full-width">
          {/* Header */}
          <div className="hacks-header">
            <h2 className="hacks-title">Hackathons</h2>
            <p className="hacks-subtitle">Join MOR hackathons to solve real Web3 challenges.</p>
          </div>

          {/* Promo Banner */}
          <div className="hacks-promo-banner glass">
            <h3 className="hacks-promo-banner__title">Build. Innovate. Compete.</h3>
            <p className="hacks-promo-banner__desc">
              Join MOR hackathons to solve real Web3 challenges, earn rewards, and shape the future of decentralized finance.
            </p>
            <div className="hacks-promo-banner__actions">
              <button
                className="btn btn--primary"
                onClick={() => {
                  setActiveTab('all');
                  gridRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                🚀 Explore Hackathons
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  if (hackathons.length > 0) {
                    handleSelectHack(hackathons[0]);
                  }
                }}
              >
                👥 Create Team
              </button>
            </div>
          </div>

          {/* Tab navigator */}
          <div className="hacks-tabs-bar glass" ref={gridRef}>
            <div className="hacks-tabs">
              {([
                { id: 'all', label: 'All' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'ongoing', label: 'Live' },
                { id: 'completed', label: 'Past' }
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  className={`hacks-tab-btn ${activeTab === tab.id ? 'hacks-tab-btn--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Hackathons Grid */}
          {loading ? (
            <div className="hacks-loading">
              <div className="spinner" />
              <p>Loading hackathons...</p>
            </div>
          ) : filteredHacks.length === 0 ? (
            <div className="hacks-empty glass" style={{ marginBottom: 32 }}>
              <p>No hackathons found in this category.</p>
            </div>
          ) : (() => {
            const totalHackPages = Math.ceil(totalHackCount / 3) || 1;

            return (
              <>
                <div className="hacks-cards-grid">
                  {hackathons.map((hack) => (
                    <div key={hack.hackathon_id} className="hack-card glass" onClick={() => handleSelectHack(hack)}>
                      <div className="hack-card__header">
                        <span className="hack-card__badge-live">● LIVE</span>
                        {(() => {
                          const amt = parseInt(hack.prize_pool.replace(/[^0-9]/g, '')) || 0;
                          const diff = amt >= 40000 ? 'ADVANCED' : amt >= 22000 ? 'INTERMEDIATE' : 'BEGINNER';
                          return (
                            <span className={`hack-card__badge-diff hack-card__badge-diff--${diff.toLowerCase()}`}>
                              {diff}
                            </span>
                          );
                        })()}
                      </div>
                      <h4 className="hack-card__title">{hack.title}</h4>
                      <p className="hack-card__desc">{hack.description}</p>
                      
                      <div className="hack-card__stats">
                        <div className="hack-card__stat-item">
                          <span className="hack-card__stat-lbl">Prize Pool</span>
                          <span className="hack-card__stat-val hack-card__stat-val--prize">{hack.prize_pool}</span>
                        </div>
                        <div className="hack-card__stat-item">
                          <span className="hack-card__stat-lbl">Duration</span>
                          <span className="hack-card__stat-val hack-card__stat-val--other">
                            {(() => {
                              const s = new Date(hack.start_date);
                              const e = new Date(hack.end_date);
                              const diff = Math.abs(e.getTime() - s.getTime());
                              const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 3;
                              return `${days} ${days === 1 ? 'Day' : 'Days'}`;
                            })()}
                          </span>
                        </div>
                      </div>

                      <div className="hack-card__footer">
                        <span>Ends {hack.end_date}</span>
                      </div>

                      <button className="btn btn--ghost hack-card__view-btn">
                        View Challenge
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pagination bar */}
                {totalHackPages > 1 && (
                  <div className="pagination-bar" style={{ marginBottom: '32px', borderTop: 'none' }}>
                    <button
                      className="btn btn--secondary btn--sm pagination-btn"
                      disabled={currentHackPage === 1}
                      onClick={() => setCurrentHackPage(currentHackPage - 1)}
                    >
                      ← Prev
                    </button>
                    <span className="pagination-info">
                      Page <strong>{currentHackPage}</strong> of {totalHackPages}
                    </span>
                    <button
                      className="btn btn--secondary btn--sm pagination-btn"
                      disabled={currentHackPage === totalHackPages}
                      onClick={() => setCurrentHackPage(currentHackPage + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            );
          })()}

          {/* Submissions & Judging status card */}
          <div className="judging-panel glass animate-fade-in">
            <h3 className="judging-panel__title">
              <span>🪁</span> My Submissions & Judging Status
            </h3>
            
            {(() => {
              const submissionHack = hackathons.find(h => h.submission);
              const registeredHack = hackathons.find(h => h.is_registered);
              const displayHack = submissionHack || registeredHack;

              if (!displayHack) {
                return (
                  <div className="submission-detail-card" style={{ textAlign: 'center', padding: '32px' }}>
                    <h4 className="submission-detail-card__title" style={{ marginBottom: '8px' }}>Get Ready to Build</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', margin: '0 0 16px 0' }}>
                      You haven't registered for any active hackathons yet.
                    </p>
                    <button 
                      className="btn btn--primary btn--sm" 
                      onClick={() => {
                        const firstOngoing = hackathons.find(h => h.status === 'ongoing');
                        if (firstOngoing) handleSelectHack(firstOngoing);
                      }}
                    >
                      Explore Active Challenges
                    </button>
                  </div>
                );
              }

              const hasSubmitted = !!displayHack.submission;
              const projTitle = displayHack.submission ? displayHack.submission.project_name : `Registered: ${displayHack.title}`;
              const badgeText = hasSubmitted ? 'Under Review' : 'Registered';
              const codeLink = displayHack.submission ? displayHack.submission.code_link : 'No project submitted yet';
              
              const steps = [
                { label: 'Submission Review', status: hasSubmitted ? 'completed' : 'active', icon: '✓' },
                { label: 'Technical Evaluation', status: hasSubmitted ? 'active' : 'pending', icon: '⬡' },
                { label: 'Final Judging', status: 'pending', icon: '🔨' },
                { label: 'Results Announced', status: 'pending', icon: '🏁' }
              ];

              return (
                <div className="submission-detail-card">
                  <div className="submission-detail-card__header">
                    <h4 className="submission-detail-card__title">{projTitle}</h4>
                    <span className="submission-detail-card__badge" style={{
                      color: hasSubmitted ? 'var(--clr-warning)' : 'var(--clr-success)',
                      background: hasSubmitted ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      border: hasSubmitted ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                    }}>{badgeText}</span>
                  </div>
                  
                  <div className="submission-detail-card__meta">
                    <span className="submission-detail-card__meta-item">
                      🔗 {codeLink}
                    </span>
                    <span className="submission-detail-card__meta-item">
                      📅 Deadline: {displayHack.end_date}
                    </span>
                  </div>

                  {/* Timeline stepper */}
                  <div className="stepper-timeline">
                    <div className="stepper-line">
                      <div className="stepper-line-fill" style={{ width: hasSubmitted ? '50%' : '12.5%' }} />
                    </div>
                    
                    {steps.map((step, idx) => (
                      <div key={idx} className="stepper-step">
                        <span className={`stepper-icon ${
                          step.status === 'completed' ? 'stepper-icon--completed' : 
                          step.status === 'active' ? 'stepper-icon--active' : ''
                        }`}>
                          {step.icon}
                        </span>
                        <span className={`stepper-label ${
                          step.status === 'completed' ? 'stepper-label--completed' : 
                          step.status === 'active' ? 'stepper-label--active' : ''
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="stepper-alert">
                    <span>ℹ️</span>
                    <span>
                      {hasSubmitted 
                        ? '3 of 5 criteria evaluated — Technical score pending final review'
                        : 'Awaiting project submission before judging evaluation begins.'
                      }
                    </span>
                  </div>
                  <div style={{ 
                    height: '3px', 
                    background: hasSubmitted ? 'var(--clr-primary)' : 'var(--clr-success)', 
                    borderRadius: '2px', 
                    marginTop: '12px', 
                    width: hasSubmitted ? '50%' : '12.5%',
                    transition: 'all 0.4s ease'
                  }} />
                </div>
              );
            })()}
          </div>

          {/* Winners & Rewards Section */}
          <div className="winners-section glass" style={{ padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)' }}>
            <div>
              <h3 className="winners-section__title">Winners & Rewards</h3>
              <div className="winners-list-mock">
                {[
                  { team: 'TechForge Team', place: '1st Place - DeFi Innovation', prize: '$30,000', medal: '🥇' },
                  { team: 'Nexus Builders', place: '2nd Place - DeFi Innovation', prize: '$15,000', medal: '🥈' },
                  { team: 'CodeWave', place: '3rd Place - DeFi Innovation', prize: '$5,000', medal: '🥉' }
                ].map((w, idx) => (
                  <div key={idx} className="winner-card">
                    <div className="winner-card__left">
                      <span className="winner-card__medal">{w.medal}</span>
                      <div>
                        <h4 className="winner-card__team">{w.team}</h4>
                        <span className="winner-card__place">{w.place}</span>
                      </div>
                    </div>
                    <span className="winner-card__prize">{w.prize}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="winners-section__title">Achievement Badges</h3>
              <div className="badges-container">
                <span className="badge-tag-custom">🏆 Top 10 Finisher</span>
                <span className="badge-tag-custom">✨ Best UX</span>
                <span className="badge-tag-custom">💡 Innovation Award</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {subPage === 'detail' && selectedHack && (
        <div className="hack-detail-container">
          <div className="hack-detail-header-row">
            <button className="btn btn--text back-btn" onClick={() => setSubPage('list')}>
              ← Back to Hackathons
            </button>
          </div>

          <div className="hack-hero-card glass">
            <div className="hack-hero-main">
              <span className="hack-hero-status">Active Hackathon</span>
              <h1 className="hack-detail-title">{selectedHack.title}</h1>
              <p className="hack-detail-desc">{selectedHack.description}</p>
              
              <div className="hack-detail-meta-box">
                <div>
                  <span className="hack-lbl">Prize Pool</span>
                  <span className="hack-val hack-val--prize">{selectedHack.prize_pool}</span>
                </div>
                <div>
                  <span className="hack-lbl">Hackathon Timeline</span>
                  <span className="hack-val">{selectedHack.start_date} to {selectedHack.end_date}</span>
                </div>
              </div>

              <div className="hack-hero-actions">
                {selectedHack.is_registered ? (
                  <button className="btn btn--primary" onClick={handleOpenSubmission}>
                    {selectedHack.submission ? 'Edit Submission' : 'Manage Submission'}
                  </button>
                ) : (
                  <button className="btn btn--primary" onClick={(e) => handleRegister(e, selectedHack.hackathon_id)}>
                    Register Now
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Menu */}
          <div className="hack-tabs-container glass">
            <div className="hack-detail-tabs">
              {(['overview', 'rules', 'tracks', 'timeline'] as DetailTab[]).map((tab) => (
                <button
                  key={tab}
                  className={`hack-detail-tab-btn ${activeDetailTab === tab ? 'hack-detail-tab-btn--active' : ''}`}
                  onClick={() => setActiveDetailTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="hack-detail-tab-body">
              {activeDetailTab === 'overview' && (
                <div>
                  <h3>About the Hackathon</h3>
                  <p>{selectedHack.description}</p>
                  <h4 style={{marginTop: 20}}>Eligibility</h4>
                  <p>All developers, designers, and Web3 enthusiasts globally are eligible to participate. Build apps that leverage decentralized technology!</p>
                </div>
              )}

              {activeDetailTab === 'rules' && (
                <div>
                  <h3>Official Rules</h3>
                  <ul className="hack-list-rules">
                    {selectedHack.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeDetailTab === 'tracks' && (
                <div>
                  <h3>Innovation Tracks</h3>
                  <div className="hack-tracks-grid">
                    {selectedHack.tracks.map((track, idx) => (
                      <div key={idx} className="hack-track-card glass">
                        <h4>{track}</h4>
                        <p>Build solutions targeting the {track} track to be eligible for special category rewards.</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDetailTab === 'timeline' && (
                <div>
                  <h3>Milestones Timeline</h3>
                  <div className="hack-milestones-timeline">
                    {selectedHack.milestones.map((m, idx) => (
                      <div key={idx} className="hack-milestone-item">
                        <div className="hack-milestone-marker" />
                        <div>
                          <div className="hack-milestone-title">{m.title}</div>
                          <div className="hack-milestone-date">{m.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subPage === 'submission' && selectedHack && (
        <div className="submission-workspace">
          <div className="submission-header-row">
            <button className="btn btn--text back-btn" onClick={() => setSubPage('detail')}>
              ← Back to Details
            </button>
          </div>

          <div className="submission-layout">
            {/* Form */}
            <form onSubmit={handleSubmission} className="submission-form glass">
              <h3>My Submission</h3>
              <p className="submission-subtitle">Manage your hackathon project submission.</p>

              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. DeFi Yield Optimizer"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Optimized yield generation protocol for Morpheus users"
                  value={projTagline}
                  onChange={(e) => setProjTagline(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Describe your project, features, and technical architecture..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="form-textarea"
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Video Presentation Link</label>
                <input
                  type="url"
                  placeholder="e.g. YouTube or Loom link"
                  value={projVideo}
                  onChange={(e) => setProjVideo(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Repository URL</label>
                <input
                  type="url"
                  placeholder="e.g. https://github.com/username/project"
                  value={projCode}
                  onChange={(e) => setProjCode(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team Size</label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5].map(s => (
                    <option key={s} value={s}>{s} {s === 1 ? 'member' : 'members'}</option>
                  ))}
                </select>
              </div>

              <div className="create-post-actions">
                <button type="button" className="btn btn--secondary" onClick={() => setSubPage('detail')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  {selectedHack.submission ? 'Update Submission' : 'Submit Project'}
                </button>
              </div>
            </form>

            {/* Progress checklist sidebar */}
            <div className="submission-checklist-panel glass">
              <h4>Project Progress</h4>
              <div className="checklist-progress-container">
                <div className="checklist-progress-bar" style={{ width: `${checklistPct}%` }} />
                <span className="checklist-pct-lbl">{checklistPct}% complete</span>
              </div>

              <div className="checklist-items">
                <div className={`checklist-item ${isNameFilled ? 'checklist-item--checked' : ''}`}>
                  <span className="check-bullet">{isNameFilled ? '✓' : '○'}</span>
                  <span>Project Name added</span>
                </div>
                <div className={`checklist-item ${isTaglineFilled ? 'checklist-item--checked' : ''}`}>
                  <span className="check-bullet">{isTaglineFilled ? '✓' : '○'}</span>
                  <span>Tagline filled</span>
                </div>
                <div className={`checklist-item ${isDescFilled ? 'checklist-item--checked' : ''}`}>
                  <span className="check-bullet">{isDescFilled ? '✓' : '○'}</span>
                  <span>Description written</span>
                </div>
                <div className={`checklist-item ${isVideoFilled ? 'checklist-item--checked' : ''}`}>
                  <span className="check-bullet">{isVideoFilled ? '✓' : '○'}</span>
                  <span>Demo Video linked</span>
                </div>
                <div className={`checklist-item ${isCodeFilled ? 'checklist-item--checked' : ''}`}>
                  <span className="check-bullet">{isCodeFilled ? '✓' : '○'}</span>
                  <span>GitHub Repository URL added</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonsView;
