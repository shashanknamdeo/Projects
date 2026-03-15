
# NeuroLearn – Quiz Evaluation & AI Explanation Flow

After a user completes a **learning session**, the system evaluates understanding through quiz questions.

Each session contains **one or more quiz questions**.

The quiz type is **Multiple Correct Answer (MCA)**, meaning more than one option may be correct.

---

# 1. Quiz Generation (During Content Creation)

When the session content is generated, the AI also generates quiz questions.

Structure:

```
Session
   │
   ├── Learning Content (.md)
   │
   └── Quiz
        ├── Question 1
        ├── Question 2
        └── Question N
```

Each quiz question contains:

* Question text
* Multiple options
* One or more correct answers

Example:

```
Question:
Which of the following are characteristics of Machine Learning?

Options:
A. Learns patterns from data
B. Requires explicit programming for every task
C. Improves with experience
D. Stores files permanently

Correct Answers:
A, C
```

---

# 2. User Attempts Quiz

After completing the session:

```
User Completes Session
        │
        ▼
Quiz Appears
        │
        ▼
User Selects Answers
```

---

# 3. Answer Evaluation

The system compares the **user's selected answers** with the **correct answers** stored in the system.

Two outcomes are possible:

```
User Answer
   │
   ├── Correct
   │
   └── Incorrect
```

---

# 4. If Answer is Correct

If the user answers correctly:

* No explanation is generated
* The result is simply marked **Correct**
* The user moves to the next session

```
Correct Answer
     │
     ▼
Mark as Correct
     │
     ▼
Continue Learning
```

---

# 5. If Answer is Incorrect

If the user answers incorrectly:

The system triggers **Generative AI** to produce a clear explanation.

The explanation is generated in **Markdown (.md)** format.

```
Incorrect Answer
       │
       ▼
Trigger AI Explanation Generator
       │
       ▼
Generate Explanation (.md)
       │
       ▼
Show to User
       │
       ▼
Save in Database
```

---

# 6. Explanation Format (.md)

Example generated explanation:

```
# Explanation

Machine Learning systems learn patterns from data.

Correct concepts:

- Machine Learning models improve with experience.
- They learn patterns automatically from training data.

Incorrect concept:

Explicit programming for every rule is part of
traditional programming, not machine learning.
```

---

# 7. Explanation Storage

The generated explanation is stored for future use.

Benefits:

* User can **review mistakes later**
* The system can track **learning gaps**
* Avoids regenerating explanations repeatedly

Structure:

```
User Progress
   │
   ├── Session
   │
   └── Incorrect Quiz Attempt
          │
          └── Saved Explanation (.md)
```

---

# 8. Complete Quiz Flow

```
Session Completed
        │
        ▼
Quiz Appears (Question-1, 2, 3, ...)
        │
        ▼
User Answers
        │
        ▼
Evaluate Answer
        │
   ┌────┴────┐
   │         │
Correct   Incorrect
   │         │
   │     Generate AI
   │     Explanation (.md)
   │         │
   │         ▼
   │    Show + Save
   │         │
   ▼         ▼
 Submit and Next question

```

---

# 9. Why This Design is Powerful

This approach helps NeuroLearn:

* Provide **instant feedback**
* Teach users from their **mistakes**
* Personalize learning
* Reduce repeated confusion

Instead of only telling **"Wrong Answer"**, the system **teaches the concept again.**
