#!/usr/bin/env node
/**
 * Test client for ArkiVendor API endpoints
 * Uses X402 payment flow with viem wallet
 */

import { createWalletClient, http } from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";
import { baseSepolia } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";
let PRIVATE_KEY = process.env.CLIENT_PRIVATE_KEY || process.env.PRIVATE_KEY || "";
if (!PRIVATE_KEY.startsWith("0x")) {
  PRIVATE_KEY = `0x${PRIVATE_KEY}`;
}

const RPC_URL = process.env.RPC_URL || "https://sepolia.base.org";

console.log("=".repeat(70));
console.log("ArkiVendor API Test Client");
console.log("=".repeat(70));
console.log("[client] Using private key:", PRIVATE_KEY ? `${PRIVATE_KEY.slice(0, 6)}...${PRIVATE_KEY.slice(-4)}` : "NOT SET");
console.log("[client] API Base URL:", API_BASE_URL);
console.log();

if (!PRIVATE_KEY || PRIVATE_KEY === "0x") {
  console.error("❌ Error: CLIENT_PRIVATE_KEY not set in environment variables");
  process.exit(1);
}

// Create a wallet client
const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`, {
  nonceManager, // Prevent nonce collisions
});

console.log("[client] Using account address:", account.address);

const client = createWalletClient({
  account,
  transport: http(RPC_URL),
  chain: baseSepolia,
});

// Wrap the fetch function with payment handling
const fetchWithPay = wrapFetchWithPayment(fetch, client);

// Helper function to make API requests
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`\n→ ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetchWithPay(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Error ${response.status}:`, data);
      throw new Error(`API Error: ${response.status}`);
    }

    console.log(`✓ Success (${response.status})`);
    return data;
  } catch (error: any) {
    console.error("❌ Request failed:", error.message);
    throw error;
  }
}

// Test runner
async function runTests() {
  let createdEntityKey: string | null = null;

  try {
    // Test 1: Health Check
    console.log("\n" + "=".repeat(70));
    console.log("Test 1: Health Check");
    console.log("=".repeat(70));

    const health = await apiRequest("/", { method: "GET" });
    console.log("Response:", health);

    // Test 2: Create Entity
    console.log("\n" + "=".repeat(70));
    console.log("Test 2: Create Entity");
    console.log("=".repeat(70));

    const createPayload = {
      payload: Buffer.from("Hello from test client!").toString("hex"),
      content_type: "text/plain",
      attributes: {
        type: "test",
        created_by: "test-client",
        timestamp: Date.now(),
      },
      ttl: 86400, // 1 day
    };

    const createResponse = await apiRequest("/entities", {
      method: "POST",
      body: JSON.stringify(createPayload),
    });

    console.log("Created entity key:", createResponse.entity_key);
    console.log("Transaction hash:", createResponse.tx_hash);
    createdEntityKey = createResponse.entity_key;

    // Wait a bit for the transaction to be processed
    console.log("\n⏳ Waiting 3 seconds for transaction to process...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Test 3: Read Entity
    console.log("\n" + "=".repeat(70));
    console.log("Test 3: Read Entity");
    console.log("=".repeat(70));

    const readResponse = await apiRequest(`/entities/${createdEntityKey}`, {
      method: "GET",
    });

    console.log("Data:", readResponse.data);
    console.log("Entity details:");
    console.log("  Key:", readResponse.entity.key);
    console.log("  Owner:", readResponse.entity.owner);
    console.log("  Content-Type:", readResponse.entity.content_type);
    console.log("  Attributes:", readResponse.entity.attributes);

    // Test 4: Update Entity
    console.log("\n" + "=".repeat(70));
    console.log("Test 4: Update Entity");
    console.log("=".repeat(70));

    const updatePayload = {
      attributes: {
        type: "test",
        created_by: "test-client",
        timestamp: Date.now(),
        updated: true,
        version: 2,
      },
    };

    const updateResponse = await apiRequest(`/entities/${createdEntityKey}`, {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    });

    console.log("Update status:", updateResponse.status);
    console.log("Transaction hash:", updateResponse.tx_hash);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Test 5: Query Entities
    console.log("\n" + "=".repeat(70));
    console.log("Test 5: Query Entities");
    console.log("=".repeat(70));

    const queryResponse = await apiRequest(
      '/entities/query?query=type = "test"&limit=10&include_payload=false',
      {
        method: "GET",
      }
    );

    console.log("Query:", queryResponse.query);
    console.log("Results count:", queryResponse.count);
    console.log("Results:", JSON.stringify(queryResponse.results, null, 2));

    // Test 6: Query with Payload
    console.log("\n" + "=".repeat(70));
    console.log("Test 6: Query with Payload");
    console.log("=".repeat(70));

    const queryWithPayloadResponse = await apiRequest(
      '/entities/query?query=created_by = "test-client"&limit=5&include_payload=true',
      {
        method: "GET",
      }
    );

    console.log("Query:", queryWithPayloadResponse.query);
    console.log("Results count:", queryWithPayloadResponse.count);
    if (queryWithPayloadResponse.results.length > 0) {
      console.log("First result:", queryWithPayloadResponse.results[0]);
    }

    // Test 7: Transfer Ownership (optional - needs second wallet)
    const TRANSFER_TO_ADDRESS = process.env.TRANSFER_TO_ADDRESS;
    if (TRANSFER_TO_ADDRESS) {
      console.log("\n" + "=".repeat(70));
      console.log("Test 7: Transfer Ownership");
      console.log("=".repeat(70));

      // Create a separate entity for transfer test
      console.log("Creating entity for transfer test...");
      const transferEntityPayload = {
        payload: Buffer.from("Entity for transfer test").toString("hex"),
        content_type: "text/plain",
        attributes: {
          type: "transfer-test",
          created_by: "test-client",
        },
        ttl: 86400,
      };

      const transferEntityResponse = await apiRequest("/entities", {
        method: "POST",
        body: JSON.stringify(transferEntityPayload),
      });

      const transferEntityKey = transferEntityResponse.entity_key;
      console.log("Created transfer entity:", transferEntityKey);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Now transfer it
      const transferPayload = {
        entity_key: transferEntityKey,
        new_owner: TRANSFER_TO_ADDRESS,
      };

      const transferResponse = await apiRequest("/entities/transfer", {
        method: "POST",
        body: JSON.stringify(transferPayload),
      });

      console.log("Transfer status:", transferResponse.status);
      console.log("Old owner:", transferResponse.old_owner);
      console.log("New owner:", transferResponse.new_owner);
      console.log("Transaction hash:", transferResponse.tx_hash);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("Note: Transferred entity cannot be deleted by backend (ownership changed)");
    } else {
      console.log("\n⊘ Skipping Test 7: Transfer Ownership (TRANSFER_TO_ADDRESS not set)");
    }

    // Test 8: Delete Entity
    console.log("\n" + "=".repeat(70));
    console.log("Test 8: Delete Entity");
    console.log("=".repeat(70));

    const deleteResponse = await apiRequest(`/entities/${createdEntityKey}`, {
      method: "DELETE",
    });

    console.log("Delete status:", deleteResponse.status);
    console.log("Transaction hash:", deleteResponse.tx_hash);

    // Test 9: Create Multiple Entities for Query Testing
    console.log("\n" + "=".repeat(70));
    console.log("Test 9: Create Multiple Entities");
    console.log("=".repeat(70));

    const testEntities = [
      { name: "Alice", age: 25, role: "developer" },
      { name: "Bob", age: 30, role: "designer" },
      { name: "Charlie", age: 35, role: "manager" },
    ];

    const createdKeys: string[] = [];

    for (const user of testEntities) {
      const payload = {
        payload: Buffer.from(JSON.stringify(user)).toString("hex"),
        content_type: "application/json",
        attributes: {
          type: "user",
          name: user.name,
          age: user.age,
          role: user.role,
        },
        ttl: 86400,
      };

      const response = await apiRequest("/entities", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log(`✓ Created entity for ${user.name}:`, response.entity_key);
      createdKeys.push(response.entity_key);

      // Small delay between creations
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Test 10: Advanced Queries
    console.log("\n" + "=".repeat(70));
    console.log("Test 10: Advanced Queries");
    console.log("=".repeat(70));

    // Query by type
    const userQuery = await apiRequest(
      '/entities/query?query=type = "user"&limit=10',
      { method: "GET" }
    );
    console.log('Query: type = "user"');
    console.log("Results:", userQuery.count);

    // Query with comparison
    const ageQuery = await apiRequest(
      '/entities/query?query=age > 28&limit=10',
      { method: "GET" }
    );
    console.log('\nQuery: age > 28');
    console.log("Results:", ageQuery.count);

    // Query with AND
    const complexQuery = await apiRequest(
      '/entities/query?query=type = "user" AND age >= 30&limit=10',
      { method: "GET" }
    );
    console.log('\nQuery: type = "user" AND age >= 30');
    console.log("Results:", complexQuery.count);

    // Cleanup
    console.log("\n" + "=".repeat(70));
    console.log("Cleanup: Deleting test entities");
    console.log("=".repeat(70));

    for (const key of createdKeys) {
      await apiRequest(`/entities/${key}`, { method: "DELETE" });
      console.log(`✓ Deleted entity: ${key.substring(0, 16)}...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Final Summary
    console.log("\n" + "=".repeat(70));
    console.log("✓ All Tests Completed Successfully!");
    console.log("=".repeat(70));
    console.log("\nTests executed:");
    console.log("  1. Health check");
    console.log("  2. Create entity");
    console.log("  3. Read entity");
    console.log("  4. Update entity");
    console.log("  5. Query entities");
    console.log("  6. Query with payload");
    if (TRANSFER_TO_ADDRESS) {
      console.log("  7. Transfer ownership");
    }
    console.log("  8. Delete entity");
    console.log("  9. Create multiple entities");
    console.log("  10. Advanced queries");
    console.log("  11. Cleanup");
    console.log();

  } catch (error: any) {
    console.error("\n" + "=".repeat(70));
    console.error("❌ Test Failed");
    console.error("=".repeat(70));
    console.error("Error:", error.message);
    console.error();
    process.exit(1);
  }
}

// Run tests
runTests().then(() => {
  console.log("Test client finished successfully");
  process.exit(0);
}).catch((error) => {
  console.error("Test client failed:", error);
  process.exit(1);
});
