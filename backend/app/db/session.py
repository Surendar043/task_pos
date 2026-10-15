from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models import ALL_DOCUMENTS


async def init_db() -> None:
    client = AsyncIOMotorClient(settings.mongo_uri)
    database = client[settings.mongo_db]
    await init_beanie(database=database, document_models=ALL_DOCUMENTS)

    # Email is optional (sign-up does not collect it). Keep uniqueness for provided
    # emails while allowing any number of users to have a missing/null email.
    users = database["users"]
    for name in list((await users.index_information()).keys()):
        if name.startswith("email_"):
            try:
                await users.drop_index(name)
            except Exception:  # noqa: BLE001
                pass
    await users.create_index(
        "email",
        unique=True,
        partialFilterExpression={"email": {"$type": "string"}},
    )
