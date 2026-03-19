**PROJECT TITLE:**
Build “Select & Send” Chrome Extension for JD → Django Resume Generator

---

**OBJECTIVE:**
Create a Chrome Extension (Manifest V3) that allows users to select text (Job Description) on any webpage, right-click, and send the selected text to a Python Django backend API, which processes it for resume generation.

---

**TECH STACK:**

* Frontend: Chrome Extension (Manifest V3)
* Backend: Python (Django REST or standard Django view)
* Communication: REST API (JSON over HTTP)

---

**FUNCTIONAL REQUIREMENTS:**

1. **Context Menu Integration**

   * Add a right-click option: “Send to Resume Generator”
   * Should appear only when text is selected

2. **Text Capture**

   * Capture selected text (`selectionText`) from the browser

3. **API Communication**

   * Send POST request to:

     ```
     http://127.0.0.1:8000/api/receive-jd/
     ```
   * JSON payload:

     ```json
     {
       "jd_text": "<selected text>"
     }
     ```

4. **Response Handling**

   * Log response in console
   * Show success/failure notification in browser

5. **Permissions**

   * Use required Chrome permissions:

     * `contextMenus`
     * `scripting`
     * `notifications` (optional)
   * Allow API host in `host_permissions`

---

**BACKEND REQUIREMENTS (DJANGO):**

1. Create API endpoint:

   ```
   POST /api/receive-jd/
   ```

2. Accept JSON body:

   ```json
   {
     "jd_text": "string"
   }
   ```

3. Return JSON response:

   ```json
   {
     "status": "success",
     "message": "JD received",
     "length": <int>
   }
   ```

4. Disable CSRF for this endpoint OR handle token properly

5. Enable CORS for local development

---

**EXTENSION FILE STRUCTURE:**

```
extension/
│── manifest.json
│── background.js
│── icons/ (optional)
```

---

**DELIVERABLES:**

1. Fully working Chrome Extension code:

   * manifest.json (Manifest V3 compliant)
   * background.js (service worker)

2. Django backend code:

   * views.py
   * urls.py
   * CORS setup instructions

3. Setup Instructions:

   * How to load extension in Chrome (developer mode)
   * How to run Django server
   * How to test end-to-end

---

**OPTIONAL ENHANCEMENTS (if time permits):**

* Show browser notification on success/failure
* Open a dashboard page after sending JD
* Handle empty selection gracefully
* Add error handling for API failure
* Add loading state (if feasible)

---

**CONSTRAINTS:**

* Must use Manifest V3 (no deprecated APIs)
* Must work on any website (not domain-specific)
* Keep code clean, modular, and production-ready
* Avoid unnecessary libraries

---

**EXPECTED OUTPUT FORMAT:**

* Provide complete code files with clear filenames
* Include comments explaining key parts
* Include step-by-step setup instructions
* Ensure code is directly runnable without major modifications

---

**GOAL:**
Deliver a working MVP that eliminates manual copy-paste of job descriptions and enables seamless integration with a Django-based resume generator system.
