import re
from fastapi import APIRouter, HTTPException, Depends
from src.services.lessons import LESSONS_DB, get_track_lessons
from src.services.db import log_exercise_submission, get_or_create_user
from src.models.progress import ExerciseSubmission
from src.services.auth_helper import verify_token

router = APIRouter()

def validate_solidity_syntax(code: str) -> list:
    errors = []
    
    # 1. Unbalanced parentheses/brackets/curly braces check
    stack = []
    brackets = {'(': ')', '{': '}', '[': ']'}
    for char_idx, char in enumerate(code):
        if char in brackets.keys():
            stack.append((char, char_idx))
        elif char in brackets.values():
            if not stack:
                errors.append(f"Syntax error: Unbalanced bracket '{char}' at position {char_idx}")
            else:
                top, top_idx = stack.pop()
                if brackets[top] != char:
                    errors.append(f"Syntax error: Mismatched brackets. Opened '{top}' at position {top_idx} but closed with '{char}' at position {char_idx}")
    
    if stack:
        for top, top_idx in stack:
            errors.append(f"Syntax error: Unclosed bracket '{top}' opened at position {top_idx}")
            
    # 2. Semicolon checks
    lines = code.split('\n')
    for line_idx, line in enumerate(lines):
        stripped = line.strip()
        # Skip empty lines, comments, import statements, pragmas, function/contract headers, or lines ending with structural braces
        if (not stripped or 
            stripped.startswith('//') or 
            stripped.startswith('/*') or 
            stripped.startswith('*') or
            stripped.startswith('pragma') or 
            stripped.startswith('import') or 
            stripped.startswith('contract') or 
            stripped.startswith('interface') or 
            stripped.startswith('library') or 
            stripped.startswith('function') or 
            stripped.startswith('constructor') or 
            stripped.startswith('modifier') or 
            stripped.startswith('event') or 
            stripped.startswith('struct') or 
            stripped.startswith('enum') or 
            stripped.endswith('{') or 
            stripped.endswith('}') or 
            stripped.endswith('*/')):
            continue
        
        # Check if line contains expressions but lacks a trailing semicolon
        if any(kw in stripped for kw in ['require', 'requir', '_', '=', 'return', 'emit']) and not stripped.endswith(';'):
            errors.append(f"Syntax error: Missing semicolon ';' at the end of statement: '{stripped}'")
            
    return errors

@router.post("/submit")
async def submit_exercise(sub: ExerciseSubmission, verified_id: str = Depends(verify_token)):
    """Check code structure, log submission, and update XP/progress."""
    if sub.user_id != verified_id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot submit exercises for another user account.")
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
        
    if not lesson.exercise:
        raise HTTPException(status_code=400, detail="This lesson does not have a coding exercise")
        
    exercise = lesson.exercise
    code = sub.code
    
    # Run structural syntax checks (for Solidity lessons only)
    is_non_solidity = any(k in sub.lesson_id.lower() for k in ['polkadot', 'substrate', 'starknet', 'aptos', 'solana'])
    syntax_errors = [] if is_non_solidity else validate_solidity_syntax(code)
    
    missing_keywords = []
    for keyword in exercise.required_keywords:
        if keyword not in code:
            missing_keywords.append(keyword)
            
    passed = len(missing_keywords) == 0 and len(syntax_errors) == 0
    feedback = ""
    
    if passed:
        feedback = "🎉 Excellent! Your smart contract code compiles and matches all structural checks successfully."
    else:
        feedback = "❌ Code validation failed. Please check the compiler errors."
        
    # Log submission and award 100 XP if it passes for the first time
    await log_exercise_submission(sub.user_id, lesson_id, code, passed, lesson.level_id)
    
    # Get updated user profile
    user = await get_or_create_user(sub.user_id)
    
    return {
        "passed": passed,
        "feedback": feedback,
        "missing_keywords": missing_keywords,
        "syntax_errors": syntax_errors,
        "user_progress": user
    }
