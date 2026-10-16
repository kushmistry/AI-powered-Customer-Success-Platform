import pytest
from app.services.ai_service import AIService


@pytest.mark.asyncio
async def test_ai_fallback_positive_sentiment():
    service = AIService()
    notes = (
        "Sarah from Cyberdyne is extremely happy with the product performance and uptime. "
        "They want to renew for 2 years and add 25 seats. "
        "- Follow up with new pricing sheet by Friday. "
        "- Schedule executive check-in for next quarter."
    )
    result = await service.generate_insight(notes, subject="Annual Review")

    assert result is not None
    assert result["sentiment"] == "positive"
    assert len(result["action_items"]) >= 1
    assert "Annual Review" in result["summary"] or "Cyberdyne" in result["summary"]


@pytest.mark.asyncio
async def test_ai_fallback_negative_sentiment_and_risks():
    service = AIService()
    notes = (
        "Wayne Enterprises reported major downtime and blocker issues with API rate limits. "
        "Customer is angry and mentioned risk of churn if SLA breach continues. "
        "- Action: Engineering must fix webhook queue."
    )
    result = await service.generate_insight(notes, subject="Urgent Escalation")

    assert result is not None
    assert result["sentiment"] == "negative"
    assert len(result["key_risks"]) >= 1


def test_ai_json_parser_clean_markdown():
    service = AIService()
    raw_markdown = """```json
{
  "summary": "Meeting went smoothly with positive feedback.",
  "sentiment": "positive",
  "action_items": ["Send updated invoice"],
  "key_risks": []
}
```"""
    parsed = service._parse_json_response(raw_markdown)
    assert parsed is not None
    assert parsed["summary"] == "Meeting went smoothly with positive feedback."
    assert parsed["sentiment"] == "positive"
    assert parsed["action_items"] == ["Send updated invoice"]

