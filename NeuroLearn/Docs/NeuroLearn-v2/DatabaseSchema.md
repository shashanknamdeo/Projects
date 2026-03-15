
# NeuroLearn-v2 Database Schema (Minimal Changes)

```
Users
   └── Study_Plans
         └── AI_Plan_Versions
               └── Topic
                     └── Study_Sessions
                           └── Sub_Sessions
                                 ├── Session_Content
                                 └── Quiz_Questions
                                       └── User_Quiz_Attempts
                                             └── AI_Explanations
```

Now **each subsession contains:**

* learning content
* quiz question

---

# Core Tables

1. users
2. study_plans
3. ai_plan_versions
4. topic
5. study_sessions
6. sub_sessions
7. session_content
8. quiz_questions
9. user_quiz_attempts
10. ai_explanations

---

# 1. Users

```
users
------
id (PK)
name
email (unique)
learning_pace            -- slow | medium | fast
preferred_language
created_at
```

Stable table. No AI dependency.

---

# 2. Study Plans

```
study_plans
------------
id (PK)
user_id (FK → users.id)
subject
goal_type                -- clarity | exam | revision
total_days
daily_minutes
start_date
status                   -- active | completed | paused
created_at
```

Stores **user intent only**.

---

# 3. AI Plan Versions

```
ai_plan_versions
----------------
id (PK)
study_plan_id (FK)
version_number
trigger_reason           -- initial | replan | user_request
ai_model
is_active
created_at
```

Used when AI **regenerates the plan**.

---

# 4. Topic (AI Generated Syllabus)

```
topic
---------
id (PK)
plan_version_id (FK)
title
description
sequence_order
allocated_days
created_at
```

Example:

```
Machine Learning
   |
   ├── Introduction
   ├── Supervised Learning
   ├── Unsupervised Learning
```

---

# 5. Study Sessions (One Day)

```
study_sessions
--------------
id (PK)
plan_version_id (FK)
topic_id (FK)
day_number
available_minutes
actual_minutes_spent
session_status         -- pending | completed | skipped
created_at
```

Each **session = one day of study**.

---

# 6. Sub Sessions (Learning Units)

These are **topics inside a session**.

```
sub_sessions
------------
id (PK)
session_id (FK)
title
sequence_order
allocated_minutes
created_at
```

Example:

```
Session: Supervised Learning

Sub-Sessions:
1. Regression
2. Classification
3. Loss Functions
```

---

# 7. Session Content (.md)

The **actual learning material**.

```
session_content
---------------
id (PK)
sub_session_id (FK)
content_md TEXT
ai_model
generated_at
```

This is the **markdown content shown to the user**.

---

# 8. Quiz Questions (UPDATED)

Quiz is now attached to **subsession** instead of session.

```
quiz_questions
--------------
id (PK)
sub_session_id (FK)
question_text
options JSON
correct_answers JSON
difficulty
created_at
```

Example:

```
options = [
  "A. Regression",
  "B. Classification",
  "C. Clustering",
  "D. Reinforcement"
]

correct_answers = ["A", "B"]
```

Supports **multiple correct answers**.

---

# 9. User Quiz Attempts

Tracks **what the user answered**.

```
user_quiz_attempts
------------------
id (PK)
quiz_question_id (FK)
user_id (FK)
selected_answers JSON
is_correct
attempted_at
```

---

# 10. AI Explanations (Generated only if wrong)

If the answer is incorrect, AI generates explanation.

```
ai_explanations
---------------
id (PK)
quiz_attempt_id (FK)
explanation_md TEXT
ai_model
created_at
```

Important rule:

```
Correct Answer
   → no explanation generated

Incorrect Answer
   → explanation generated + saved
```

---

# Updated Learning Flow

```
User
 │
 ▼
Study Plan
 │
 ▼
AI Plan Version
 │
 ▼
Topic
 │
 ▼
Study Sessions (Days)
 │
 ▼
Sub-Sessions
 │
 ├── Markdown Content (.md)
 │
 └── Quiz Question
        │
        ▼
   User Quiz Attempt
        │
        ├── Correct → continue
        │
        └── Incorrect
               │
               ▼
         AI Explanation (.md)
```