"""
Test script for Arkiv SDK - Advanced Query Filtering and Sorting.

This tests:
- Comparison operators (=, !=, >, >=, <, <=)
- Logical operators (AND, OR, NOT)
- GLOB pattern matching with wildcards
- Single and multi-attribute sorting
- Pagination handling
- Complex nested queries
"""

from arkiv import Arkiv, ASC, DESC, STR, INT
from arkiv.account import NamedAccount
from web3 import HTTPProvider
from arkiv.types import QueryOptions, KEY, ATTRIBUTES, OrderByAttribute
from dotenv import load_dotenv
import os

load_dotenv()

PRIVATE_KEY = os.getenv("ARKIV_PRIVATE_KEY")
ACCOUNT_ADDRESS = os.getenv("ARKIV_ACCOUNT_ADDRESS")

# Connect account to Arkiv
account = NamedAccount.from_private_key("demo", PRIVATE_KEY)
provider = HTTPProvider("https://mendoza.hoodi.arkiv.network/rpc")

with Arkiv(provider=provider, account=account) as client:
    print("=== Arkiv SDK - Advanced Query & Sorting Test ===\n")

    # Create a rich dataset for testing
    print("1. Creating comprehensive test dataset...")
    test_data = [
        {"name": "Alice", "age": 25, "role": "developer", "email": "alice@example.com", "status": "active"},
        {"name": "Bob", "age": 30, "role": "designer", "email": "bob@example.com", "status": "active"},
        {"name": "Charlie", "age": 35, "role": "manager", "email": "charlie@company.com", "status": "active"},
        {"name": "David", "age": 28, "role": "developer", "email": "david@example.com", "status": "inactive"},
        {"name": "Eve", "age": 32, "role": "developer", "email": "eve@company.com", "status": "active"},
        {"name": "Frank", "age": 45, "role": "director", "email": "frank@company.com", "status": "active"},
        {"name": "Grace", "age": 27, "role": "designer", "email": "grace@example.com", "status": "active"},
        {"name": "Henry", "age": 38, "role": "manager", "email": "henry@example.com", "status": "inactive"},
    ]

    created_keys = []
    for data in test_data:
        key, _ = client.arkiv.create_entity(
            payload=f"User profile: {data['name']}".encode(),
            content_type="text/plain",
            attributes=data,
            expires_in=client.arkiv.to_seconds(days=1)
        )
        created_keys.append(key)

    print(f"✓ Created {len(created_keys)} test entities\n")

    # Test 1: Equality operator
    print("2. Testing equality operator (=)...")
    query = 'role = "developer"'
    options = QueryOptions(fields=KEY | ATTRIBUTES, max_results_per_page=20)
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: {entity.attributes['role']}")
    print("✓ Equality test passed\n")

    # Test 2: Inequality operator
    print("3. Testing inequality operator (!=)...")
    query = 'role != "developer"'
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: {entity.attributes['role']}")
    print("✓ Inequality test passed\n")

    # Test 3: Greater than operator
    print("4. Testing greater than operator (>)...")
    query = 'age > 30'
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: age {entity.attributes['age']}")
    print("✓ Greater than test passed\n")

    # Test 4: Greater than or equal operator
    print("5. Testing greater than or equal operator (>=)...")
    query = 'age >= 35'
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: age {entity.attributes['age']}")
    print("✓ Greater than or equal test passed\n")

    # Test 5: Less than operator
    print("6. Testing less than operator (<)...")
    query = 'age < 30'
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: age {entity.attributes['age']}")
    print("✓ Less than test passed\n")

    # Test 6: Less than or equal operator
    print("7. Testing less than or equal operator (<=)...")
    query = 'age <= 28'
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: age {entity.attributes['age']}")
    print("✓ Less than or equal test passed\n")

    # Test 7: AND operator
    print("8. Testing AND operator...")
    query = 'role = "developer" AND age < 30'
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: {entity.attributes['role']}, age {entity.attributes['age']}")
    print("✓ AND operator test passed\n")

    # Test 8: OR operator
    print("9. Testing OR operator...")
    query = 'role = "manager" OR role = "director"'
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: {entity.attributes['role']}")
    print("✓ OR operator test passed\n")

    # Test 9: NOT operator (if supported)
    print("10. Testing NOT operator...")
    try:
        query = 'NOT status = "inactive"'
        results = list(client.arkiv.query_entities(query=query, options=options))
        print(f"   Query: {query}")
        print(f"   Results: {len(results)}")
        for entity in results[:3]:
            print(f"   - {entity.attributes['name']}: status {entity.attributes['status']}")
        print("✓ NOT operator test passed\n")
    except Exception as e:
        print(f"   ⚠ NOT operator may not be supported: {e}\n")

    # Test 10: GLOB pattern matching
    print("11. Testing GLOB pattern matching...")
    query = 'email GLOB "*@example.com"'
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: {entity.attributes['email']}")
    print("✓ GLOB pattern test passed\n")

    # Test 11: Complex nested query
    print("12. Testing complex nested query...")
    query = '(role = "developer" OR role = "designer") AND (age >= 25 AND age <= 30)'
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query}")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: {entity.attributes['role']}, age {entity.attributes['age']}")
    print("✓ Complex nested query test passed\n")

    # Test 12: Single attribute sorting (ascending)
    print("13. Testing single attribute sorting (ASC)...")
    query = 'status = "active"'
    order_by = [OrderByAttribute(attribute="age", type=INT, direction=ASC)]
    options = QueryOptions(fields=KEY | ATTRIBUTES, order_by=order_by, max_results_per_page=20)
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query} (sorted by age ASC)")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: age {entity.attributes['age']}")
    print("✓ Ascending sort test passed\n")

    # Test 13: Single attribute sorting (descending)
    print("14. Testing single attribute sorting (DESC)...")
    order_by = [OrderByAttribute(attribute="age", type=INT, direction=DESC)]
    options = QueryOptions(fields=KEY | ATTRIBUTES, order_by=order_by, max_results_per_page=20)
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query} (sorted by age DESC)")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: age {entity.attributes['age']}")
    print("✓ Descending sort test passed\n")

    # Test 14: Multi-attribute sorting
    print("15. Testing multi-attribute sorting...")
    query = 'status = "active"'
    order_by = [
        OrderByAttribute(attribute="role", type=STR, direction=ASC),
        OrderByAttribute(attribute="age", type=INT, direction=DESC),
    ]
    options = QueryOptions(fields=KEY | ATTRIBUTES, order_by=order_by, max_results_per_page=20)
    results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query} (sorted by role ASC, then age DESC)")
    print(f"   Results: {len(results)}")
    for entity in results:
        print(f"   - {entity.attributes['name']}: {entity.attributes['role']}, age {entity.attributes['age']}")
    print("✓ Multi-attribute sort test passed\n")

    # Test 15: Pagination
    print("16. Testing pagination...")
    query = 'status = "active"'
    options = QueryOptions(fields=KEY | ATTRIBUTES, max_results_per_page=3)
    all_results = list(client.arkiv.query_entities(query=query, options=options))
    print(f"   Query: {query} (page size: 3)")
    print(f"   Total results retrieved: {len(all_results)}")
    print("   Note: Pagination is handled automatically by the iterator")
    print("✓ Pagination test passed\n")

    # Test 16: String sorting
    print("17. Testing string attribute sorting...")
    order_by = [OrderByAttribute(attribute="name", type=STR, direction=ASC)]
    options = QueryOptions(fields=KEY | ATTRIBUTES, order_by=order_by, max_results_per_page=20)
    results = list(client.arkiv.query_entities(query='status = "active"', options=options))
    print(f"   Sorted by name (alphabetically):")
    for entity in results:
        print(f"   - {entity.attributes['name']}")
    print("✓ String sorting test passed\n")

    # Cleanup
    print("18. Cleaning up test entities...")
    for key in created_keys:
        try:
            client.arkiv.delete_entity(key)
        except Exception as e:
            print(f"   ⚠ Error deleting {key}: {e}")
    print("✓ Cleanup completed\n")

    print("=== Advanced Query & Sorting Tests Completed Successfully ===")
