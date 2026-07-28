"""
Quiz API Routers — handles submission, evaluation, grading, and XP awards for quizzes.
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from src.services.lessons import LESSONS_DB, get_track_lessons
from src.services.db import log_quiz_attempt, complete_lesson_for_user, get_or_create_user
from src.models.progress import QuizSubmission
from src.services.auth_helper import verify_token

router = APIRouter()

@router.post("/submit")
async def submit_quiz(sub: QuizSubmission, verified_id: str = Depends(verify_token)):
    """Evaluate quiz answers, record score, and advance progress if passed."""
    if sub.user_id != verified_id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot submit quiz attempts for another user account.")
    lesson_id = sub.lesson_id
    lesson = None
    if lesson_id in LESSONS_DB:
        lesson = LESSONS_DB[lesson_id]
    else:
        user = await get_or_create_user(verified_id)
        track = user.get("active_track", "ethereum")
        track_lessons = get_track_lessons(track)
        for tl in track_lessons:
            if tl.id == lesson_id:
                lesson = tl
                break
        if not lesson:
            from src.api.courses import SUPPORTED_TRACKS
            for tr in SUPPORTED_TRACKS:
                for tl in get_track_lessons(tr):
                    if tl.id == lesson_id:
                        lesson = tl
                        break
                if lesson:
                    break
            
    if not lesson:
        raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found")
        
    quiz_questions = lesson.quiz
    
    if len(sub.answers) != len(quiz_questions):
        raise HTTPException(
            status_code=400, 
            detail=f"Expected {len(quiz_questions)} answers, but received {len(sub.answers)}"
        )
        
    correct_count = 0
    results = []
    
    for i, q in enumerate(quiz_questions):
        user_ans = sub.answers[i]
        is_correct = (user_ans == q.correct_idx)
        if is_correct:
            correct_count += 1
        results.append({
            "question": q.question,
            "user_answer_idx": user_ans,
            "correct_answer_idx": q.correct_idx,
            "is_correct": is_correct
        })
        
    score = round((correct_count / len(quiz_questions)) * 100, 1)
    passed = score >= 70.0
    
    # Log attempt in MongoDB (and award 50 XP if passing for the first time)
    await log_quiz_attempt(sub.user_id, lesson_id, score, lesson.level_id)
    
    # If passed, check if they can mark the lesson as completed!
    # A lesson is completed if they pass the quiz.
    if passed:
        await complete_lesson_for_user(sub.user_id, lesson.level_id, lesson_id)
        
    # Get updated user profile
    user = await get_or_create_user(sub.user_id)
    
    return {
        "score": score,
        "passed": passed,
        "correct_count": correct_count,
        "total_questions": len(quiz_questions),
        "results": results,
        "user_progress": user
    }
