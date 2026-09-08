// ─── LevelCard — individual roadmap level card with click selectors ──────────
import React from 'react';
import type { LevelProgress } from '../../types';
import { LEVEL_COLORS, LEVEL_ICONS } from '../../types';
import './LevelCard.css';

interface LevelCardProps {
  level: LevelProgress;
  isLast: boolean;
  onSelect: () => void;
}

export const LevelCard: React.FC<LevelCardProps> = ({ level, isLast, onSelect }) => {
  const pct = level.total_lessons > 0
    ? Math.round((level.completed_lessons / level.total_lessons) * 100)
    : 0;
  const color = LEVEL_COLORS[level.level_id];
  const icon  = LEVEL_ICONS[level.level_id];
  const isComplete = pct >= 100;

  return (
    <div className={`level-card-wrapper animate-fade-up`}>
      {/* Connector line */}
      {!isLast && <div className="level-connector" style={{ '--line-color': color } as React.CSSProperties} />}

      <div
        className={`level-card ${!level.is_unlocked ? 'level-card--locked' : ''} ${isComplete ? 'level-card--complete' : ''}`}
        style={{ '--level-color': color } as React.CSSProperties}
        onClick={level.is_unlocked ? onSelect : undefined}
      >
        {/* Level badge */}
        <div className="level-card__badge">
          <span className="level-card__number">L{level.level_id}</span>
        </div>

        {/* Icon */}
        <div className="level-card__icon-wrap">
          <span className="level-card__icon">{level.is_unlocked ? icon : '🔒'}</span>
        </div>

        {/* Content */}
        <div className="level-card__content">
          <div className="level-card__header">
            <h3 className="level-card__title">{level.title}</h3>
            {isComplete && <span className="badge badge--success">✓ Complete</span>}
            {!level.is_unlocked && <span className="badge badge--locked">Locked</span>}
          </div>

          <p className="level-card__lessons">
            {level.completed_lessons} / {level.total_lessons} lessons
          </p>

          {/* Progress bar */}
          <div className="level-card__progress-track">
            <div
              className="level-card__progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="level-card__footer">
            <span className="level-card__pct">{pct}% complete</span>
            {level.completed_at && (
              <span className="level-card__completed-date">
                🏆 {new Date(level.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelCard;
