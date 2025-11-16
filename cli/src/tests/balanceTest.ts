import { filter, map } from "rxjs"
import { createStakingSdk } from "@polkadot-api/sdk-staking"
import { createClient } from "polkadot-api"
import { getSmProvider } from "polkadot-api/sm-provider"
import { polkadot, polkadot_asset_hub } from "polkadot-api/chains"
import { start } from "polkadot-api/smoldot"
import { dot } from "@polkadot-api/descriptors"

async function testBalance() {

  const smoldot = start()
  const chain = await smoldot.addChain({ chainSpec: polkadot }).then((relay) =>
    smoldot.addChain({
      chainSpec: polkadot_asset_hub,
      potentialRelayChains: [relay],
    }),
  )
  const client = createClient(getSmProvider(chain))
  const typedApi = client.getTypedApi(dot)
  const stakingSdk = createStakingSdk(client)

  console.log("Subscribing to account status...")

  const subscription = stakingSdk
    .getAccountStatus$("12aweZ5yqNHoKHG6yBQhWyY9mxvVpwQ4FNTQ18PPTvFbX2NE")
    .pipe(
      filter(({ balance }) => balance.locked > 0n),
      map(({ balance, nomination }) => ({
        spendable: balance.spendable,
        currentBond: nomination.currentBond,
      })),
    )
    .subscribe({
      next: (status) => {
        console.log("Updated status", status)
        // Cleanup after receiving first result
        subscription.unsubscribe()
        client.destroy()
        smoldot.terminate()
        console.log("Test complete!")
      },
      error: (err) => {
        console.error("Error:", err)
        subscription.unsubscribe()
        client.destroy()
        smoldot.terminate()
        process.exit(1)
      }
    })

  // Set a timeout in case no data is received
  setTimeout(() => {
    console.log("Timeout - no data received")
    subscription.unsubscribe()
    client.destroy()
    smoldot.terminate()
    process.exit(0)
  }, 30000) // 30 seconds

}

testBalance().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
