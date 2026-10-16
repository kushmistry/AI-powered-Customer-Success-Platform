import asyncio
import json
import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """Service for generating structured meeting insights using Google Gemini API."""

    CANDIDATE_MODELS = [
        "gemini-3.5-flash",
        "gemini-3.8-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-lite-latest",
    ]

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self._genai = None
        self._models: Dict[str, Any] = {}
        self._initialized = False

    def _init_gemini(self):
        if self._initialized:
            return
        if self.api_key and self.api_key != "dummy_key_for_dev":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._genai = genai
                self._models = {}
                for model_name in self.CANDIDATE_MODELS:
                    try:
                        self._models[model_name] = genai.GenerativeModel(model_name)
                    except Exception as e:
                        logger.warning(f"Could not prepare Gemini model {model_name}: {e}")

                self._initialized = True
                logger.info(f"Initialized Google Gemini client with fallback chain: {list(self._models.keys())}")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Gemini client: {e}")
                self._models = {}
                self._initialized = True
        else:
            self._initialized = True

    async def generate_insight(self, notes: str, subject: str = "") -> Dict[str, Any]:
        """
        Analyze meeting notes and produce structured insights:
        - summary (str)
        - sentiment (positive, neutral, negative)
        - action_items (list[str])
        - key_risks (list[str])
        - is_ai_generated (bool)
        - model_used (str)
        """
        self._init_gemini()

        if self._models:
            try:
                prompt = (
                    "You are an expert AI Customer Success Analyst. Analyze the following meeting/interaction notes "
                    "and extract structured insights.\n\n"
                    f"Subject: {subject}\n"
                    f"Notes:\n{notes}\n\n"
                    "You MUST respond ONLY with valid JSON (no markdown formatting, no code blocks) matching this exact schema:\n"
                    "{\n"
                    '  "summary": "2-3 concise sentences summarizing the interaction, outcomes, and current status.",\n'
                    '  "sentiment": "positive" | "neutral" | "negative",\n'
                    '  "action_items": ["Action item 1 with owner if mentioned", "Action item 2"],\n'
                    '  "key_risks": ["Risk or blocker 1", "Risk or blocker 2"]\n'
                    "}"
                )

                call_res = await self._call_gemini_async(prompt)
                if call_res:
                    response_text, model_used = call_res
                    parsed = self._parse_json_response(response_text)
                    if parsed:
                        parsed["is_ai_generated"] = True
                        parsed["model_used"] = model_used
                        return parsed
            except Exception as e:
                logger.error(f"Gemini AI generation failed: {e}. Falling back to rule-based analysis.")

        # Fallback heuristic analysis if all API models fail or quota is exhausted
        fallback_res = self._generate_fallback(notes, subject)
        fallback_res["is_ai_generated"] = False
        fallback_res["model_used"] = "rule_based_fallback"
        return fallback_res

    async def _call_gemini_async(self, prompt: str) -> Optional[Tuple[str, str]]:
        """Try calling Gemini models in order of priority, falling back if rate limited (429), unavailable (404), or timed out."""
        if not self._models:
            return None

        for model_name in self.CANDIDATE_MODELS:
            model = self._models.get(model_name)
            if not model:
                continue
            try:
                logger.info(f"Generating AI insights with Gemini model: {model_name}")
                # Enforce a 3.5 second per-model timeout to avoid client cancellations
                resp = await asyncio.wait_for(model.generate_content_async(prompt), timeout=3.5)
                if resp and resp.text:
                    return resp.text, model_name
            except asyncio.TimeoutError:
                logger.warning(
                    f"Gemini model '{model_name}' timed out after 3.5s. Falling back to next available model..."
                )
                continue
            except Exception as e:
                err_str = str(e)
                # Check for 429 quota / rate limits, 404 deprecated models, or resource exhaustion
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
                    logger.warning(
                        f"Gemini model '{model_name}' quota/rate limit exceeded (429). Falling back to next available model..."
                    )
                elif "404" in err_str or "not found" in err_str.lower():
                    logger.warning(
                        f"Gemini model '{model_name}' unavailable (404). Falling back to next available model..."
                    )
                else:
                    logger.warning(
                        f"Gemini model '{model_name}' encountered an error: {e}. Falling back to next available model..."
                    )
                continue

        logger.warning("All Gemini candidate models failed or exhausted quota. Using rule-based fallback analysis.")
        return None

    def _parse_json_response(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract and validate JSON object from LLM response text."""
        try:
            cleaned = text.strip()
            # Strip markdown code fences if present
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            data = json.loads(cleaned)

            summary = str(data.get("summary", "")).strip()
            sentiment = str(data.get("sentiment", "neutral")).lower().strip()
            if sentiment not in ("positive", "neutral", "negative"):
                sentiment = "neutral"

            action_items = [str(item).strip() for item in data.get("action_items", []) if str(item).strip()]
            key_risks = [str(risk).strip() for risk in data.get("key_risks", []) if str(risk).strip()]

            if summary:
                return {
                    "summary": summary,
                    "sentiment": sentiment,
                    "action_items": action_items,
                    "key_risks": key_risks,
                }
        except Exception as e:
            logger.warning(f"Failed to parse LLM JSON response: {e}. Raw text was: {text[:200]}")
        return None

    def _generate_fallback(self, notes: str, subject: str = "") -> Dict[str, Any]:
        """Graceful fallback parser when LLM is unavailable or quota is exceeded."""
        notes_lower = notes.lower()

        # Sentiment heuristics
        pos_words = ["happy", "great", "excellent", "agree", "success", "renew", "upsell", "satisfied", "love", "good", "promising"]
        neg_words = ["unhappy", "delay", "issue", "blocker", "risk", "churn", "cancel", "frustrated", "bug", "escalate", "problem", "angry"]

        pos_count = sum(notes_lower.count(w) for w in pos_words)
        neg_count = sum(notes_lower.count(w) for w in neg_words)

        if pos_count > neg_count:
            sentiment = "positive"
        elif neg_count > pos_count:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        # Action items extraction heuristics
        action_items: List[str] = []
        for line in notes.split("\n"):
            line = line.strip()
            if not line:
                continue
            if re.match(r"^[-*•\d.]\s*(todo|action|follow[- ]up|send|schedule|review|fix|check|email)", line, re.IGNORECASE):
                action_items.append(re.sub(r"^[-*•\d.]\s*", "", line))
            elif any(trigger in line.lower() for trigger in ["will send", "needs to", "agreed to", "follow up on"]):
                action_items.append(line)

        if not action_items:
            action_items = [
                f"Follow up with customer regarding {subject or 'discussed topics'}",
                "Review feedback and log progress in CRM",
            ]

        # Key risks extraction heuristics
        key_risks: List[str] = []
        for line in notes.split("\n"):
            line = line.strip()
            if any(rw in line.lower() for rw in ["risk", "delay", "concern", "budget", "competitor", "blocker", "churn"]):
                key_risks.append(line)

        if not key_risks and sentiment == "negative":
            key_risks = ["Customer expressed dissatisfaction; immediate escalation recommended."]

        summary_preview = notes.strip().replace("\n", " ")
        if len(summary_preview) > 200:
            summary_preview = summary_preview[:197] + "..."
        summary = f"Meeting discussing '{subject or 'customer engagement'}': {summary_preview}"

        return {
            "summary": summary,
            "sentiment": sentiment,
            "action_items": action_items[:5],
            "key_risks": key_risks[:5],
        }


ai_service = AIService()

