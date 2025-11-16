from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import JSONResponse
from x402.fastapi.middleware import require_payment
from dotenv import load_dotenv
from arkiv import Arkiv
from arkiv.account import NamedAccount
from web3 import HTTPProvider
from arkiv.types import QueryOptions, KEY, ATTRIBUTES, PAYLOAD
from typing import Optional, Dict, Any
import os

load_dotenv()

# Environment variables
PAYTO_ADDRESS = os.getenv("PAYTO_ADDRESS")
API_COST = os.getenv("API_COST", "0.01")
ARKIV_PRIVATE_KEY = os.getenv("ARKIV_PRIVATE_KEY")
ARKIV_RPC_URL = os.getenv("ARKIV_RPC_URL", "https://mendoza.hoodi.arkiv.network/rpc")
BACKEND_WALLET = os.getenv("ARKIV_ACCOUNT_ADDRESS")
MAINNET = os.getenv("MAINNET", "false").lower() == "true"

# Initialize Arkiv client
client = None

def get_arkiv_client():
    """Get or create Arkiv client instance"""
    global client
    if client is None:
        if not ARKIV_PRIVATE_KEY:
            raise RuntimeError("ARKIV_PRIVATE_KEY not found in environment variables")

        account = NamedAccount.from_private_key("backend", ARKIV_PRIVATE_KEY)
        provider = HTTPProvider(ARKIV_RPC_URL)
        client = Arkiv(provider=provider, account=account)

    return client

# Helper functions
def entity_exists(entity_key: str) -> bool:
    """Check if entity exists"""
    return get_arkiv_client().arkiv.entity_exists(entity_key)

# Initialize FastAPI app
app = FastAPI(title="Arkiv API with X402 Payments")

print(f'constants: PAYTO_ADDRESS={PAYTO_ADDRESS}, API_COST={API_COST}, ARKIV_RPC_URL={ARKIV_RPC_URL}, BACKEND_WALLET={BACKEND_WALLET}, MAINNET={MAINNET}')

# Configure custom facilitator URL if needed
facilitator_url = os.getenv("FACILITATOR_URL")
facilitator_config = {"url": facilitator_url} if facilitator_url else None

if facilitator_config:
    print(f'X402 facilitator: {facilitator_url}')

# Apply X402 payment middleware to all entity endpoints
app.middleware("http")(
    require_payment(
        price=API_COST,
        pay_to_address=PAYTO_ADDRESS,
        network="base-sepolia",
        path=["/entities", "/entities/query", "/entities/transfer"],
        facilitator_config=facilitator_config
    )
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Arkiv API with X402 Payments", "status": "healthy"}

@app.post("/entities")
async def create(
    payload: bytes = Body(...),
    content_type: str = Body("text/plain"),
    attributes: Optional[Dict[str, Any]] = Body(None),
    ttl: int = Body(86400)  # Default 1 day in seconds
):
    """Creates entity on behalf of caller, optionally transfer ownership"""
    try:
        # Validate attributes
        if attributes is not None and not isinstance(attributes, dict):
            raise HTTPException(status_code=400, detail="attributes must be a dictionary")

        client = get_arkiv_client()

        # Create entity
        entity_key, receipt = client.arkiv.create_entity(
            payload=payload,
            content_type=content_type,
            attributes=attributes or {},
            expires_in=ttl
        )

        print(f'Created entity {entity_key} with receipt {receipt}')

        return JSONResponse(
            status_code=201,
            content={
                "entity_key": entity_key,
                "tx_hash": receipt.tx_hash.hex() if hasattr(receipt.tx_hash, 'hex') else str(receipt.tx_hash)
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create entity: {str(e)}")

@app.get("/entities/query")
async def query(
    query: str,
    limit: int = 20,
    include_payload: bool = False
):
    """Completes query on behalf of caller, returns result"""
    try:
        client = get_arkiv_client()

        if not query:
            raise HTTPException(status_code=400, detail="query parameter is required")

        # Build fields
        fields = KEY | ATTRIBUTES
        if include_payload:
            fields |= PAYLOAD

        options = QueryOptions(fields, max_results_per_page=limit)
        results = list(client.arkiv.query_entities(query=query, options=options))

        # Format results
        formatted_results = []
        for entity in results:
            result = {
                "key": entity.key,
                "attributes": entity.attributes
            }

            if include_payload and entity.payload:
                try:
                    result["payload"] = entity.payload.decode('utf-8')
                except:
                    result["payload"] = entity.payload.hex()

            formatted_results.append(result)

        return {
            "query": query,
            "count": len(formatted_results),
            "results": formatted_results
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query entities: {str(e)}")

@app.get("/entities/{entity_key}")
async def read(entity_key: str):
    """Reads blockchain based on entity_key"""
    try:
        client = get_arkiv_client()

        if not entity_exists(entity_key):
            raise HTTPException(status_code=404, detail="Entity not found")

        entity = client.arkiv.get_entity(entity_key)
        data = (entity.payload or b"").decode("utf-8", errors="ignore")

        return {
            "data": data,
            "entity": {
                "key": entity.key,
                "owner": entity.owner,
                "content_type": entity.content_type,
                "attributes": entity.attributes
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read entity: {str(e)}")

@app.put("/entities/{entity_key}")
async def update(
    entity_key: str,
    attributes: Optional[Dict[str, Any]] = Body(None),
    payload: Optional[bytes] = Body(None),
    content_type: Optional[str] = Body(None),
    ttl: Optional[int] = Body(None)
):
    """Updates an entity key"""
    try:
        client = get_arkiv_client()

        if not entity_exists(entity_key):
            raise HTTPException(status_code=404, detail="Entity not found")

        # Build update parameters
        update_params = {"entity_key": entity_key}

        if attributes is not None:
            update_params["attributes"] = attributes
        if payload is not None:
            update_params["payload"] = payload
        if content_type is not None:
            update_params["content_type"] = content_type
        if ttl is not None:
            update_params["expires_in"] = client.arkiv.to_seconds(seconds=ttl)

        receipt = client.arkiv.update_entity(**update_params)

        return {
            "status": "success",
            "entity_key": entity_key,
            "tx_hash": receipt.tx_hash.hex() if hasattr(receipt.tx_hash, 'hex') else str(receipt.tx_hash)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update entity: {str(e)}")

@app.delete("/entities/{entity_key}")
async def delete(entity_key: str):
    """Deletes an entity"""
    try:
        client = get_arkiv_client()

        if not entity_exists(entity_key):
            raise HTTPException(status_code=404, detail="Entity not found")

        receipt = client.arkiv.delete_entity(entity_key)

        return {
            "status": "success",
            "entity_key": entity_key,
            "tx_hash": receipt.tx_hash.hex() if hasattr(receipt.tx_hash, 'hex') else str(receipt.tx_hash)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete entity: {str(e)}")

@app.post("/entities/transfer")
async def transfer(
    entity_key: str = Body(...),
    new_owner: str = Body(...)  # ideally we extract address from x402 headers?
):
    """Transfers ownership of entity from backend wallet to client"""
    try:
        client = get_arkiv_client()

        if not entity_exists(entity_key):
            raise HTTPException(status_code=404, detail="Entity not found")

        entity = client.arkiv.get_entity(entity_key)
        owner = entity.owner

        # Check if backend owns the entity
        if BACKEND_WALLET and BACKEND_WALLET.lower() != owner.lower():
            raise HTTPException(
                status_code=403,
                detail=f"Backend is not owner, this is owner: {owner}"
            )

        # Check if new owner is different
        if new_owner.lower() == owner.lower():
            raise HTTPException(
                status_code=400,
                detail=f"new_owner {new_owner} already owns entity {entity_key}"
            )

        receipt = client.arkiv.change_owner(entity_key, new_owner)

        return {
            "status": "success",
            "entity_key": entity_key,
            "old_owner": owner,
            "new_owner": new_owner,
            "tx_hash": receipt.tx_hash.hex() if hasattr(receipt.tx_hash, 'hex') else str(receipt.tx_hash)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to transfer ownership: {str(e)}")

@app.post("/entities/events")
async def events():
    """Fires up event listener for arkiv events - returns webhook url"""
    # TODO: Implement event listener
    raise HTTPException(status_code=501, detail="Event listener not yet implemented")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)