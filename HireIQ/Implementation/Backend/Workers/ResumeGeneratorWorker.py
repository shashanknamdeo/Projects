import os
import sys
import json
import time
import pdfkit
import pyperclip

from jinja2 import Environment, FileSystemLoader

from pypdf import PdfReader, PdfWriter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

print("BASE_DIR =", BASE_DIR)

# from GenAI import gen_ai_client

# -------------------------------------------------------------------------------------------------

RESUME_PATH = "C:/Users/shash/Downloads/Resume.pdf"

# -------------------------------------------------------------------------------------------------

def read_multiline_input(end_word="END"):
    print(f"\n\nEnter your prompt (type '{end_word}' on a new line to finish):")
    lines = []
    # 
    while True:
        line = input()
        if line.strip() == end_word:
            break
        lines.append(line)
    # 
    return "\n".join(lines)


def generateResumeJSON(prompt):
    try:
        client = gen_ai_client()
        jd = read_multiline_input()
        request_prompt = prompt + jd
        print(request_prompt)
        response = client.generate(request_prompt)
        print(response)
        # client.close()
        return response
    # 
    except Exception as e:
        print('Exception - generateResumeJSON', e)


def extract_message(response: str) -> dict:
    parsed = json.loads(response)          # outer JSON
    message_str = parsed["message"]        # string
    resume_dict = json.loads(message_str)  # inner JSON
    return resume_dict


# Load resume JSON
# with open("ResumeOutput.json", "r", encoding="utf-8") as f:
#     resume_data = json.load(f)

# Load HTML template

def generateResumePDF(resume_json):
    env = Environment(
        loader=FileSystemLoader("."),
        autoescape=True
    )
    template = env.get_template("ResumeTemplate.html")

    # Render HTML
    rendered_html = template.render(**resume_json)

    # Save HTML (debug-friendly)
    with open("resume_rendered.html", "w", encoding="utf-8") as f:
        f.write(rendered_html)

    # PDF configuration
    options = {
        "encoding": "UTF-8",
        "page-size": "A4",
        "margin-top": "10mm",
        "margin-bottom": "10mm",
        "margin-left": "10mm",
        "margin-right": "10mm",
    }

    # Generate PDF
    pdfkit.from_file(
        "resume_rendered.html",
        RESUME_PATH,
        options=options
    )

    print("✅ Resume PDF generated successfully")



def trim_highlights_to_fit(resume_json):
    """
    """
    projects = resume_json.get("experience", {}).get("projects", [])
    # 
    for i in range(0, len(projects)):
        highlights = projects[2-i].get("highlights", [])
        # 
        # Only trim if more than 3 highlights
        if len(highlights) > 3:
            print(f'triming Project : {projects[2-i]["name"]}')
            projects[2-i]["highlights"] = highlights[:3]
            # 
            generateResumePDF(resume_json)
            time.sleep(2)
            reader = PdfReader(RESUME_PATH)
            if len(reader.pages) == 1:
                return True
    # 
    print("Exception : All Project highlights Striped to 3, Still Resume pages > 1")
    return False


def main(prompt):
    """
    """
    while True:
        print('\n\n\n\n\n\n\n----------------------------------------------------------------------------------------------------')
        jd = read_multiline_input()
        temp_prompt = prompt + jd
        print(temp_prompt)
        pyperclip.copy(temp_prompt)
        # 
        response = read_multiline_input()
        print(response)
        print("Resume Type : ", type(response))
        print("Response Length : ", len(response))
        resume_json = json.loads(response)
        print(type(resume_json))
        generateResumePDF(resume_json)
        # 
        try:
            reader = PdfReader(RESUME_PATH)
            if len(reader.pages) > 1:
                print(f"[ResumeGeneratorWorker] Truncating {len(reader.pages)} pages to 1 page.")
                response = trim_highlights_to_fit(resume_json=resume_json)
                if response == True:
                    print(f"[ResumeGeneratorWorker] Truncated Resume to 1 page.")
            # 
            else:
                print(f"[ResumeGeneratorWorker] Resume has 1 page.")
        # 
        except Exception as e:
            print(f"[ResumeGeneratorWorker] Failed to truncate PDF: {e}")








prompt = """
Task : Tweak my resume to create a new resume json based on JD 
---
Output:

STRICT OUTPUT RULES:
- Output ONLY valid JSON
- DO NOT include explanations, text, logs, or markdown
- DO NOT repeat the JSON
- DO NOT include prefixes like "Here is your JSON"
- DO NOT include Python types like <class 'str'>
- Ensure JSON is parsable using json.loads()
- Remove trailing commas
- Ensure all quotes are double quotes
- Ensure proper escaping if needed
- Keep output in a SINGLE JSON object only


STRICT CONSTRAINTS:
- TOTAL CHARACTER IN RESPONSE: 2800 - 3100 character
- Profile Summary length: 350–450 characters
- Skills section total length: 650-750 characters
- Skills must contain EXACTLY 5 categories
- Each skills category must contain at least 5-7 skills
- EXPERIENCE Section: Total 2100-2300 characters
- Project highlights: 3-4 highlights per project
- Use ONLY these project:
  - NeuroLearn – AI-Based Personalized Learning Platform
  - HireIQ – AI-Driven Job Application Automation Platform
  - IntelliTrade – Automated Trading & Analytics System


Output Format :
{"profile_summary": "","skills": {"Skill_Types (First alphabet capital)" : ["Skill_1", "Skill_2"]},"experience": {"role": "Software Engineer – Project Experience","type": "Independent & Academic Projects","location": "Bhopal, India","duration": "2022 – Present","projects": [{"name": "NeuroLearn – AI-Based Personalized Learning Platform","technologies": [],"highlights": []},{"name": "HireIQ – AI-Driven Job Application Automation Platform","technologies": [],"highlights": []},{"name": "IntelliTrade – Automated Trading & Analytics System","technologies": [],"highlights": []},]}}

---
Profile Summary:
Entry-level Software Engineer and AI/ML undergraduate with hands-on experience in Python, Django, AWS, and Prompt Engineering for AI-driven applications. Skilled in building scalable backend systems, REST APIs, automation pipelines, and cloud-native solutions across EdTech, FinTech, and AI/ML domains. Experienced in PostgreSQL, authentication workflows, API design, and deploying production-grade systems on AWS.

---

Skills:
- Python, Django, RESTful APIs, API Integration, Backend Architecture, Automation, Selenium, React Native, React, HTML, CSS, JavaScript, TypeScript
- AWS EC2, AWS RDS, AWS S3, AWS IAM, AWS Elastic Beanstalk, AWS CloudWatch, Docker, Cloud Deployment, Environment Configuration, Scalable Systems
- PostgreSQL, MongoDB, SQL, Data Modeling, Query Optimization
- AI/ML Concepts, Generative AI (Gemini), Prompt Engineering, AI-driven automation, Data Analysis, Algorithmic Logic
- Git, GitHub, Linux, Logging, Error Handling, Unit Testing, CI/CD Basics, Fault Tolerance, Agile Methodologies, Debugging

---

Experience:
Role: Software Engineer – Project Experience  
Type: Independent & Academic Projects  
Location: Bhopal, India  
Duration: 2022 – Present  

Projects:

1. NeuroLearn – AI-Based Personalized Learning Platform  
Technologies: Generative AI , Python, Django, DRF, React, Prompt Engineering, AWS, PostgreSQL  
Highlights:
- Architected an AI-driven platform delivering personalized study plans based on learner goals and performance.
- Applied AI/ML techniques to dynamically adapt learning paths and improve engagement.
- Built a scalable Django backend with PostgreSQL, including validation, optimization, and secure APIs.
- Developed RESTful APIs and a React-based frontend for seamless user experience.

2. HireIQ – AI-Driven Job Application Automation Platform  
Technologies: Python, Django, Selenium, Generative AI , Prompt Engineering, PostgreSQL, AWS RDS, AWS Elastic Beanstalk  
Highlights:
- Built an end-to-end job automation pipeline for job discovery, analysis, and application, reducing manual effort by 70–80%.
- Implemented a Python–Django multi-worker architecture for scraping, resume matching, and apply-flow detection using Generative AI and prompt engineering for JD scoring.
- Designed secure RESTful APIs with authentication, authorization, logging, retries, and fault-tolerant workflows.
- Deployed on AWS with PostgreSQL-backed persistence, ensuring scalability and restart-safe operations.

3. IntelliTrade – Automated Trading & Analytics System  
Technologies: Python, Django, AI/ML, Data Analysis, Kotak Securities API, Zerodha API, AWS  
Highlights:
- Developed an AI-powered algorithmic trading platform supporting equities and derivatives trading.
- Integrated Kotak Securities API for trade execution and Zerodha API for real-time market data ingestion.
- Built Django-based RESTful services for live data processing, strategy execution, and performance tracking.
- Deployed on AWS for scalable, low-latency processing and secure data management.

---

and this is the JD 


"""


main(prompt)


# Use the RTCIFA Prompt Engineering framework to generate a **New_Resume_JSON** by intelligently tweaking my existing resume JSON based on the JD provided. Follow these guidelines:

# 1. **Role Alignment:** Highlight skills, projects, and experience that match the JD’s required skills, emphasizing **AI, Python, and .NET** wherever applicable.
# 2. **Profile Summary Enhancement:** Tailor the summary to reflect alignment with the position (Developer Intern / Fresher), including keywords like **AI, Python, .NET, Angular, and full-stack development**.
# 3. **Skills Mapping:** Prioritize JD-relevant skills in the JSON, keep other strong technical skills but categorize them appropriately under **Development, Cloud_DevOps, Databases, AI_ML_Analytics, Tools_Practices**.
# 4. **Experience Tweaks:** Update project highlights and technologies to emphasize **Python, AI, .NET familiarity**, and cloud deployment skills while retaining achievements.
# 5. **Certifications & Education:** Keep all existing certifications, highlighting those relevant to **AI, Python, .NET, or cloud technologies**.
# 6. **JSON Output:**  
#    - Only output JSON.  
#    - Follow the same structure as the input JSON.  
#    - Ensure **ATS-friendly formatting** with clear tech keywords.  
#    - All fields are preserved but adjusted for JD relevance.  
