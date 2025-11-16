import { createClient } from "polkadot-api"
import { getWsProvider } from "polkadot-api/ws-provider/node"
import { dot as polkadot } from "@polkadot-api/descriptors"

async function querySystemAccount() {
  // Create a WebSocket provider - replace with your chain's endpoint
  const wsProvider = getWsProvider("wss://rpc.polkadot.io")

  // Create the client
  const client = createClient(wsProvider)

  // Get the typed API for Polkadot
  const typedApi = client.getTypedApi(polkadot)

  // Replace with the stash address you want to query
  const stashAddress = "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5"

  try {
    // Query System.Account for the given address
    const account = await typedApi.query.System.Account.getValue(stashAddress)

    console.log("Account data for:", stashAddress)
    console.log("Account:", account)
    console.log("\nFree balance:", account.data.free)
    console.log("Reserved balance:", account.data.reserved)
    console.log("Nonce:", account.nonce)

  } catch (error) {
    console.error("Error querying account:", error)
  } finally {
    // Clean up
    client.destroy()
  }
}

// Run the query
querySystemAccount()
