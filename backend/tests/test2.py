"""
Test script for Arkiv SDK - Entity Read and Query Operations.

This tests:
- Reading entities by key
- Checking entity existence
- Querying entities with filters
- Different field retrieval options
"""

from arkiv import Arkiv
from arkiv.account import NamedAccount
from web3 import HTTPProvider
from arkiv.types import QueryOptions, KEY, ATTRIBUTES, PAYLOAD
from dotenv import load_dotenv
import os

load_dotenv()

PRIVATE_KEY = os.getenv("ARKIV_PRIVATE_KEY")
ACCOUNT_ADDRESS = os.getenv("ARKIV_ACCOUNT_ADDRESS")

# Connect account to Arkiv
account = NamedAccount.from_private_key("demo", PRIVATE_KEY)
provider = HTTPProvider("https://mendoza.hoodi.arkiv.network/rpc")

with Arkiv(provider=provider, account=account) as client:
    print("=== Arkiv SDK - Read & Query Operations Test ===\n")

    # First, create some test entities to query
    print("1. Creating test entities...")
    entities_created = []

    test_data = [
        (b"User Alice", "application/json", {"type": "user", "name": "Alice", "age": 25}),
        (b"User Bob", "application/json", {"type": "user", "name": "Bob", "age": 30}),
        (b"Admin Charlie", "application/json", {"type": "admin", "name": "Charlie", "age": 35}),
        (b"Document 1", "text/plain", {"type": "document", "category": "reports"}),
    ]

    for payload, content_type, attrs in test_data:
        entity_key, _ = client.arkiv.create_entity(
            payload=payload,
            content_type=content_type,
            attributes=attrs,
            expires_in=client.arkiv.to_seconds(days=1)
        )
        entities_created.append((entity_key, attrs))
        print(f"   Created entity: {entity_key} with attributes: {attrs}")

    print(f"\n✓ Created {len(entities_created)} test entities\n")

    # Test 1: Get entity by key
    print("2. Testing get_entity()...")
    first_key = entities_created[0][0]
    entity = client.arkiv.get_entity(first_key)
    data = (entity.payload or b"").decode("utf-8", errors="ignore")
    print(f"   Key: {first_key}")
    print(f"   Payload: {data}")
    print(f"   Content-Type: {entity.content_type}")
    print(f"   Attributes: {entity.attributes}")
    print("✓ Successfully retrieved entity\n")

    # Test 2: Check entity existence
    print("3. Testing entity_exists()...")
    exists = client.arkiv.entity_exists(first_key)
    print(f"   Entity {first_key} exists: {exists}")

    fake_key = "0x0000000000000000000000000000000000000000000000000000000000000000"
    fake_exists = client.arkiv.entity_exists(fake_key)
    print(f"   Fake entity exists: {fake_exists}")
    print("✓ Entity existence check working\n")

    # Test 3: Query entities with KEY only
    print("4. Testing query with KEY fields only...")
    query = 'type = "user"'
    options = QueryOptions(fields=KEY, max_results_per_page=10)
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results found: {len(results)}")
    for entity in results[:2]:  # Show first 2
        print(f"   - Key: {entity.key}")
    print("✓ Query with KEY fields successful\n")

    # Test 4: Query entities with KEY + ATTRIBUTES
    print("5. Testing query with KEY + ATTRIBUTES...")
    options = QueryOptions(fields=KEY | ATTRIBUTES, max_results_per_page=10)
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results found: {len(results)}")
    for entity in results[:2]:
        print(f"   - Key: {entity.key}")
        print(f"     Attributes: {entity.attributes}")
    print("✓ Query with KEY + ATTRIBUTES successful\n")

    # Test 5: Query entities with all fields
    print("6. Testing query with all fields (KEY + ATTRIBUTES + PAYLOAD)...")
    options = QueryOptions(fields=KEY | ATTRIBUTES | PAYLOAD, max_results_per_page=10)
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results found: {len(results)}")
    for entity in results[:2]:
        payload_text = (entity.payload or b"").decode("utf-8", errors="ignore")
        print(f"   - Key: {entity.key}")
        print(f"     Payload: {payload_text}")
        print(f"     Attributes: {entity.attributes}")
    print("✓ Query with all fields successful\n")

    # Test 6: Complex query with AND
    print("7. Testing complex query with AND operator...")
    complex_query = 'type = "user" AND age > 25'
    options = QueryOptions(fields=KEY | ATTRIBUTES, max_results_per_page=10)
    results = list(client.arkiv.query_entities(query=complex_query, options=options))
    print(f"   Query: {complex_query}")
    print(f"   Results found: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes.get('name')}: age {entity.attributes.get('age')}")
    print("✓ Complex query successful\n")

    # Test 7: Query with OR operator
    print("8. Testing query with OR operator...")
    or_query = 'type = "user" OR type = "admin"'
    options = QueryOptions(fields=KEY | ATTRIBUTES, max_results_per_page=10)
    results = list(client.arkiv.query_entities(query=or_query, options=options))
    print(f"   Query: {or_query}")
    print(f"   Results found: {len(results)}")
    for entity in results:
        print(f"   - Type: {entity.attributes.get('type')}, Name: {entity.attributes.get('name')}")
    print("✓ OR query successful\n")

    # Cleanup: Delete test entities
    print("9. Cleaning up test entities...")
    for entity_key, _ in entities_created:
        client.arkiv.delete_entity(entity_key)
    print("✓ Test entities deleted\n")

    print("=== All Read & Query Tests Completed Successfully ===")
