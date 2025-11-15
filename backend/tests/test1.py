"""
Simple Arkiv SDK test script.
"""

from arkiv import Arkiv
from arkiv.account import NamedAccount
from web3 import HTTPProvider
from arkiv.types import QueryOptions, KEY, ATTRIBUTES
from dotenv import load_dotenv
import os

load_dotenv()

PRIVATE_KEY = os.getenv("ARKIV_PRIVATE_KEY")
ACCOUNT_ADDRESS = os.getenv("ARKIV_ACCOUNT_ADDRESS")

# 1) Connect your account to Arkiv
account = NamedAccount.from_private_key("demo", PRIVATE_KEY)
provider = HTTPProvider("https://mendoza.hoodi.arkiv.network/rpc")

with Arkiv(provider=provider, account=account) as client:
    # 2) Write one small record on-chain
    entity_key, _ = client.arkiv.create_entity(
        payload=b"Hello, Arkiv!",
        content_type="text/plain",
        attributes={"type": "hello"},
        expires_in = client.arkiv.to_seconds(days=1)
    )

    # 3) Read it back and display
    entity = client.arkiv.get_entity(entity_key)
    data = (entity.payload or b"").decode("utf-8", errors="ignore")

    print("Key:", entity_key)
    print("Data:", data)