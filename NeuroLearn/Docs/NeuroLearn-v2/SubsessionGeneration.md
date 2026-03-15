
# NeuroLearn – Micro Learning Unit Architecture

Instead of generating quizzes **after a session**, NeuroLearn now evaluates understanding **after every subsession**.

Each **subsession becomes a complete learning unit**.

```text
Learning Unit
   ├── Subsession (Topic)
   ├── Quiz
   └── Quiz Explanation
```

These three components are **generated together in a single AI request**.

---

# 1. Learning Hierarchy

The learning structure becomes:

```
Study Plan
   └── Topics
         └── Sessions (Day)
               └── Learning Units
                     ├── Subsession Topic
                     ├── Quiz Question
                     └── Quiz Explanation
```

So the smallest **learning element** is now:

```
1 Learning Unit
```

---

# 2. Learning Unit Structure

Each unit contains **three tightly coupled components**.

```
Learning Unit
│
├── Subsession
│      Topic Explanation (.md)
│
├── Quiz
│      Concept Validation
│
└── Quiz Explanation
       Explanation shown if answer is incorrect
```

Important rule:

```
Explanation is generated together with the quiz
but shown only when the user answers incorrectly.
```

---

# 3. AI Generation Strategy

Each **Learning Unit** is generated with **one prompt**.

```
AI Prompt
   │
   ▼
Generate:
   1 Subsession
   1 Quiz
   1 Quiz Explanation
```

This guarantees:

* the **quiz directly tests the subsession**
* the **explanation aligns with the quiz**
* conceptual **consistency**

---

# 4. AI Generation Flow

```
Session Start
     │
     ▼
Generate Learning Unit (AI Call)
     │
     ▼
Subsession Content
     │
     ▼
User Reads
     │
     ▼
User Attempts Quiz
     │
     ├── Correct
     │      → Continue to next unit
     │
     └── Incorrect
            → Show AI Explanation
```

---

# 5. Example Learning Unit

Example for topic **Arrays**.

```
Subsession Topic:
Array Basics

Content:
Definition of arrays, indexing, memory structure.

Quiz:
Which property is true about arrays?

A. Dynamic size  
B. Continuous memory allocation  
C. No indexing  
D. Random memory storage  

Correct Answer:
B

Quiz Explanation:
Arrays store elements in continuous memory locations.
This enables constant-time indexing using an index.
```

---

# 6. Why This Design Is Powerful

Your design follows **proven cognitive science principles**.

### Immediate Reinforcement

Learning is validated instantly.

### Micro Learning

Small concepts reduce cognitive overload.

### Concept Testing

Each concept is tested immediately.

### Consistency

Single prompt ensures:

```
Subsession
Quiz
Explanation
```

all refer to the **same concept**.

---

# 7. AI Request Model

Instead of generating entire sessions:

```
Old Approach

Session
   ├── Content
   └── Quiz
```

You now generate:

```
New Approach

Learning Unit
   ├── Subsession
   ├── Quiz
   └── Explanation
```

---

# 8. NeuroLearn Generation Pipeline

```
AI Study Plan
      │
      ▼
Topics Generated
      │
      ▼
Sessions Generated
      │
      ▼
Subsession Topics Generated
      │
      ▼
For each Subsession:
      │
      ▼
Generate Learning Unit
      │
      ├── Subsession Content
      ├── Quiz
      └── Quiz Explanation
```

---

# 9. Benefits for NeuroLearn

Your architecture now provides:

* better **learning reinforcement**
* smaller **AI generation tasks**
* higher **content accuracy**
* easier **error correction**
* better **engagement**

This design is very similar to **Duolingo-style learning loops**.
