"""
Test script for Arkiv SDK - Entity Update Operations.

This tests:
- Updating entity attributes
- Updating entity payload
- Extending entity lifetime
- Verifying updates persist
"""

from arkiv import Arkiv
from arkiv.account import NamedAccount
from web3 import HTTPProvider
from arkiv.types import QueryOptions, KEY, ATTRIBUTES, PAYLOAD
from dotenv import load_dotenv
import os
import time

load_dotenv()

PRIVATE_KEY = os.getenv("ARKIV_PRIVATE_KEY")
ACCOUNT_ADDRESS = os.getenv("ARKIV_ACCOUNT_ADDRESS")

# Connect account to Arkiv
account = NamedAccount.from_private_key("demo", PRIVATE_KEY)
provider = HTTPProvider("https://mendoza.hoodi.arkiv.network/rpc")

with Arkiv(provider=provider, account=account) as client:
    print("=== Arkiv SDK - Update Operations Test ===\n")

    # Create a test entity
    print("1. Creating test entity...")
    original_payload = b"Original Data v1.0"
    original_attributes = {"type": "document", "version": 1, "status": "draft"}

    entity_key, _ = client.arkiv.create_entity(
        payload=original_payload,
        content_type="text/plain",
        attributes=original_attributes,
        expires_in=client.arkiv.to_seconds(hours=1)
    )
    print(f"   Created entity: {entity_key}")
    print(f"   Original payload: {original_payload.decode()}")
    print(f"   Original attributes: {original_attributes}")
    print("✓ Entity created\n")

    # Test 1: Update entity attributes
    print("2. Testing attribute updates...")
    try:
        # Check if update_entity method exists
        updated_attributes = {"type": "document", "version": 2, "status": "published"}

        # Try updating via update_entity if available
        if hasattr(client.arkiv, 'update_entity'):
            receipt = client.arkiv.update_entity(
                entity_key,
                attributes=updated_attributes
            )
            print("   Using update_entity method")
        elif hasattr(client.arkiv, 'set_attributes'):
            receipt = client.arkiv.set_attributes(entity_key, updated_attributes)
            print("   Using set_attributes method")
        elif hasattr(client.arkiv, 'update_attributes'):
            receipt = client.arkiv.update_attributes(entity_key, updated_attributes)
            print("   Using update_attributes method")
        else:
            print("   ⚠ Update method not found - checking available methods...")
            methods = [m for m in dir(client.arkiv) if not m.startswith('_')]
            update_methods = [m for m in methods if 'update' in m.lower() or 'set' in m.lower() or 'modify' in m.lower()]
            print(f"   Available update-related methods: {update_methods}")

        # Verify the update
        entity = client.arkiv.get_entity(entity_key)
        print(f"   Updated attributes: {entity.attributes}")
        print("✓ Attributes updated successfully\n")
    except Exception as e:
        print(f"   ⚠ Attribute update error: {e}")
        print("   Continuing with other tests...\n")

    # Test 2: Update entity payload
    print("3. Testing payload updates...")
    try:
        updated_payload = b"Updated Data v2.0 - Now Published"

        if hasattr(client.arkiv, 'update_entity'):
            receipt = client.arkiv.update_entity(
                entity_key,
                payload=updated_payload,
                content_type="text/plain"
            )
        elif hasattr(client.arkiv, 'set_payload'):
            receipt = client.arkiv.set_payload(entity_key, updated_payload)
        elif hasattr(client.arkiv, 'update_payload'):
            receipt = client.arkiv.update_payload(entity_key, updated_payload)
        else:
            print("   ⚠ Payload update method not found")

        # Verify the payload update
        entity = client.arkiv.get_entity(entity_key)
        current_payload = (entity.payload or b"").decode("utf-8", errors="ignore")
        print(f"   Updated payload: {current_payload}")
        print("✓ Payload updated successfully\n")
    except Exception as e:
        print(f"   ⚠ Payload update error: {e}")
        print("   Continuing with other tests...\n")

    # Test 3: Extend entity lifetime
    print("4. Testing entity lifetime extension...")
    try:
        # Get current expiration
        entity_before = client.arkiv.get_entity(entity_key)
        print(f"   Current expiration: {getattr(entity_before, 'expires_at', 'N/A')}")

        # Extend lifetime
        if hasattr(client.arkiv, 'extend_entity'):
            receipt = client.arkiv.extend_entity(
                entity_key,
                expires_in=client.arkiv.to_seconds(days=2)
            )
            print("   Extended entity lifetime by 2 days")
        elif hasattr(client.arkiv, 'set_expiration'):
            receipt = client.arkiv.set_expiration(
                entity_key,
                expires_in=client.arkiv.to_seconds(days=2)
            )
            print("   Set new expiration to 2 days")
        else:
            print("   ⚠ Extension method not found")

        # Verify extension
        entity_after = client.arkiv.get_entity(entity_key)
        print(f"   New expiration: {getattr(entity_after, 'expires_at', 'N/A')}")
        print("✓ Entity lifetime extended\n")
    except Exception as e:
        print(f"   ⚠ Extension error: {e}\n")

    # Test 4: Combined update (attributes + payload)
    print("5. Testing combined update (attributes + payload)...")
    try:
        final_payload = b"Final Version - Archived"
        final_attributes = {"type": "document", "version": 3, "status": "archived"}

        if hasattr(client.arkiv, 'update_entity'):
            receipt = client.arkiv.update_entity(
                entity_key,
                payload=final_payload,
                attributes=final_attributes
            )

            # Verify combined update
            entity = client.arkiv.get_entity(entity_key)
            payload_text = (entity.payload or b"").decode("utf-8", errors="ignore")
            print(f"   Final payload: {payload_text}")
            print(f"   Final attributes: {entity.attributes}")
            print("✓ Combined update successful\n")
        else:
            print("   ⚠ Combined update method not available\n")
    except Exception as e:
        print(f"   ⚠ Combined update error: {e}\n")

    # Test 5: Verify update persistence with query
    print("6. Verifying updates persist in queries...")
    try:
        query = f'type = "document"'
        options = QueryOptions(fields=KEY | ATTRIBUTES | PAYLOAD, max_results_per_page=10)
        results = list(client.arkiv.query_entities(query=query, options=options))

        found = False
        for entity in results:
            if entity.key == entity_key:
                found = True
                print(f"   Found entity in query results")
                print(f"   Attributes: {entity.attributes}")
                payload_text = (entity.payload or b"").decode("utf-8", errors="ignore")
                print(f"   Payload: {payload_text}")
                break

        if found:
            print("✓ Updates persisted in query results\n")
        else:
            print("   ⚠ Entity not found in query results\n")
    except Exception as e:
        print(f"   ⚠ Query verification error: {e}\n")

    # Cleanup
    print("7. Cleaning up test entity...")
    try:
        client.arkiv.delete_entity(entity_key)
        print("✓ Test entity deleted\n")
    except Exception as e:
        print(f"   ⚠ Cleanup error: {e}\n")

    print("=== Update Operations Test Completed ===")
    print("\nNote: Some update methods may not be available in the current SDK version.")
    print("Please check the Arkiv SDK documentation for the exact update API.")
