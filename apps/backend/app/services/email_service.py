import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional
from app.core.config import settings

logger = logging.getLogger("e2m.email")


class EmailService:
    """Email dispatch service supporting SMTP with asynchronous background execution and graceful fallback."""

    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USER
        self.password = settings.SMTP_PASSWORD
        self.tls = settings.SMTP_TLS
        self.from_email = settings.EMAILS_FROM_EMAIL
        self.from_name = settings.EMAILS_FROM_NAME
        self.enabled = settings.EMAIL_NOTIFICATIONS_ENABLED

    def _is_smtp_configured(self) -> bool:
        return bool(self.host and self.user and self.password)

    def send_email_sync(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send an email via configured SMTP server or log if running in development mode."""
        if not self.enabled:
            logger.info(f"[EMAIL DISABLED] Skipping email to {to_email}: {subject}")
            return True

        if not self._is_smtp_configured():
            logger.info(
                f"[SIMULATED EMAIL DISPATCH]\n"
                f"To: {to_email}\n"
                f"Subject: {subject}\n"
                f"From: {self.from_name} <{self.from_email}>\n"
                f"Content Summary: {text_content or html_content[:200]}...\n"
                f"(Configure SMTP_USER & SMTP_PASSWORD in .env to deliver real emails)"
            )
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email

            if text_content:
                msg.attach(MIMEText(text_content, "plain"))
            if html_content:
                msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                if self.tls:
                    server.starttls()
                server.login(self.user, self.password)
                server.sendmail(self.from_email, [to_email], msg.as_string())

            logger.info(f"Successfully delivered email to {to_email}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Failed to deliver email to {to_email} via SMTP: {e}")
            return False

    def send_welcome_email(self, to_email: str, full_name: str, role: str) -> bool:
        """Send welcome message upon registration."""
        subject = f"Welcome to {settings.APP_NAME}, {full_name}!"
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
            <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 20px; text-align: center; border-radius: 8px 8px 0 0; color: white;">
                <h1 style="margin: 0; font-size: 20px;">Customer Success Intelligence</h1>
            </div>
            <div style="padding: 20px; color: #334155;">
                <h2>Welcome aboard, {full_name}!</h2>
                <p>Your account on <strong>{settings.APP_NAME}</strong> has been created with role: <strong>{role.upper()}</strong>.</p>
                <p>You can now manage customer relationships, log interactions, and review AI-generated meeting intelligence.</p>
                <div style="margin-top: 25px;">
                    <a href="http://localhost:3000" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Open Platform</a>
                </div>
            </div>
        </div>
        """
        text = f"Welcome to {settings.APP_NAME}, {full_name}! Your account with role {role} is now active."
        return self.send_email_sync(to_email, subject, html, text)

    def send_interaction_summary_email(
        self,
        to_email: str,
        company: str,
        subject_line: str,
        summary: str,
        sentiment: str,
        action_items: List[str],
    ) -> bool:
        """Send meeting summary & action items to customer success manager or client."""
        subject = f"[Meeting Insight] {company} — {subject_line}"
        actions_html = "".join([f"<li style='margin-bottom: 6px;'>{item}</li>" for item in action_items]) or "<li>No specific action items recorded.</li>"
        
        sentiment_color = "#10b981" if sentiment == "positive" else "#f59e0b" if sentiment == "neutral" else "#ef4444"

        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
                <span style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Customer Success Intelligence</span>
                <h2 style="margin: 5px 0; color: #0f172a;">{company}</h2>
                <p style="margin: 0; color: #64748b; font-size: 14px;">Subject: {subject_line}</p>
            </div>

            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="font-size: 13px; color: #475569; text-transform: uppercase;">AI Executive Summary</strong>
                    <span style="background-color: {sentiment_color}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: capitalize;">{sentiment} Sentiment</span>
                </div>
                <p style="margin: 0; line-height: 1.5; color: #334155; font-size: 13px;">{summary}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">Action Items & Follow-ups</h4>
                <ul style="padding-left: 20px; margin: 0; color: #334155; font-size: 13px;">
                    {actions_html}
                </ul>
            </div>
        </div>
        """
        text = f"Meeting Insight for {company}: {subject_line}\n\nSummary:\n{summary}\n\nAction items:\n" + "\n".join(action_items)
        return self.send_email_sync(to_email, subject, html, text)

    def send_risk_alert_email(
        self,
        to_email: str,
        company: str,
        subject_line: str,
        key_risks: List[str],
        sentiment: str,
    ) -> bool:
        """Send urgent blocker / churn risk alert when AI flags high risk or negative sentiment."""
        subject = f"⚠️ [Risk Alert] Negative Sentiment / Blocker Detected for {company}"
        risks_html = "".join([f"<li style='margin-bottom: 6px; color: #b91c1c;'>{r}</li>" for r in key_risks]) or "<li>High churn risk indicated in customer discussion.</li>"

        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #ef4444; border-radius: 12px; background-color: #fef2f2;">
            <div style="margin-bottom: 15px;">
                <h2 style="color: #991b1b; margin: 0;">⚠️ Customer Success Risk Alert</h2>
                <p style="color: #7f1d1d; margin: 5px 0 0 0; font-size: 14px;">Negative sentiment or operational blockers were flagged for <strong>{company}</strong>.</p>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #fecaca; margin-bottom: 15px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">Interaction: <strong>{subject_line}</strong></p>
                <h4 style="margin: 0 0 8px 0; color: #991b1b; font-size: 13px;">Identified Risks & Blockers:</h4>
                <ul style="padding-left: 20px; margin: 0; font-size: 13px;">
                    {risks_html}
                </ul>
            </div>

            <p style="font-size: 12px; color: #7f1d1d; margin: 0;">Please review this customer profile in the dashboard immediately to coordinate outreach.</p>
        </div>
        """
        text = f"⚠️ Risk Alert for {company}!\nSubject: {subject_line}\nRisks:\n" + "\n".join(key_risks)
        return self.send_email_sync(to_email, subject, html, text)


email_service = EmailService()

