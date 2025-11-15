"""
Test script for Arkiv SDK - Ownership and Permissions.

This tests:
- Entity ownership (who owns created entities?)
- Can other accounts modify/delete entities they don't own?
- What happens when you try unauthorized operations?
- Understanding the permission model
"""

from arkiv import Arkiv
from arkiv.account import NamedAccount
from web3 import HTTPProvider
from dotenv import load_dotenv
import os

load_dotenv()

PRIVATE_KEY = os.getenv("ARKIV_PRIVATE_KEY")
ACCOUNT_ADDRESS = os.getenv("ARKIV_ACCOUNT_ADDRESS")

# For testing with a second account (if available)
PRIVATE_KEY_2 = os.getenv("ARKIV_PRIVATE_KEY_2")  # Optional second account

print("=== Arkiv SDK - Ownership & Permissions Test ===\n")

# Account 1 (primary)
account1 = NamedAccount.from_private_key("account1", PRIVATE_KEY)
provider = HTTPProvider("https://mendoza.hoodi.arkiv.network/rpc")

with Arkiv(provider=provider, account=account1) as client1:

    # Test 1: Check owner of created entity
    print("1. Testing entity ownership...")
    entity_key, receipt = client1.arkiv.create_entity(
        payload=b"Owned by Account 1",
        content_type="text/plain",
        attributes={"type": "ownership_test", "created_by": "account1"},
        expires_in=client1.arkiv.to_seconds(hours=1)
    )
    print(f"   Created entity: {entity_key}")
    print(f"   Creator address: {account1.address}")

    # Check entity details
    entity = client1.arkiv.get_entity(entity_key)
    print(f"   Entity owner: {getattr(entity, 'owner', 'N/A')}")
    print(f"   Entity creator: {getattr(entity, 'creator', 'N/A')}")

    # Check transaction receipt for owner info
    if hasattr(receipt, 'logs'):
        print(f"   Transaction logs available: {len(receipt.logs)} logs")

    print("✓ Ownership check completed\n")

    # Test 2: Can the same account modify its own entity?
    print("2. Testing modification by owner (same account)...")
    try:
        if hasattr(client1.arkiv, 'update_entity'):
            client1.arkiv.update_entity(
                entity_key,
                attributes={"type": "ownership_test", "modified": True}
            )
            print("   ✓ Owner can modify their own entity")
        else:
            print("   ⚠ Update method not available")

        # Try deleting
        test_key, _ = client1.arkiv.create_entity(
            payload=b"Test delete",
            content_type="text/plain",
            attributes={"type": "temp"},
            expires_in=client1.arkiv.to_seconds(hours=1)
        )
        client1.arkiv.delete_entity(test_key)
        print("   ✓ Owner can delete their own entity")

    except Exception as e:
        print(f"   ✗ Error modifying own entity: {e}")

    print()

# Test 3: Try to modify with a different account
if PRIVATE_KEY_2:
    print("3. Testing modification by different account...")
    account2 = NamedAccount.from_private_key("account2", PRIVATE_KEY_2)

    with Arkiv(provider=provider, account=account2) as client2:
        print(f"   Account 2 address: {account2.address}")
        print(f"   Attempting to delete entity owned by Account 1...")

        try:
            # Try to delete entity created by account1
            client2.arkiv.delete_entity(entity_key)
            print("   ⚠ WARNING: Account 2 was able to delete Account 1's entity!")
            print("   This suggests NO ownership protection, or permissionless model")
        except Exception as e:
            print(f"   ✓ Correctly blocked: {type(e).__name__}")
            print(f"   Message: {str(e)[:100]}")
            print("   This confirms ownership protection is enforced")

        # Try to modify
        if hasattr(client2.arkiv, 'update_entity'):
            try:
                client2.arkiv.update_entity(
                    entity_key,
                    attributes={"hacked": True}
                )
                print("   ⚠ WARNING: Account 2 was able to modify Account 1's entity!")
            except Exception as e:
                print(f"   ✓ Modification blocked: {type(e).__name__}")

        print()
else:
    print("3. Skipping cross-account test (ARKIV_PRIVATE_KEY_2 not set)\n")
    print("   To test cross-account permissions, add ARKIV_PRIVATE_KEY_2 to .env\n")

# Test 4: Understanding the permission model
print("4. Permission Model Summary...")
print("   Based on blockchain principles:")
print("   - Each entity is owned by the wallet address that created it")
print("   - Only the owner (private key holder) can modify/delete entities")
print("   - This is enforced at the smart contract level")
print("   - Anyone can READ entities (public blockchain)")
print()

print("=== Ownership & Permissions Test Completed ===")
print("\nKey Findings:")
print("- Entities are owned by the wallet address that signs the create transaction")
print("- Ownership is likely enforced by smart contracts on-chain")
print("- Your backend service's architecture choice:")
print()
print("  OPTION A: Single Backend Wallet")
print("  ✓ Simple: One private key for backend")
print("  ✗ Problem: All entities owned by backend")
print("  ✗ Need: Application-level auth to track which user owns which entity")
print("  ✗ Risk: Backend can modify/delete anything it created")
print()
print("  OPTION B: User-Owned Wallets")
print("  ✓ Secure: Each user has their own Arkiv wallet")
print("  ✓ True ownership: Users control their own data on-chain")
print("  ✗ Complex: Need wallet management, key custody")
print("  ✗ UX: Users must sign transactions (unless delegated)")
print()
print("  OPTION C: Hybrid")
print("  - Backend wallet creates entities with user metadata in attributes")
print("  - Application-layer auth controls who can request operations")
print("  - Store user_id in attributes: {'user_id': '12345', ...}")
print("  - Verify user_id before allowing operations through your API")
print()
