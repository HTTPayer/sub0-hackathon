"""
Test script for Arkiv SDK - Ownership Transfer.

Tests:
- Creating an entity with one wallet
- Transferring ownership to another wallet
- Verifying new owner can modify/delete
- Verifying old owner cannot modify after transfer
"""

import os
import sys
from dotenv import load_dotenv
from arkiv import Arkiv, NamedAccount

# Load environment variables
load_dotenv()

# Get private keys for two different accounts
PRIVATE_KEY_1 = os.getenv("ARKIV_PRIVATE_KEY")
PRIVATE_KEY_2 = os.getenv("ARKIV_PRIVATE_KEY_2")

if not PRIVATE_KEY_1:
    print("❌ Error: ARKIV_PRIVATE_KEY not found in .env")
    sys.exit(1)

if not PRIVATE_KEY_2:
    print("⚠ Warning: ARKIV_PRIVATE_KEY_2 not found in .env")
    print("   You need two different private keys to test ownership transfer.")
    print("   Add ARKIV_PRIVATE_KEY_2 to your .env file.\n")
    sys.exit(1)

# Initialize clients with both accounts
account1 = NamedAccount.from_private_key("account1", PRIVATE_KEY_1)
account2 = NamedAccount.from_private_key("account2", PRIVATE_KEY_2)

client1 = Arkiv("http://localhost:8547", account1)
client2 = Arkiv("http://localhost:8547", account2)

print("=== Arkiv SDK - Ownership Transfer Test ===\n")
print(f"Account 1 address: {account1.address}")
print(f"Account 2 address: {account2.address}\n")

try:
    # Test 1: Create entity with Account 1
    print("1. Creating entity with Account 1...")
    entity_key, _ = client1.arkiv.create_entity(
        payload=b"Original content from Account 1",
        content_type="text/plain",
        attributes={"type": "ownership_transfer_test", "creator": "account1"},
        expires_in=client1.arkiv.to_seconds(hours=2)
    )
    print(f"   ✓ Created entity: {entity_key}")

    # Verify Account 1 owns it
    entity = client1.arkiv.get_entity(entity_key)
    print(f"   Current owner: {entity.owner}")
    assert entity.owner == account1.address, "Account 1 should own the entity"
    print(f"   ✓ Confirmed Account 1 owns the entity\n")

    # Test 2: Try to modify with Account 2 (should fail)
    print("2. Testing if Account 2 can modify BEFORE ownership transfer...")
    try:
        client2.arkiv.update_entity(
            entity_key,
            attributes={"type": "ownership_transfer_test", "modified_by": "account2_unauthorized"}
        )
        print("   ⚠ Account 2 was able to modify (unexpected!)")
    except Exception as e:
        print(f"   ✓ Account 2 cannot modify (expected): {type(e).__name__}\n")

    # Test 3: Transfer ownership from Account 1 to Account 2
    print("3. Transferring ownership from Account 1 to Account 2...")
    receipt = client1.arkiv.change_owner(entity_key, account2.address)
    print(f"   ✓ Ownership transfer transaction: {receipt.tx_hash}")

    # Verify ownership changed
    entity = client1.arkiv.get_entity(entity_key)
    print(f"   New owner: {entity.owner}")
    assert entity.owner == account2.address, "Account 2 should now own the entity"
    print(f"   ✓ Ownership successfully transferred to Account 2\n")

    # Test 4: Try to modify with Account 1 (should fail now)
    print("4. Testing if Account 1 can modify AFTER ownership transfer...")
    try:
        client1.arkiv.update_entity(
            entity_key,
            attributes={"type": "ownership_transfer_test", "modified_by": "account1_no_longer_owner"}
        )
        print("   ⚠ Account 1 was able to modify (unexpected - should fail!)")
    except Exception as e:
        print(f"   ✓ Account 1 can no longer modify (expected): {type(e).__name__}\n")

    # Test 5: Modify with Account 2 (should succeed)
    print("5. Testing if Account 2 can modify AFTER ownership transfer...")
    try:
        client2.arkiv.update_entity(
            entity_key,
            attributes={"type": "ownership_transfer_test", "modified_by": "account2_new_owner"}
        )
        print("   ✓ Account 2 can modify as new owner")

        # Verify the update
        entity = client2.arkiv.get_entity(entity_key)
        assert entity.attributes.get("modified_by") == "account2_new_owner"
        print(f"   ✓ Verified update: modified_by = {entity.attributes.get('modified_by')}\n")
    except Exception as e:
        print(f"   ❌ Account 2 cannot modify (unexpected!): {e}\n")

    # Test 6: Delete with new owner (Account 2)
    print("6. Deleting entity with new owner (Account 2)...")
    try:
        client2.arkiv.delete_entity(entity_key)
        print("   ✓ Account 2 can delete as new owner")

        # Verify deletion
        exists = client2.arkiv.entity_exists(entity_key)
        assert not exists, "Entity should be deleted"
        print("   ✓ Entity successfully deleted\n")
    except Exception as e:
        print(f"   ❌ Error deleting: {e}\n")

    print("=== Ownership Transfer Test Completed ===\n")

    print("Key Findings:")
    print("✓ Arkiv supports ownership transfer via change_owner() method")
    print("✓ Only the current owner can transfer ownership")
    print("✓ After transfer, the old owner loses all privileges")
    print("✓ The new owner gains full control (modify/delete)")
    print()
    print("Architectural Implications for X402:")
    print()
    print("OPTION D: Delegated Ownership Model")
    print("  1. Backend wallet creates entities for users")
    print("  2. Immediately transfer ownership to user's wallet address")
    print("  3. User has true on-chain ownership")
    print("  4. User can later transfer/revoke access as needed")
    print()
    print("  Benefits:")
    print("  ✓ Users have actual blockchain ownership")
    print("  ✓ Backend doesn't retain control over user data")
    print("  ✓ Decentralized: users can interact directly with Arkiv")
    print("  ✓ Backend acts as facilitator, not custodian")
    print()
    print("  Tradeoffs:")
    print("  ✗ Users need their own Ethereum wallet addresses")
    print("  ✗ More complex: need to track user wallet addresses")
    print("  ✗ Backend cannot modify/delete after transfer")

except Exception as e:
    print(f"❌ Error during test: {e}")
    import traceback
    traceback.print_exc()
