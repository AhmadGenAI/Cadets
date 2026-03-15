# Objective
Overhaul student portal: Interview Prep (500+ Q&A, GK quiz, confidence guide), MCQ Quizzes (fix subjects, 25-question quiz with progress/restart/unique questions), PDF Papers (auto 5 MCQs, unique each time), Live Chat tutor (replace Start Preparation, MCQ-based tutoring with voice, subject switching).

# Tasks

### T001: Overhaul Interview Preparation Page
- **Blocked By**: []
- **Details**:
  - Rewrite `client/src/pages/portal-interview.tsx` with tabbed sections:
    1. **Common Questions** tab: 500+ interview questions with best model answers, organized in expandable accordion cards. Include categories: Self-Introduction, Family & Background, General Knowledge, Pakistan Studies, Islamic Knowledge, Cadet College Specific, Personality & Character, Current Affairs, Academic, Miscellaneous.
    2. **General Knowledge Quiz** tab: Interactive GK quiz with 20 questions, instant right/wrong feedback, score at end, restart option.
    3. **Confidence & Body Language** tab: Detailed instructions with step-by-step guidance (posture, eye contact, handshake, voice tone, sitting position, dressing), formatted as visual instruction cards with icons.
    4. All questions must include best model answers
  - Files: `client/src/pages/portal-interview.tsx`
  - Acceptance: Page loads with tabs, 500+ questions visible with answers, GK quiz works, confidence guide shows

### T002: Overhaul MCQ Quizzes Page
- **Blocked By**: []
- **Details**:
  - Rewrite `client/src/pages/portal-quizzes.tsx`:
    1. Show ALL available subjects in the subject dropdown (currently subjects come from API data — ensure they're visible)
    2. On "Start Quiz", select 25 random questions from the chosen subject
    3. Show one question at a time with A/B/C/D options
    4. On clicking any option: immediately show if right (green) or wrong (red), and highlight the correct answer
    5. Track score throughout (show progress bar: "Question X of 25")
    6. After 25 questions: show final score with percentage, performance message, and "Restart Quiz" button
    7. On restart: shuffle and pick 25 NEW different questions (not the same as last round)
    8. Keep track of "used question IDs" in state so each quiz round gets fresh questions
  - Files: `client/src/pages/portal-quizzes.tsx`
  - Acceptance: Subject dropdown shows all subjects, quiz runs 25 questions, right/wrong shown per click, restart gives new questions

### T003: Overhaul PDF Papers
- **Blocked By**: []
- **Details**:
  - Update `client/src/pages/portal-pdf.tsx` and `server/routes.ts` (PDF endpoint):
    1. Change PDF to auto-generate with 5 MCQs (not 25)
    2. Each generation picks random 5 questions — different every time
    3. Keep the existing watermark, answer key, and branding
    4. Update the frontend text to say "5 MCQs" instead of "25"
  - In `server/routes.ts`, change `MAX_QUESTIONS = 25` to `MAX_QUESTIONS = 5` in the PDF generation route
  - Files: `client/src/pages/portal-pdf.tsx`, `server/routes.ts`
  - Acceptance: PDF generates with 5 questions, different questions each time

### T004: Overhaul Live Chat Tutor (Replace "Start Preparation")
- **Blocked By**: []
- **Details**:
  - Rewrite `client/src/pages/portal-prep.tsx` and update `server/routes.ts` tutor endpoint:
  - **Frontend changes** to `portal-prep.tsx`:
    1. Rename from "Smart Tutor" / "Start Preparation" to "Live Chat"
    2. Welcome message: "Assalamo Alaikum! I am your online tutor. Which subject do you want to study first?"
    3. Show subject buttons (Math, English, Science, Urdu, GK) for student to pick
    4. After subject selection, start giving MCQs one by one from the database
    5. After student clicks an option, tell them if right or wrong. For Math, also give explanation
    6. Auto-speak each question using SpeechSynthesis (keep existing voice code)
    7. Add a voice ON/OFF toggle button so student can mute/unmute the tutor voice
    8. After every 50 MCQs, ask "Do you want to continue with [subject] or switch to another subject?"
    9. If student asks to explain, explain the topic. Otherwise keep sharing MCQs
    10. For Urdu: if student asks for essay/application/letter/story, offer topic choices and write the selected one
  - **Backend changes** to `server/routes.ts` (tutor chat endpoint):
    1. When message contains a subject name, fetch MCQs from database for that subject and return one MCQ formatted as options
    2. When message is an option letter (A/B/C/D), check correctness and respond accordingly
    3. Handle "explain" requests
    4. Handle Urdu essay/letter/application/story requests
  - Update portal.tsx dashboard: change "Start Preparation" to "Live Chat"
  - Files: `client/src/pages/portal-prep.tsx`, `server/routes.ts`, `client/src/pages/portal.tsx`
  - Acceptance: Live Chat opens with Assalamo Alaikum, subject selection works, MCQs flow one by one with feedback, voice toggle works, subject switching after 50
