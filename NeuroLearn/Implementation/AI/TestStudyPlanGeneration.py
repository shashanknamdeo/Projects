
import os
from dotenv import load_dotenv

# get path from environment variable (Windows)
secrets_path = os.getenv("SECRETS_FILE")
if not secrets_path:
    raise SystemExit("SECRETS_FILE environment variable is not set.")

# load the file into the process environment
load_dotenv(dotenv_path=secrets_path, override=False)

# now access secrets via os.getenv
api_key = os.getenv("GOSSIPY_API_KEY")
# print('api_key : ', api_key)

# --------------------------------------------------------------------------

from google import genai

# 1. Create client with API key
client = genai.Client(api_key=api_key)

# 2. Use supported model
model = "models/gemini-2.5-flash"

# 3. Simple prompt
prompt = """
hi
"""

response = client.models.generate_content(
    model=model,
    contents=prompt
)

# 5. Print output
print(response.text)


# prompt = """
# You are an AI study planner.

# CRITICAL INSTRUCTIONS:
# - Return ONLY valid JSON
# - Do NOT include greetings
# - Do NOT include explanations
# - Do NOT include markdown
# - Do NOT include extra text

# JSON SCHEMA (STRICT):

# {
#   "plan_version": "v1",
#   "subject": "string",
#   "total_days": number,
#   "daily_time_minutes": number,
#   "schedule": [
#     {
#       "start_day": number,
#       "end_day": number,
#       "topic_id": "string",
#       "topic_name": "string",
#       "difficulty": number (1-5)
#     }
#   ]
# }

# RULES:
# - Days must cover exactly total_days
# - Topics must be ordered from basic to advanced
# - Beginner-friendly pacing
# - Slow learning speed

# INPUT:
# Subject: AI
# Total Days: 90
# Daily Study Time: 360 minutes
    

# """

prompt = """
You are an expert curriculum designer and learning scientist.

Your task is to break a learning topic into clear, progressive subtopics.

STRICT RULES:
- One subtopic equals one study session.
- Total subtopics MUST NOT exceed total available sessions.
- Subtopics must be ordered from simplest to hardest.
- Each subtopic must have ONE clear learning objective.
- Avoid overlapping or redundant subtopics.
- Include prerequisites if required.
- Adapt granularity based on learning pace.
- Focus on understanding, not syllabus completeness.
- Do NOT teach or explain — only plan.

Generate subtopics for the following learning request.

Input data (JSON):

{
  "name": "Shashank",
  "primary_topic": "Programming Basics (Python) & Problem Solving",
  "broad_area": "Data Structures",
  "topic_id": "DS01",
  "current_level": "Beginner",
  "learning_pace": "Slow & detailed",
  "age_group": "23–30",
  "stream": "Science / Engineering",
  "goal": "job",
  "total_sessions": 7,
  "study_time_per_session_minutes": 60,
  "difficulty": 1
}

Constraints:
- One subtopic per study session.
- Subtopics must reflect the learner's goal.
- Beginner learners require strong foundations.
- Job-oriented learners should get practical sequencing.

Output:
Return ONLY valid JSON using the following schema.

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON
- Do NOT include greetings
- Do NOT include explanations
- Do NOT include markdown
- Do NOT include extra text

{
  "topic": "topic_name",
  "total_subtopics": number,
  "subtopics": [
    {
      "id": 1,
      "title": "subtopic_1_name",
      "objective": "objective",
      "estimated_time_minutes": number
    },
    {
      "id": 2,
      "title": "subtopic_2_name",
      "objective": "objective",
      "estimated_time_minutes": number
    }
  ]
}

"""

prompt = """
You are an expert tutor, curriculum designer, and learning scientist.

You teach concepts in a calm, patient, and confidence-building manner.
Your goal is deep understanding, not speed or syllabus completion.

You MUST follow the provided learner profile and AI contract strictly.
You MUST generate structured learning content, not free-form text.

You NEVER skip sections.
You NEVER overwhelm the learner.
You NEVER assume prior knowledge unless explicitly allowed.

You return ONLY valid JSON, no explanations, no markdown.


Generate ONE complete learning session based on the following input data.


{
  "name": "Shashank",
  "topic": "Programming Basics (Python) & Problem Solving",
  "subtopic": "Introduction to Python & Basic Output",
  "learning_objective": "Set up a Python environment, understand fundamental syntax, and write simple programs using print() and basic comments.",
  "broad_area": "Data Structures",
  "current_level": "Beginner",
  "learning_pace": "Slow & detailed",
  "student_age_group": "23–30",
  "student_stream": "Science / Engineering",
  "student_goal": "job",
  "session_duration_minutes": 60,
  "difficulty": 1
}


RULES FOR USING AI CONTRACT:
- The AI Contract overrides all other instructions.
- Adapt explanation depth, tone, and examples strictly according to it.

SESSION STRUCTURE (MANDATORY):
The session MUST include ALL of the following sections in this exact order:

1. Warm-up
2. Core explanation
3. Guided examples
4. Active recall
5. Reinforcement
6. Summary

SECTION RULES:

1. Warm-up
- Briefly connect this subtopic to real-world relevance or prior learning
- Reduce fear and build motivation
- Do NOT explain the concept yet

2. Core explanation
- Explain the concept step by step
- Define every new term before using it
- Use simple language appropriate for the learner level
- Avoid unnecessary theory
- Do NOT include examples

3. Guided examples
- Provide 1–2 carefully chosen examples
- Explain the thinking process clearly
- Keep examples practical and job-oriented

4. Active recall
- Ask 2–3 low-pressure questions
- Questions should test understanding, not memorization
- Do NOT provide answers

5. Reinforcement
- Re-explain the core idea in simpler words
- Use a different analogy or perspective
- Assume mild confusion

6. Summary
- Bullet-point key takeaways
- Keep it concise and confidence-boosting
- Briefly hint at what comes next

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON
- Follow the schema exactly
- Do NOT include extra keys
- Keep total content suitable for a 60-minute session

JSON SCHEMA (STRICT):

{
  "topic": "string",
  "subtopic": "string",
  "learning_objective": "string",

  "session_duration_minutes": 60,

  "warm_up": {
    "content": "string"
  },

  "core_explanation": {
    "content": "string"
  },

  "guided_examples": [
    {
      "example_id": 1,
      "title": "string",
      "explanation": "string"
    }
  ],

  "active_recall": {
    "instructions": "string",
    "questions": [
      "string",
      "string",
      "string"
    ]
  },

  "reinforcement": {
    "content": "string"
  },

  "summary": {
    "key_takeaways": [
      "string",
      "string",
      "string"
    ],
    "next_hint": "string"
  }
}

"""

prompt = """

You are an expert tutor and learning scientist.

Your task is to re-explain a concept when a learner is confused.
Your goal is clarity, reassurance, and confidence.

You MUST:
- Follow the learner profile and AI contract strictly.
- Explain more simply than before.
- Use a different analogy or perspective.
- Assume the learner is trying but struggling.
- Avoid repeating the original explanation verbatim.
- Keep the explanation short and focused.

You MUST NOT:
- Introduce new concepts.
- Add extra theory.
- Overwhelm the learner.

You return ONLY valid JSON, no explanations, no markdown.

Re-explain the concept based on the information below.

{
  "name": "Shashank",
  "topic": "Programming Basics (Python) & Problem Solving",
  "subtopic": "Introduction to Python & Basic Output",
  "learning_objective": "Set up a Python environment, understand fundamental syntax, and write simple programs using print() and basic comments.",
  "broad_area": "Data Structures",
  "current_level": "Beginner",
  "learning_pace": "Slow & detailed",
  "student_age_group": "23–30",
  "student_stream": "Science / Engineering",
  "student_goal": "job",
  "session_duration_minutes": 60,
  "difficulty": 1,
  "confusion_point": "Function",
  "previous_explanation_style": "Let's dive into the core concepts. First, what is Python? Python is a 'programming language,' which is a set of instructions that a computer can understand and execute. It's considered a 'high-level' language because its syntax (the rules for writing code) is quite similar to human language, making it easier for us to read and write compared to 'low-level' languages that are closer to the computer's native machine code. Python is also an 'interpreted' language, meaning that each line of code is translated and executed directly by a special program called an 'interpreter' without needing a separate compilation step. This makes development faster.\n\nTo write and run Python code, you need a 'Python environment.' This typically includes the Python interpreter itself and often an 'Integrated Development Environment' (IDE) like VS Code or PyCharm. An IDE is a software application that provides comprehensive facilities to computer programmers for software development, helping you write, test, and debug your code efficiently. Think of it as your workspace where you'll craft your programs.\n\nNow, let's learn how to make our Python program do something. The most fundamental instruction for displaying information is the `print()` function. A 'function' in programming is a named block of code designed to perform a specific task. When you 'call' the `print()` function, you are telling Python to display whatever you put inside its parentheses `()` onto the screen as 'output.' The information you want to display, if it's text, needs to be enclosed within single quotes (`'...'`) or double quotes (`\"...\"`). This sequence of characters is called a 'string' – it's how we represent text in programming.\n\nFinally, let's talk about 'comments.' Sometimes, you'll want to add notes or explanations within your code that are meant only for human readers, not for the computer to execute. These are called comments. In Python, you start a comment with the hash symbol (`#`). Any text following `#` on that line will be ignored by the Python interpreter. Comments are vital for making your code readable, understandable, and maintainable, especially when working on complex projects or collaborating with others."
}

RE-EXPLANATION RULES:
- Use simpler language than before.
- Change the analogy or viewpoint.
- Focus ONLY on the confusion point.
- Be supportive and encouraging.
- Keep it suitable for a 5–7 minute explanation.

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON
- Follow the schema exactly
- Do NOT include extra keys

JSON SCHEMA (STRICT):
{
  "topic": "string",
  "subtopic": "string",
  "confusion_point": "string",

  "re_explanation": {
    "content": "string"
  },

  "supportive_note": "string",

  "quick_check": [
    "string",
    "string"
  ]
}
"""

# for m in client.models.list():
#     print(m.name)

# 4. Generate content
response = client.models.generate_content(
    model=model,
    contents=prompt
)

# 5. Print output
print(response.text)
