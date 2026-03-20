# NeuroLearn: System Architecture & Documentation

## 🏗️ System Overview
NeuroLearn is a full-stack AI-driven learning platform built with **Django (Backend)** and **React (Frontend)**. It leverages LLMs via **OpenRouter** to generate personalized study plans, lessons, and adaptive quizzes.

## 📂 Project Structure

### Backend (`/backend`)
- **`core/`**: Django project settings and base configuration.
- **`accounts/`**: User authentication, profiles, and stream-specific metadata.
- **`ai_engine/`**: The core AI logic. Contains prompt templates and LLM integration utilities.
- **`study_plan/`**: Handles the creation and management of syllabi and study sessions.
- **`lessons/`**: Manages generated lesson content.
- **`quiz/`**: Manages AI-generated assessments and adaptive feedback.
- **`activity_log/`**: Tracks user interactions for progress analytics.

### Frontend (`/frontend`)
- **`src/components/`**: Reusable UI components (Vite + TailwindCSS).
- **`src/pages/`**: Main application views (Dashboard, Study Session, Quiz).
- **`src/services/`**: API integration layer using Axios.

## 🧠 AI Integration (Prompt Engineering)
The system uses a templated prompt approach found in `backend/ai_engine/prompts/`. 

- **Study Plan Generation**: Strictly follows a 1-topic-per-day rule.
- **Lesson Generation**: Uses a Persona-based approach for "Senior Academic Tutors".
- **Adaptive Explanation**: Automatically simplifies complex topics based on user feedback.

## 🛠️ Key API Flow
1. **Plan Creation**: `POST /api/study-plan/create/` -> Triggers AI Syllabus Generation.
2. **Session Start**: `POST /api/study-plan/start-session/` -> Generates micro-learning sub-sessions.
3. **Content Delivery**: `GET /api/study-plan/session/<id>/` -> Fetches AI-generated lessons and quizzes.

## 💾 Database Architecture

The system uses a relational PostgreSQL database. The core logic revolves around the user's study plan and the hierarchical generation of content.

### Core Data Models

#### 1. User & Profile (`/accounts`)
- **`CustomUser`**: Extends Django's `AbstractUser`, using `phone_number` as the primary identifier.
- **`UserProfile`**: Stores learner metadata like `age_group`, `stream`, and `learning_pace`.

#### 2. Planning (`/study_plan`)
- **`StudyPlan`**: The top-level entity representing a learning goal (e.g., "Django for Jobs").
- **`AIPlanVersion`**: Tracks iterations of a plan. If a user misses days or performs poorly, a new "version" can be generated.
- **`AITopicPlan`**: A major subject area within a plan (e.g., "MVT Architecture").
- **`StudySession`**: A specific calendar day's worth of learning.

#### 3. Content & Assessment (`/study_plan` & `/quiz`)
- **`SubSession`**: A granular learning unit (20-minute block).
- **`SessionContent`**: The actual AI-generated lesson in Markdown format.
- **`QuizQuestion`**: AI-generated assessment tailored to the sub-session content.
- **`QuizAttempt`**: Tracks user performance and triggers the **`AI_EXPLANATION`** engine for mistakes.

---
*Documentation generated for NeuroLearn Showcase Preparation.*
