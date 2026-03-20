import os
import re
import requests
import logging
from dotenv import load_dotenv

logger = logging.getLogger('neurolearn')

# First, load the primary .env for standard configurations
load_dotenv()

# Check for a specific secrets file path in the environment
secrets_path = os.getenv("SECRETS_FILE")
if secrets_path and os.path.exists(secrets_path):
    # Load from the external secrets file
    load_dotenv(dotenv_path=secrets_path, override=True)

class OpenRouterEngine:
    def __init__(self):
        # Try the user's specific key name first, then fallback to standard
        self.api_key = os.getenv("OpenRouterAPIAccessKey") or os.getenv("OPENROUTER_API_KEY")
        
        # Additional cleanup for variable expansion if needed
        if self.api_key and self.api_key.startswith("${") and self.api_key.endswith("}"):
            var_name = self.api_key[2:-1]
            self.api_key = os.environ.get(var_name)
        
        if self.api_key:
            print(f"AI Engine: Key loaded successfully ({self.api_key[:8]}...)")
        else:
            print("AI Engine WARNING: No API key found!")
            
        self.url = "https://openrouter.ai/api/v1/chat/completions"

    def _get_headers(self):
        return {
            "Authorization": f"Bearer {self.api_key or ''}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://neurolearn.ai",
            "X-Title": "NeuroLearn AI",
        }

    def generate_response(self, prompt, model=None, require_json=False, **kwargs):
        import time
        if not self.api_key:
            return "Error: AI API Key not found. Please ensure OpenRouterAPIAccessKey or OPENROUTER_API_KEY is set."

        # Models provided by the user for rotation
        fallback_models = [
            # "nvidia/nemotron-3-nano-30b-a3b:free", # Primary
            "stepfun/step-3.5-flash:free",
            "arcee-ai/trinity-large-preview:free",
            "nvidia/nemotron-3-super-120b-a12b:free",
            "openrouter/hunter-alpha",
            "openrouter/healer-alpha"
        ]
        
        # Use provided model if any, otherwise start rotation
        models_to_try = [model] if model else fallback_models
        
        last_error = ""

        for current_model in models_to_try:
            payload = {
                "model": current_model,
                "messages": [
                    {"role": "system", "content": "You are NeuroLearn, a personalized AI tutor that explains concepts simply and adapts to learners."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": kwargs.get("max_tokens", 8192),
            }
            
            if require_json:
                payload["response_format"] = {"type": "json_object"}
                
            for key, value in kwargs.items():
                if key != "max_tokens":
                    payload[key] = value

            max_retries = 3 # 3 retries per model is plenty with rotation
            
            for attempt in range(max_retries):
                try:
                    if attempt > 0:
                        logger.info(f"[AI ENGINE] Retrying {current_model} (Attempt {attempt + 1}/{max_retries})...")
                        time.sleep(attempt * 5)

                    logger.info(f"[AI ENGINE] Trying model: {current_model}")
                    response = requests.post(self.url, headers=self._get_headers(), json=payload, timeout=60)
                    response.raise_for_status()
                    
                    data = response.json()
                    if not data.get('choices'):
                        last_error = f"No choices in response from {current_model}"
                        continue
                        
                    content = data['choices'][0].get('message', {}).get('content')
                    if content is None:
                        last_error = f"Null content from {current_model}"
                        continue
                        
                    if require_json:
                        import json
                        import re
                        try:
                            clean_json = content.strip()
                            # Extract JSON object ignoring conversational wrapper
                            start_idx = clean_json.find('{')
                            end_idx = clean_json.rfind('}')
                            if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
                                clean_json = clean_json[start_idx:end_idx+1]
                            else:
                                raise ValueError("No JSON object found in response string")
                                
                            # Remove trailing commas
                            clean_json = re.sub(r',\s*([\]}])', r'\1', clean_json)
                            
                            try:
                                parsed_data = json.loads(clean_json)
                            except json.JSONDecodeError:
                                # Attempt to repair if parsing fails (likely due to truncation)
                                repaired_json = self.repair_json(clean_json)
                                parsed_data = json.loads(repaired_json)
                                logger.info(f"[AI ENGINE] Successfully parsed JSON after auto-repair.")
                                
                            # Replace string content with parsed dict
                            content = parsed_data
                            logger.info(f"[AI ENGINE] SUCCESS with {current_model} (Valid JSON Object)")
                            logger.info(f"[AI ENGINE] RESPONSE CONTENT: {json.dumps(content, indent=2)}")
                        except Exception as parse_e:
                            raise ValueError(f"JSON Parse Error: {str(parse_e)}. Snippet: {content[:100]}")
                    else:
                        logger.info(f"[AI ENGINE] SUCCESS with {current_model} ({len(content)} chars)")
                        logger.info(f"[AI ENGINE] RESPONSE CONTENT: {content}")
                        
                    return content

                except Exception as e:
                    last_error = f"{current_model}: {str(e)}"
                    logger.warning(f"[AI ENGINE] Attempt {attempt + 1} failed for {current_model}: {str(e)}")
                    if response.status_code != 429: # If not rate limit, maybe try next model sooner?
                        pass 
            
            logger.error(f"[AI ENGINE] Model {current_model} exhausted all retries. Trying next fallback...")
        
        err_msg = f"All models failed. Last error: {last_error}"
        logger.error(f"[AI ENGINE] CRITICAL: {err_msg}")
        return err_msg

    def load_prompt(self, name, context):
        """Loads a prompt template from the prompts directory and formats it with context."""
        import string
        try:
            prompt_path = os.path.join(os.path.dirname(__file__), 'prompts', f"{name}.txt")
            with open(prompt_path, 'r', encoding='utf-8') as f:
                template_str = f.read()
            
            # Using string.Template to avoid issues with curly braces in JSON templates
            # Requires placeholders in .txt files to be $name, $topic, etc.
            # But since previous turn used {name}, I will replace them manually or use a regex
            # Actually, I will just escape potential JSON braces or use a simple replace for known keys
            result = template_str
            for key, value in context.items():
                result = result.replace(f"{{{key}}}", str(value))
            return result
        except Exception as e:
            logger.error(f"[AI ENGINE] Error loading prompt {name}: {str(e)}")
            return ""

    def repair_json(self, json_str):
        """Attempts to repair a truncated JSON string (object or array)."""
        if not json_str:
            return "{}"
            
        json_str = json_str.strip()
        
        # 1. Handle Unterminated Strings
        # Count unescaped double quotes to see if we are currently inside a string
        # Regex explanation: match quote NOT preceded by an odd number of backslashes
        # A simpler heuristic for Python:
        import re
        quotes = [m.start() for m in re.finditer(r'(?<!\\)"', json_str)]
        if len(quotes) % 2 != 0:
            json_str += '"'
            
        # 2. Check for trailing commas and remove them before closing brackets
        json_str = re.sub(r',\s*$', '', json_str)
            
        # 3. Balance braces and brackets
        brace_depth = json_str.count('{') - json_str.count('}')
        bracket_depth = json_str.count('[') - json_str.count(']')
        
        # If we have open arrays and objects, we usually need to close the deepest nested ones first
        # Heuristic: Just append necessary closers assuming standard nesting
        for _ in range(max(0, brace_depth)):
            json_str += ' }'
            
        for _ in range(max(0, bracket_depth)):
            json_str += ' ]'
            
        # It's possible the order of closing brackets vs braces needs to be specifically arranged
        # In a generic JSON, we'd need a stack parser, but this naive appending covers 90% of truncation cases
        # Let's use a simple stack parser to append the correct closing characters in reverse order
        stack = []
        in_string = False
        escape_next = False
        
        for char in json_str:
            if escape_next:
                escape_next = False
                continue
            
            if char == '\\':
                escape_next = True
                continue
                
            if char == '"':
                in_string = not in_string
                continue
                
            if not in_string:
                if char == '{':
                    stack.append('}')
                elif char == '[':
                    stack.append(']')
                elif char == '}':
                    if stack and stack[-1] == '}':
                        stack.pop()
                elif char == ']':
                    if stack and stack[-1] == ']':
                        stack.pop()
                        
        # The stack now contains the EXACT characters needed to close the JSON elegantly
        missing_closers = "".join(reversed(stack))
        
        # We replace the naive bracket appending above with the stack-based appending
        return json_str + missing_closers

# Singleton instance
ai_engine = OpenRouterEngine()
