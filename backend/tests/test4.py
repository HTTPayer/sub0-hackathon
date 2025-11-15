"""
Test script for Arkiv SDK - Entity Delete Operations.

This tests:
- Deleting single entities
- Verifying deletion with entity_exists()
- Confirming deleted entities don't appear in queries
- Bulk deletion operations
- Error handling for non-existent entities
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

# Connect account to Arkiv
account = NamedAccount.from_private_key("demo", PRIVATE_KEY)
provider = HTTPProvider("https://mendoza.hoodi.arkiv.network/rpc")

with Arkiv(provider=provider, account=account) as client:
    print("=== Arkiv SDK - Delete Operations Test ===\n")

    # Test 1: Create and delete a single entity
    print("1. Testing single entity deletion...")
    entity_key, _ = client.arkiv.create_entity(
        payload=b"Test entity to delete",
        content_type="text/plain",
        attributes={"type": "temp", "purpose": "deletion_test"},
        expires_in=client.arkiv.to_seconds(hours=1)
    )
    print(f"   Created entity: {entity_key}")

    # Verify it exists before deletion
    exists_before = client.arkiv.entity_exists(entity_key)
    print(f"   Entity exists before deletion: {exists_before}")

    # Delete the entity
    receipt = client.arkiv.delete_entity(entity_key)
    print(f"   Deleted entity: {entity_key}")

    # Verify it no longer exists
    exists_after = client.arkiv.entity_exists(entity_key)
    print(f"   Entity exists after deletion: {exists_after}")

    if not exists_after:
        print("✓ Single entity deletion successful\n")
    else:
        print("✗ Entity still exists after deletion!\n")

    # Test 2: Attempt to get a deleted entity
    print("2. Testing get_entity() on deleted entity...")
    try:
        deleted_entity = client.arkiv.get_entity(entity_key)
        if deleted_entity is None or not hasattr(deleted_entity, 'payload'):
            print("   Entity returned None or empty - expected behavior")
            print("✓ Deleted entity not retrievable\n")
        else:
            print(f"   ⚠ Warning: Retrieved deleted entity: {deleted_entity}")
            print("   This may indicate delayed deletion or caching\n")
    except Exception as e:
        print(f"   Exception raised (expected): {type(e).__name__}")
        print("✓ Deleted entity correctly raises error\n")

    # Test 3: Create multiple entities and delete them
    print("3. Testing bulk deletion...")
    bulk_keys = []
    for i in range(5):
        key, _ = client.arkiv.create_entity(
            payload=f"Bulk test entity {i}".encode(),
            content_type="text/plain",
            attributes={"type": "bulk_test", "index": i},
            expires_in=client.arkiv.to_seconds(hours=1)
        )
        bulk_keys.append(key)
    print(f"   Created {len(bulk_keys)} entities for bulk deletion")

    # Delete all bulk entities
    deleted_count = 0
    for key in bulk_keys:
        try:
            client.arkiv.delete_entity(key)
            deleted_count += 1
        except Exception as e:
            print(f"   ⚠ Error deleting {key}: {e}")

    print(f"   Successfully deleted {deleted_count}/{len(bulk_keys)} entities")

    # Verify all are deleted
    remaining = 0
    for key in bulk_keys:
        if client.arkiv.entity_exists(key):
            remaining += 1

    if remaining == 0:
        print("✓ Bulk deletion successful\n")
    else:
        print(f"✗ {remaining} entities still exist after bulk deletion\n")

    # Test 4: Verify deleted entities don't appear in queries
    print("4. Testing query results after deletion...")
    # Create some entities with a specific marker
    marker = "deletion_query_test"
    test_keys = []
    for i in range(3):
        key, _ = client.arkiv.create_entity(
            payload=f"Query test {i}".encode(),
            content_type="text/plain",
            attributes={"type": "query_test", "marker": marker},
            expires_in=client.arkiv.to_seconds(hours=1)
        )
        test_keys.append(key)
    print(f"   Created {len(test_keys)} entities with marker: {marker}")

    # Query before deletion
    query = f'marker = "{marker}"'
    options = QueryOptions(fields=KEY | ATTRIBUTES, max_results_per_page=10)
    results_before = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query results before deletion: {len(results_before)}")

    # Delete half of them
    keys_to_delete = test_keys[:2]
    for key in keys_to_delete:
        client.arkiv.delete_entity(key)
    print(f"   Deleted {len(keys_to_delete)} entities")

    # Query after deletion
    results_after = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query results after deletion: {len(results_after)}")

    expected_remaining = len(test_keys) - len(keys_to_delete)
    if len(results_after) == expected_remaining:
        print("✓ Deleted entities correctly excluded from queries\n")
    else:
        print(f"✗ Expected {expected_remaining} results, got {len(results_after)}\n")

    # Cleanup remaining test entities
    for key in test_keys[2:]:
        try:
            client.arkiv.delete_entity(key)
        except:
            pass

    # Test 5: Attempt to delete non-existent entity
    print("5. Testing deletion of non-existent entity...")
    fake_key = "0x0000000000000000000000000000000000000000000000000000000000000001"
    try:
        client.arkiv.delete_entity(fake_key)
        print("   ⚠ No error raised when deleting non-existent entity")
        print("   (This may be expected behavior)\n")
    except Exception as e:
        print(f"   Exception raised (may be expected): {type(e).__name__}")
        print(f"   Message: {str(e)[:100]}")
        print("✓ Proper error handling for non-existent entity\n")

    # Test 6: Verify immediate deletion consistency
    print("6. Testing deletion consistency...")
    key, _ = client.arkiv.create_entity(
        payload=b"Consistency test",
        content_type="text/plain",
        attributes={"type": "consistency"},
        expires_in=client.arkiv.to_seconds(hours=1)
    )

    # Check all methods confirm existence
    exists = client.arkiv.entity_exists(key)
    entity = client.arkiv.get_entity(key)
    has_entity = entity is not None

    print(f"   Before deletion:")
    print(f"   - entity_exists(): {exists}")
    print(f"   - get_entity() returns data: {has_entity}")

    # Delete
    client.arkiv.delete_entity(key)

    # Check all methods confirm deletion
    exists_after = client.arkiv.entity_exists(key)
    try:
        entity_after = client.arkiv.get_entity(key)
        has_entity_after = entity_after is not None
    except:
        has_entity_after = False

    print(f"   After deletion:")
    print(f"   - entity_exists(): {exists_after}")
    print(f"   - get_entity() returns data: {has_entity_after}")

    if not exists_after and not has_entity_after:
        print("✓ Deletion is consistent across all methods\n")
    else:
        print("⚠ Inconsistent deletion state detected\n")

    print("=== Delete Operations Test Completed ===")
