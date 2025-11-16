/**
 * Example usage of Spuro Functions SDK
 *
 * Shows how to use the SDK with different fetch clients:
 * 1. Native fetch (for free endpoints)
 * 2. x402-wrapped fetch (for paid endpoints)
 */

import "dotenv/config";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";
import {
  createEntity,
  readEntity,
  queryEntities,
  updateEntity,
  deleteEntity,
  transferEntity,
  encodePayload,
  decodePayload,
} from "../src/index";

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";
const PRIVATE_KEY = (process.env.PRIVATE_KEY?.startsWith("0x")
  ? process.env.PRIVATE_KEY
  : `0x${process.env.PRIVATE_KEY}`) as `0x${string}`;
const RPC_URL = process.env.RPC_URL || "https://sepolia.base.org";

async function exampleWithX402Fetch() {
  console.log("\n=== Example 1: Using x402-wrapped fetch ===\n");

  // Setup wallet client
  const account = privateKeyToAccount(PRIVATE_KEY, { nonceManager });
  const client = createWalletClient({
    account,
    transport: http(RPC_URL),
    chain: baseSepolia,
  });

  // Wrap fetch with payment handling
  const fetchWithPay = wrapFetchWithPayment(fetch, client);

  // Example 1: Create entity
  console.log("Creating entity...");
  const createResponse = await createEntity(fetchWithPay, API_BASE_URL, {
    payload: encodePayload("Hello from Spuro Functions SDK!"),
    content_type: "text/plain",
    attributes: {
      type: "greeting",
      created_by: "spuro-example",
    },
    ttl: 86400,
  });
  console.log("Created entity:", createResponse.entity_key);
  console.log("TX Hash:", createResponse.tx_hash);

  // Wait for transaction
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Example 2: Read entity
  console.log("\nReading entity...");
  const readResponse = await readEntity(
    fetchWithPay,
    API_BASE_URL,
    createResponse.entity_key
  );
  console.log("Payload:", decodePayload(readResponse.data));
  console.log("Attributes:", readResponse.entity.attributes);

  // Example 3: Query entities
  console.log("\nQuerying entities...");
  const queryResponse = await queryEntities(fetchWithPay, API_BASE_URL, {
    query: 'type = "greeting"',
    limit: 10,
    include_payload: false,
  });
  console.log("Found:", queryResponse.count, "entities");

  // Example 4: Update entity
  console.log("\nUpdating entity...");
  const updateResponse = await updateEntity(
    fetchWithPay,
    API_BASE_URL,
    createResponse.entity_key,
    {
      attributes: {
        type: "greeting",
        created_by: "spuro-example",
        updated: true,
        version: 2,
      },
    }
  );
  console.log("Updated, TX Hash:", updateResponse.tx_hash);

  // Example 5: Delete entity
  console.log("\nDeleting entity...");
  const deleteResponse = await deleteEntity(
    fetchWithPay,
    API_BASE_URL,
    createResponse.entity_key
  );
  console.log("Deleted, TX Hash:", deleteResponse.tx_hash);
}

async function exampleWithNativeFetch() {
  console.log("\n=== Example 2: Using native fetch (for free endpoints) ===\n");

  // You can use native fetch if your backend doesn't require payment
  // or for testing with a local server

  console.log("Creating entity with native fetch...");
  const createResponse = await createEntity(fetch, API_BASE_URL, {
    payload: encodePayload("Free tier test"),
    content_type: "text/plain",
    attributes: {
      type: "test",
    },
  });
  console.log("Created:", createResponse.entity_key);
}

async function exampleBatchOperations() {
  console.log("\n=== Example 3: Batch operations ===\n");

  // Setup
  const account = privateKeyToAccount(PRIVATE_KEY, { nonceManager });
  const client = createWalletClient({
    account,
    transport: http(RPC_URL),
    chain: baseSepolia,
  });
  const fetchWithPay = wrapFetchWithPayment(fetch, client);

  // Create multiple entities
  const users = [
    { name: "Alice", age: 25, role: "developer" },
    { name: "Bob", age: 30, role: "designer" },
    { name: "Charlie", age: 35, role: "manager" },
  ];

  const entityKeys: string[] = [];

  console.log("Creating multiple entities...");
  for (const user of users) {
    const response = await createEntity(fetchWithPay, API_BASE_URL, {
      payload: encodePayload(JSON.stringify(user)),
      content_type: "application/json",
      attributes: {
        type: "user",
        name: user.name,
        age: user.age,
        role: user.role,
      },
    });
    console.log(`Created entity for ${user.name}:`, response.entity_key);
    entityKeys.push(response.entity_key);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Query them
  console.log("\nQuerying users...");
  const queryResponse = await queryEntities(fetchWithPay, API_BASE_URL, {
    query: 'type = "user"',
    limit: 10,
  });
  console.log("Found:", queryResponse.count, "users");

  // Query with filter
  console.log("\nQuerying users over 28...");
  const ageQuery = await queryEntities(fetchWithPay, API_BASE_URL, {
    query: "age > 28",
    limit: 10,
  });
  console.log("Found:", ageQuery.count, "users");

  // Cleanup
  console.log("\nCleaning up...");
  for (const key of entityKeys) {
    await deleteEntity(fetchWithPay, API_BASE_URL, key);
    console.log("Deleted:", key.substring(0, 16) + "...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Run examples
async function main() {
  try {
    await exampleWithX402Fetch();
    // await exampleWithNativeFetch(); // Uncomment if testing without payment
    // await exampleBatchOperations(); // Uncomment for batch example
    console.log("\n✓ Examples completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Example failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
