import asyncio
import logging
from datetime import datetime, timezone, timedelta
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.customer import Customer
from app.models.interaction import Interaction
from app.models.insight import AIInsight
from app.repositories.user_repo import UserRepository
from app.repositories.customer_repo import CustomerRepository
from app.repositories.interaction_repo import InteractionRepository
from app.repositories.insight_repo import InsightRepository

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


async def seed():
    logger.info("Initializing database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        user_repo = UserRepository(session)
        customer_repo = CustomerRepository(session)
        interaction_repo = InteractionRepository(session)
        insight_repo = InsightRepository(session)

        # 1. Seed Users
        admin = await user_repo.get_by_email("admin@e2m.com")
        if not admin:
            admin = await user_repo.create({
                "email": "admin@e2m.com",
                "full_name": "Alice Administrator",
                "password_hash": get_password_hash("Admin123!"),
                "role": "admin",
            })
            logger.info("Created Admin user: admin@e2m.com")

        manager = await user_repo.get_by_email("manager@e2m.com")
        if not manager:
            manager = await user_repo.create({
                "email": "manager@e2m.com",
                "full_name": "Bob Manager",
                "password_hash": get_password_hash("Manager123!"),
                "role": "manager",
            })
            logger.info("Created Manager user: manager@e2m.com")

        viewer = await user_repo.get_by_email("viewer@e2m.com")
        if not viewer:
            viewer = await user_repo.create({
                "email": "viewer@e2m.com",
                "full_name": "Charlie Viewer",
                "password_hash": get_password_hash("Viewer123!"),
                "role": "viewer",
            })
            logger.info("Created Viewer user: viewer@e2m.com")

        # 2. Seed Customers
        customers_data = [
            {
                "name": "Sarah Connor",
                "email": "sarah@cyberdyne.io",
                "phone": "+1-555-0192",
                "company": "Cyberdyne Systems",
                "status": "active",
                "created_by": admin.id,
            },
            {
                "name": "Bruce Wayne",
                "email": "bruce@wayneenterprises.com",
                "phone": "+1-555-0144",
                "company": "Wayne Enterprises",
                "status": "active",
                "created_by": manager.id,
            },
            {
                "name": "Peter Parker",
                "email": "peter@dailybugle.net",
                "phone": "+1-555-0188",
                "company": "Daily Bugle Media",
                "status": "inactive",
                "created_by": manager.id,
            },
            {
                "name": "Tony Stark",
                "email": "tony@starkindustries.com",
                "phone": "+1-555-0100",
                "company": "Stark Industries",
                "status": "churned",
                "created_by": admin.id,
            },
            {
                "name": "Diana Prince",
                "email": "diana@themyscira.org",
                "phone": "+1-555-0177",
                "company": "Themyscira Cultural Corp",
                "status": "active",
                "created_by": manager.id,
            },
        ]

        created_customers = []
        for cdata in customers_data:
            existing = await customer_repo.get_filtered(search=cdata["email"], limit=1)
            if not existing:
                cust = await customer_repo.create(cdata)
                created_customers.append(cust)
                logger.info(f"Created customer: {cust.company}")
            else:
                created_customers.append(existing[0])

        # 3. Seed Interactions & Insights
        now = datetime.now(timezone.utc)
        interactions_data = [
            {
                "customer": created_customers[0],
                "type": "meeting",
                "subject": "Quarterly Business Review & Renewal Discussion",
                "notes": (
                    "Conducted QBR with Sarah and IT team. They are extremely pleased with the 99.98% platform uptime "
                    "over the past quarter. Sarah highlighted that their team saved 14 hours per week on reporting. "
                    "They expressed strong interest in renewing their enterprise contract for 2 years with an additional "
                    "25 user seats. Action items: Alice will send updated contract proposal by Friday. Sarah will confirm "
                    "budget approval by next Wednesday. Risk: Procurement department turnaround time can take up to 3 weeks."
                ),
                "date": now - timedelta(days=2),
                "sentiment": "positive",
                "summary": "Highly positive QBR with Cyberdyne. Team praised uptime and efficiency gains, expressing intent to renew for 2 years and add 25 seats.",
                "action_items": [
                    "Send updated 2-year contract proposal by Friday (Alice)",
                    "Confirm budget approval by next Wednesday (Sarah)",
                ],
                "key_risks": [
                    "Procurement department approval could cause 3-week delay",
                ],
            },
            {
                "customer": created_customers[1],
                "type": "call",
                "subject": "Technical Support Escalation - API Rate Limits",
                "notes": (
                    "Emergency call with Wayne Enterprises engineering lead. They reported unexpected 429 errors "
                    "during peak batch processing hours yesterday. Team was frustrated by the downtime on their automated pipeline. "
                    "We agreed to temporarily raise their tier burst limits while we optimize webhook listeners. "
                    "Action item: Bob will monitor throughput charts for 48 hours. Engineering must patch webhook queue by Tuesday. "
                    "Risk: Customer mentioned evaluating alternate vendors if stability issues persist."
                ),
                "date": now - timedelta(days=4),
                "sentiment": "negative",
                "summary": "Urgent escalation call regarding batch processing API rate limits. Customer is evaluating alternate vendors if pipeline reliability is not resolved immediately.",
                "action_items": [
                    "Monitor Wayne Enterprises throughput charts for 48 hours (Bob)",
                    "Deploy webhook queue optimization patch by Tuesday (Engineering)",
                ],
                "key_risks": [
                    "Customer evaluating competing platforms due to batch downtime",
                    "Immediate risk of churn if SLA breach recurs",
                ],
            },
            {
                "customer": created_customers[2],
                "type": "email",
                "subject": "Product Feedback & Feature Request",
                "notes": (
                    "Received email thread regarding Daily Bugle's request for custom PDF export formatting and SSO support. "
                    "Current account usage is steady but low. They are waiting for single-sign-on before rolling out to newsroom staff. "
                    "Action item: Share SSO roadmap timeline with Peter by Monday."
                ),
                "date": now - timedelta(days=7),
                "sentiment": "neutral",
                "summary": "Customer requested SSO support and custom PDF exports before expanding adoption to broader newsroom team.",
                "action_items": [
                    "Share SSO roadmap timeline with customer by Monday",
                ],
                "key_risks": [
                    "Adoption stalled until SSO feature is released",
                ],
            },
        ]

        for item in interactions_data:
            existing_inter = await interaction_repo.get_filtered(
                customer_id=item["customer"].id,
                type=item["type"],
                limit=1,
            )
            if not existing_inter:
                inter = await interaction_repo.create({
                    "customer_id": item["customer"].id,
                    "created_by": admin.id,
                    "type": item["type"],
                    "subject": item["subject"],
                    "notes": item["notes"],
                    "interaction_date": item["date"],
                })
                await insight_repo.create({
                    "interaction_id": inter.id,
                    "summary": item["summary"],
                    "sentiment": item["sentiment"],
                    "action_items": item["action_items"],
                    "key_risks": item["key_risks"],
                    "generated_at": now,
                })
                logger.info(f"Created interaction and insight for {item['customer'].company}")

    logger.info("Database seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed())

