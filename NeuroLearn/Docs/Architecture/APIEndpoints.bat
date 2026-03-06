
rem 1. Authentication & User Initialization
rem     Verify Cognito Token & Initialize User

POST /auth/verify


rem _______________________________________________________________________________________________


rem 2. Onboarding Contracts
rem     2.1 Submit Onboarding Data

POST /onboarding/


rem ---------------------------------------------

rem     2.2 Get Onboarding Status

GET /onboarding/status


rem _______________________________________________________________________________________________


rem 3. Study Plan Creation (AI)
rem     3.1 Create Study Plan (AI-Generated)

POST /study-plans/

rem ---------------------------------------------

rem     3.2 Get Study Plan Overview

GET /study-plans/{study_plan_id}


rem _______________________________________________________________________________________________


rem 4. AI Topic & Subtopic Contracts
rem     Get AI-Generated Topic Plan

GET /study-plans/{study_plan_id}/topics


rem _______________________________________________________________________________________________


rem 5. Study Session Contracts
rem     5.1 Generate Study Session

POST /study-sessions/


rem ---------------------------------------------

rem     5.2 Get Study Session

GET /study-sessions/{session_id}


rem _______________________________________________________________________________________________


rem 6. Concept Re-Explanation (Confusion Handler)
rem     Request Re-Explanation

POST /ai/re-explain


rem _______________________________________________________________________________________________


rem 7. Quiz Generation (Optional MVP+)
rem     Generate Quiz

POST /ai/quiz


rem _______________________________________________________________________________________________


rem 8. Progress Tracking
rem     8.1 Update Session Progress

POST /progress/update

rem ---------------------------------------------

rem     8.2 Get Overall Progress

GET /progress/overview


rem _______________________________________________________________________________________________


rem 9. User Feedback
rem     Submit Feedback

POST /feedback/

