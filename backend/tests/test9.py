"""
Test script for X402 Payment-Based Wallet Authentication with Arkiv.

This demonstrates two approaches for handling user wallet authentication:
- Option A: Backend Custody (store user wallet in attributes)
- Option B: Immediate Ownership Transfer (transfer to user wallet)

Simulates the flow:
1. User makes X402 payment (includes wallet signature)
2. Backend extracts user's wallet address from payment
3. Backend creates entity and either:
   A) Stores user_wallet in attributes (backend owns)
   B) Transfers ownership to user_wallet (user owns)
"""

import os
import sys
from dotenv import load_dotenv
from arkiv import Arkiv, NamedAccount
from web3 import HTTPProvider
from typing import Dict, Any

# Load environment variables
load_dotenv()

# Get private keys
BACKEND_PRIVATE_KEY = os.getenv("ARKIV_PRIVATE_KEY")
USER_PRIVATE_KEY = os.getenv("ARKIV_PRIVATE_KEY_2")

if not BACKEND_PRIVATE_KEY:
    print("❌ Error: ARKIV_PRIVATE_KEY not found in .env")
    sys.exit(1)

# Simulate X402 Payment Request
def simulate_x402_payment(user_wallet: str) -> Dict[str, Any]:
    """
    Simulates an X402 payment request.
    In production, this would come from the X402 payment headers.
    """
    return {
        "from": user_wallet,  # User's wallet address (extracted from signature)
        "to": "backend_service_wallet",
        "amount": "1000000",  # 1 HTTPUSD
        "nonce": "unique_nonce_123",
        "validUntil": 1234567890,
        "signature": "0x..." # Payment signature (would verify user owns this wallet)
    }


def extract_user_wallet(payment_request: Dict[str, Any]) -> str:
    """
    Extract user's wallet address from X402 payment.
    The 'from' field contains the user's wallet address.
    The signature proves they control this wallet.
    """
    return payment_request["from"]


def option_a_backend_custody(backend_client, backend_account, user_wallet: str, content: str):
    """
    OPTION A: Backend Custody Model

    - Backend wallet owns the entity
    - User's wallet stored in attributes
    - Application-layer auth controls access
    - Backend can modify/delete on user's behalf
    """
    print("\n" + "="*70)
    print("OPTION A: Backend Custody Model")
    print("="*70)

    print(f"\n1. User wallet identified: {user_wallet}")
    print("2. Creating entity with backend wallet...")

    # Backend creates entity and stores user's wallet in attributes
    entity_key, _ = backend_client.arkiv.create_entity(
        payload=content.encode(),
        content_type="text/plain",
        attributes={
            "user_wallet": user_wallet,  # Store user's wallet for auth
            "content_type": "user_content",
            "created_via": "x402_payment"
        },
        expires_in=backend_client.arkiv.to_seconds(hours=24)
    )

    print(f"   ✓ Entity created: {entity_key}")

    # Verify ownership
    entity = backend_client.arkiv.get_entity(entity_key)
    backend_address = backend_account.address

    print(f"\n3. Ownership verification:")
    print(f"   Entity owner: {entity.owner}")
    print(f"   Backend address: {backend_address}")
    print(f"   User wallet (in attributes): {entity.attributes.get('user_wallet')}")

    assert entity.owner == backend_address, "Backend should own entity"
    assert entity.attributes.get("user_wallet") == user_wallet, "User wallet should be stored"

    print(f"   ✓ Backend owns entity, user wallet stored in attributes")

    print(f"\n4. Access control pattern:")
    print(f"   - All API requests include X402 payment headers")
    print(f"   - Backend extracts wallet from payment")
    print(f"   - Backend queries: user_wallet = '{user_wallet}'")
    print(f"   - Only returns/modifies entities belonging to that user")

    # Simulate access control
    print(f"\n5. Simulating user request to modify their entity...")

    # Backend would verify user_wallet matches, then modify
    backend_client.arkiv.update_entity(
        entity_key,
        attributes={
            "user_wallet": user_wallet,
            "content_type": "user_content",
            "created_via": "x402_payment",
            "modified": True,
            "last_modified_by": user_wallet
        }
    )

    print(f"   ✓ Backend modified entity on user's behalf")

    print(f"\nOPTION A SUMMARY:")
    print(f"   ✓ Backend has custody (owns all entities)")
    print(f"   ✓ User identified by wallet in attributes")
    print(f"   ✓ Application-layer auth via X402 payments")
    print(f"   ✓ Backend can modify/delete as needed")
    print(f"   ✗ Not true on-chain ownership for user")

    return entity_key


def option_b_ownership_transfer(
    backend_client,
    backend_account,
    user_client,
    user_wallet: str,
    content: str
):
    """
    OPTION B: Immediate Ownership Transfer Model

    - Backend wallet creates entity
    - Immediately transfers ownership to user's wallet
    - User has true on-chain ownership
    - Backend cannot modify after transfer (unless user grants permission)
    """
    print("\n" + "="*70)
    print("OPTION B: Immediate Ownership Transfer Model")
    print("="*70)

    if not user_client:
        print("\n⚠ Skipping Option B - requires ARKIV_PRIVATE_KEY_2 in .env")
        print("   (This would be the user's actual wallet in production)")
        return None

    print(f"\n1. User wallet identified: {user_wallet}")
    print("2. Creating entity with backend wallet...")

    # Backend creates entity
    entity_key, _ = backend_client.arkiv.create_entity(
        payload=content.encode(),
        content_type="text/plain",
        attributes={
            "user_wallet": user_wallet,
            "content_type": "user_content",
            "created_via": "x402_payment",
            "ownership_transferred": True
        },
        expires_in=backend_client.arkiv.to_seconds(hours=24)
    )

    print(f"   ✓ Entity created: {entity_key}")

    # Verify backend initially owns it
    entity = backend_client.arkiv.get_entity(entity_key)
    backend_address = backend_account.address
    print(f"\n3. Initial ownership: {entity.owner} (backend)")

    # Immediately transfer to user
    print(f"4. Transferring ownership to user wallet...")
    backend_client.arkiv.change_owner(entity_key, user_wallet)

    # Verify transfer
    entity = backend_client.arkiv.get_entity(entity_key)
    print(f"   ✓ New owner: {entity.owner}")

    assert entity.owner == user_wallet, "User should now own entity"
    print(f"   ✓ Ownership successfully transferred to user")

    print(f"\n5. Backend attempts to modify (should fail)...")
    try:
        backend_client.arkiv.update_entity(
            entity_key,
            attributes={"unauthorized": "attempt"}
        )
        print(f"   ⚠ Backend was able to modify (unexpected!)")
    except Exception as e:
        print(f"   ✓ Backend cannot modify: {type(e).__name__}")

    print(f"\n6. User modifies their own entity...")
    user_client.arkiv.update_entity(
        entity_key,
        attributes={
            "user_wallet": user_wallet,
            "content_type": "user_content",
            "created_via": "x402_payment",
            "ownership_transferred": True,
            "modified_by_owner": True
        }
    )
    print(f"   ✓ User successfully modified their entity")

    print(f"\nOPTION B SUMMARY:")
    print(f"   ✓ User has true on-chain ownership")
    print(f"   ✓ Decentralized - user controls data directly")
    print(f"   ✓ Backend acts as facilitator, not custodian")
    print(f"   ✓ User can transfer/revoke as needed")
    print(f"   ✗ Backend cannot modify after transfer")
    print(f"   ✗ More complex - need user's wallet/keys")

    return entity_key


def main():
    print("="*70)
    print("X402 Payment-Based Wallet Authentication with Arkiv")
    print("="*70)

    # Initialize backend account
    backend_account = NamedAccount.from_private_key("backend", BACKEND_PRIVATE_KEY)
    provider = HTTPProvider("https://mendoza.hoodi.arkiv.network/rpc")


    print(f"\nBackend wallet: {backend_account.address}")

    # Initialize user account (if available)
    user_account = None
    user_wallet = None

    if USER_PRIVATE_KEY:
        user_account = NamedAccount.from_private_key("user", USER_PRIVATE_KEY)
        user_wallet = user_account.address
        print(f"User wallet:    {user_wallet}")
    else:
        # Simulate a user wallet address (in production, extracted from X402 payment)
        user_wallet = "0x1234567890123456789012345678901234567890"
        print(f"User wallet:    {user_wallet} (simulated)")
        print(f"Note: Add ARKIV_PRIVATE_KEY_2 to .env to test Option B")

    # Simulate X402 payment
    print(f"\nSimulating X402 payment from user...")
    payment_request = simulate_x402_payment(user_wallet)
    print(f"   Payment from: {payment_request['from']}")
    print(f"   Payment to:   {payment_request['to']}")
    print(f"   Amount:       {payment_request['amount']} HTTPUSD")

    # Extract wallet from payment (this is the auth!)
    authenticated_wallet = extract_user_wallet(payment_request)
    print(f"\nUser authenticated via X402 payment signature")
    print(f"   Wallet: {authenticated_wallet}")

    with Arkiv(provider=provider, account=backend_account) as backend_client:
        try:
            # Test Option A: Backend Custody
            entity_key_a = option_a_backend_custody(
                backend_client,
                backend_account,
                authenticated_wallet,
                "User content created via X402 payment (Option A)"
            )

            # Test Option B: Ownership Transfer (only if user account available)
            entity_key_b = None
            if user_account:
                with Arkiv(provider=provider, account=user_account) as user_client:
                    entity_key_b = option_b_ownership_transfer(
                        backend_client,
                        backend_account,
                        user_client,
                        authenticated_wallet,
                        "User content created via X402 payment (Option B)"
                    )
            else:
                option_b_ownership_transfer(
                    backend_client,
                    backend_account,
                    None,
                    authenticated_wallet,
                    "User content created via X402 payment (Option B)"
                )

            # Final comparison
            print("\n" + "="*70)
            print("FINAL COMPARISON")
            print("="*70)

            print("\nUse Case Recommendations:")
            print("\n📁 Use OPTION A (Backend Custody) when:")
            print("   - You need to modify/delete on user's behalf")
            print("   - Users don't need true blockchain ownership")
            print("   - Simpler UX - users just pay, don't manage wallets")
            print("   - Examples: Temporary storage, caching, session data")

            print("\n🔐 Use OPTION B (Ownership Transfer) when:")
            print("   - Users need provable on-chain ownership")
            print("   - Data should survive even if backend disappears")
            print("   - Compliance/regulatory requirements for data ownership")
            print("   - Examples: NFTs, certificates, permanent records")

            print("\n💡 HYBRID APPROACH:")
            print("   - Default to Option A for most operations")
            print("   - Add POST /entities/:key/claim-ownership endpoint")
            print("   - Users can upgrade to true ownership when needed")
            print("   - Best of both worlds!")

            # Cleanup
            print(f"\n🧹 Cleaning up test entities...")
            if entity_key_a:
                backend_client.arkiv.delete_entity(entity_key_a)
                print(f"   ✓ Deleted Option A entity")

            if entity_key_b and user_account:
                with Arkiv(provider=provider, account=user_account) as user_client:
                    user_client.arkiv.delete_entity(entity_key_b)
                    print(f"   ✓ Deleted Option B entity")

            print("\nTest completed successfully!")

        except Exception as e:
            print(f"\n❌ Error during test: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    main()
