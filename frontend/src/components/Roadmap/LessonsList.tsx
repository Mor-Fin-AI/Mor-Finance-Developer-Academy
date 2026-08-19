// ─── LessonsList — lists lessons in a selected level ─────────────────────────
import React from 'react';
import type { Course, UserProgress } from '../../types';
import { LEVEL_COLORS } from '../../types';
import './LessonsList.css';

interface LessonsListProps {
  levelId: number;
  courses: Course[];
  progress: UserProgress | null;
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export const LessonsList: React.FC<LessonsListProps> = ({
  levelId,
  courses,
  progress,
  onBack,
  onSelectLesson,
}) => {
  const course = courses.find((c) => c.level_id === levelId);
  const color = LEVEL_COLORS[levelId] || 'var(--clr-accent)';

  if (!course) {
    return (
      <div className="lessons-list-error">
        <h3>Level not found</h3>
        <button className="btn btn--primary" onClick={onBack}>Back to Roadmap</button>
      </div>
    );
  }

  // Determine if a lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    if (!progress) return false;
    
    // 1. Check completed_lesson_ids array
    const completedList = (progress as any).completed_lesson_ids || [];
    if (completedList.includes(lessonId)) return true;

    // 2. Check if there is a passed quiz attempt (score >= 70)
    const passedQuiz = (progress.quiz_attempts || []).some(
      (q) => q.lesson_id === lessonId && q.score >= 70
    );
    if (passedQuiz) return true;

    // 3. Check if there is a successful exercise submission
    const passedExercise = (progress.exercises_submitted || []).some(
      (e) => e.lesson_id === lessonId && (e as any).passed !== false
    );
    if (passedExercise) return true;

    return false;
  };

  // Determine if a lesson is unlocked
  const isLessonUnlocked = (idx: number) => {
    // First lesson is always unlocked if the level itself is unlocked
    if (idx === 0) return true;
    // Subsequent lessons are unlocked if the previous lesson is completed
    const prevLesson = course.lessons[idx - 1];
    return isLessonCompleted(prevLesson.id);
  };

  return (
    <div className="lessons-list-container animate-fade-up">
      {/* Header */}
      <div className="lessons-list-header">
        <button className="btn btn--text lessons-list-back" onClick={onBack}>
          ← Back to Roadmap
        </button>
        <h2 className="lessons-list-title" style={{ '--level-color': color } as React.CSSProperties}>
          Level {levelId} — {course.title}
        </h2>
        <p className="lessons-list-subtitle">
          Complete each lesson and pass the quiz/exercise to unlock the next.
        </p>
      </div>

      {/* List */}
      <div className="lessons-timeline">
        {course.lessons.map((lesson, idx) => {
          const completed = isLessonCompleted(lesson.id);
          const unlocked = isLessonUnlocked(idx);

          return (
            <div
              key={lesson.id}
              className={`lesson-row-card ${completed ? 'lesson-row-card--completed' : ''} ${!unlocked ? 'lesson-row-card--locked' : ''}`}
              style={{ '--level-color': color } as React.CSSProperties}
            >
              {/* Timeline Connector */}
              <div className="timeline-connector-dot">
                <span className="dot-icon">
                  {completed ? '✓' : !unlocked ? '🔒' : '●'}
                </span>
              </div>

              {/* Card Body */}
              <div className="lesson-row-card__body glass">
                <div className="lesson-row-card__info">
                  <div className="lesson-row-card__meta">
                    <span className="lesson-duration">⏱ {lesson.duration}</span>
                    <span className="lesson-xp">⚡ {lesson.xp} XP</span>
                  </div>
                  <h3 className="lesson-row-card__title">{lesson.title}</h3>
                </div>

                <div className="lesson-row-card__action">
                  {completed ? (
                    <button className="btn btn--secondary" onClick={() => onSelectLesson(lesson.id)}>
                      Review Lesson
                    </button>
                  ) : unlocked ? (
                    <button className="btn btn--primary" onClick={() => onSelectLesson(lesson.id)}>
                      Start Lesson
                    </button>
                  ) : (
                    <button className="btn btn--secondary" disabled>
                      Locked
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LessonsList;
