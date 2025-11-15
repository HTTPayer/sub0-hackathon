"""
Example API Implementation: X402 + Arkiv Integration

This shows how to build an API endpoint that:
1. Accepts X402 payments for authentication
2. Extracts user wallet from payment
3. Creates/manages Arkiv entities with wallet-based auth

Usage in your Express/FastAPI backend:
- Adapt this pattern to your web framework
- Use X402 payment as authentication
- No API keys needed - wallet = identity
"""

from typing import Dict, Any, Optional
from arkiv import Arkiv, NamedAccount
import os


class X402ArkivService:
    """
    Service class for handling X402-authenticated Arkiv operations.
    """

    def __init__(self, arkiv_endpoint: str, backend_private_key: str):
        """
        Initialize the service with backend wallet.

        Args:
            arkiv_endpoint: URL of Arkiv node (e.g., 'http://localhost:8547')
            backend_private_key: Private key for backend wallet
        """
        account = NamedAccount.from_private_key("backend", backend_private_key)
        self.client = Arkiv(arkiv_endpoint, account)
        self.backend_address = account.address

    def extract_wallet_from_payment(self, payment_headers: Dict[str, str]) -> str:
        """
        Extract and verify user's wallet address from X402 payment headers.

        In production, you would:
        1. Verify the payment signature
        2. Check payment amount meets minimum
        3. Verify nonce hasn't been used
        4. Extract wallet address from 'from' field

        Args:
            payment_headers: Headers from X402 payment request

        Returns:
            User's verified wallet address
        """
        # Example header structure:
        # {
        #   "X-Payment-From": "0xUserWallet...",
        #   "X-Payment-To": "0xBackendWallet...",
        #   "X-Payment-Amount": "1000000",
        #   "X-Payment-Nonce": "unique_nonce",
        #   "X-Payment-Signature": "0x..."
        # }

        user_wallet = payment_headers.get("X-Payment-From")

        if not user_wallet:
            raise ValueError("Missing user wallet in payment headers")

        # TODO: Verify signature proves user controls this wallet
        # TODO: Verify payment to your backend wallet
        # TODO: Check nonce not reused

        return user_wallet

    def create_entity_for_user(
        self,
        user_wallet: str,
        content: bytes,
        content_type: str,
        metadata: Optional[Dict[str, Any]] = None,
        transfer_ownership: bool = False
    ) -> str:
        """
        Create an Arkiv entity for a user.

        Args:
            user_wallet: User's wallet address (from X402 payment)
            content: Entity payload
            content_type: MIME type
            metadata: Additional attributes
            transfer_ownership: If True, transfer ownership to user (Option B)
                              If False, keep backend ownership (Option A)

        Returns:
            Entity key
        """
        # Prepare attributes
        attributes = {
            "user_wallet": user_wallet,  # Store user's wallet for queries
            "content_type": content_type,
            **(metadata or {})
        }

        # Create entity (backend owns initially)
        entity_key, _ = self.client.arkiv.create_entity(
            payload=content,
            content_type=content_type,
            attributes=attributes,
            expires_in=self.client.arkiv.to_seconds(days=30)
        )

        # Option B: Transfer ownership to user
        if transfer_ownership:
            self.client.arkiv.change_owner(entity_key, user_wallet)

        return entity_key

    def get_user_entities(self, user_wallet: str, limit: int = 10) -> list:
        """
        Get all entities belonging to a user.

        Args:
            user_wallet: User's wallet address
            limit: Maximum number of results

        Returns:
            List of entities
        """
        query = f'user_wallet = "{user_wallet}"'
        options = {"limit": limit, "order_by": "created_at DESC"}

        results = list(self.client.arkiv.query_entities(query=query, options=options))
        return results

    def update_user_entity(
        self,
        user_wallet: str,
        entity_key: str,
        new_attributes: Dict[str, Any]
    ) -> bool:
        """
        Update an entity if user is authorized.

        Args:
            user_wallet: User's wallet address (from X402 payment)
            entity_key: Entity to update
            new_attributes: New attributes

        Returns:
            True if successful
        """
        # Verify user owns this entity
        entity = self.client.arkiv.get_entity(entity_key)

        # Check authorization
        if entity.owner == self.backend_address:
            # Option A: Backend owns, check attributes
            if entity.attributes.get("user_wallet") != user_wallet:
                raise PermissionError("User not authorized for this entity")

            # Backend can modify
            self.client.arkiv.update_entity(entity_key, attributes=new_attributes)
            return True

        elif entity.owner == user_wallet:
            # Option B: User owns, they need to sign transaction themselves
            raise PermissionError(
                "Entity is user-owned. User must sign transaction directly."
            )
        else:
            raise PermissionError("Neither backend nor user owns this entity")

    def delete_user_entity(self, user_wallet: str, entity_key: str) -> bool:
        """
        Delete an entity if user is authorized.

        Args:
            user_wallet: User's wallet address
            entity_key: Entity to delete

        Returns:
            True if successful
        """
        entity = self.client.arkiv.get_entity(entity_key)

        # Check authorization (same as update)
        if entity.owner == self.backend_address:
            if entity.attributes.get("user_wallet") != user_wallet:
                raise PermissionError("User not authorized for this entity")

            self.client.arkiv.delete_entity(entity_key)
            return True

        elif entity.owner == user_wallet:
            raise PermissionError(
                "Entity is user-owned. User must sign transaction directly."
            )
        else:
            raise PermissionError("Neither backend nor user owns this entity")


# ============================================================================
# EXAMPLE API ENDPOINT IMPLEMENTATIONS
# ============================================================================

def example_express_style_api():
    """
    Pseudo-code showing how to integrate with Express.js/FastAPI
    """
    print("""
# Express.js Example:

const service = new X402ArkivService(
    process.env.ARKIV_ENDPOINT,
    process.env.BACKEND_PRIVATE_KEY
);

app.post('/api/arkiv/entities', async (req, res) => {
    try {
        // Extract wallet from X402 payment headers
        const userWallet = service.extractWalletFromPayment(req.headers);

        // Create entity
        const entityKey = await service.createEntityForUser(
            userWallet,
            req.body.content,
            req.body.contentType,
            req.body.metadata,
            transferOwnership: req.body.transferOwnership || false
        );

        res.json({ ok: true, entityKey });
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
});

app.get('/api/arkiv/entities', async (req, res) => {
    try {
        const userWallet = service.extractWalletFromPayment(req.headers);
        const entities = await service.getUserEntities(userWallet);

        res.json({ ok: true, entities });
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
});

app.put('/api/arkiv/entities/:key', async (req, res) => {
    try {
        const userWallet = service.extractWalletFromPayment(req.headers);

        await service.updateUserEntity(
            userWallet,
            req.params.key,
            req.body.attributes
        );

        res.json({ ok: true });
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
});

app.delete('/api/arkiv/entities/:key', async (req, res) => {
    try {
        const userWallet = service.extractWalletFromPayment(req.headers);

        await service.deleteUserEntity(userWallet, req.params.key);

        res.json({ ok: true });
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
});
    """)


# ============================================================================
# DEMO
# ============================================================================

if __name__ == "__main__":
    print("="*70)
    print("X402 + Arkiv API Service - Example Implementation")
    print("="*70)

    print("\nThis example shows how to:")
    print("  1. Use X402 payments for authentication (no API keys!)")
    print("  2. Extract user wallet from payment headers")
    print("  3. Create/manage Arkiv entities with wallet-based auth")
    print("  4. Support both custody models (Option A & B)")

    print("\n" + "="*70)
    print("Integration Pattern")
    print("="*70)

    example_express_style_api()

    print("\n" + "="*70)
    print("Key Benefits")
    print("="*70)
    print("\n✅ No API Key Management")
    print("   - Wallet address IS the user identity")
    print("   - Payment signature proves ownership")

    print("\n✅ Pay-Per-Use")
    print("   - Every API call includes X402 payment")
    print("   - Automatic monetization")

    print("\n✅ Flexible Ownership")
    print("   - Option A: Simple backend custody")
    print("   - Option B: True user ownership")
    print("   - Easy to switch per endpoint")

    print("\n✅ Web3 Native")
    print("   - Wallet-based identity")
    print("   - On-chain data ownership")
    print("   - Cryptographic auth")

    print("\n" + "="*70)
    print("Next Steps")
    print("="*70)
    print("\n1. Run test9_x402_wallet_auth.py to see both options")
    print("2. Decide: Option A (custody) or Option B (transfer)")
    print("3. Adapt this service class to your backend")
    print("4. Add X402 payment verification")
    print("5. Deploy and test with real payments!")
