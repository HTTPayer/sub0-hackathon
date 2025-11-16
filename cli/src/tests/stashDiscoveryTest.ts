import { dot } from "@polkadot-api/descriptors"
import { createClient } from "polkadot-api"
import { getSmProvider } from "polkadot-api/sm-provider"
import { start } from "polkadot-api/smoldot"
import { polkadot, polkadot_asset_hub } from "polkadot-api/chains"
import { createStakingSdk } from "@polkadot-api/sdk-staking"
import { getStashInfo } from "../staking-utils.js"

async function discoverAndQueryStashes() {
  const smoldot = start()
  const chain = await smoldot.addChain({ chainSpec: polkadot }).then((relay) =>
    smoldot.addChain({
      chainSpec: polkadot_asset_hub,
      potentialRelayChains: [relay],
    }),
  )
  const client = createClient(getSmProvider(chain))
  const api = client.getTypedApi(dot)
  const stakingSdk = createStakingSdk(client)

  try {
    // Get active era
    const activeEra = await api.query.Staking.ActiveEra.getValue()
    console.log("activeEra:", activeEra)
    const currentEra = activeEra!.index

    console.log(`Current era: ${currentEra}`)

    // Method 1: Get validators from previous era using staking SDK
    const prevEra = currentEra - 1
    const { validators } = await stakingSdk.getEraValidators(prevEra)

    console.log(`\nFound ${validators.length} validators in era ${prevEra}`)

    // Get stash addresses (validators array contains stash addresses)
    const stashAddresses = validators.map(v => v.address)

    // Display first 10 stashes
    console.log("\nFirst 10 stash addresses:")
    stashAddresses.slice(0, 10).forEach((stash, i) => {
      console.log(`${i + 1}. ${stash}`)
    })

    // Query account info for the first stash
    if (stashAddresses.length > 0) {
      const firstStash = stashAddresses[0]
      console.log(`\n--- Querying account info for ${firstStash} ---`)

      const accountInfo = await api.query.System.Account.getValue(firstStash)
      console.log("Account data:", {
        free: accountInfo.data.free.toString(),
        reserved: accountInfo.data.reserved.toString(),
        frozen: accountInfo.data.frozen.toString(),
        nonce: accountInfo.nonce
      })

      // Get staking info for the stash
      const controller = await api.query.Staking.Bonded.getValue(firstStash)
      if (controller) {
        console.log(`Controller address: ${controller}`)
      }

      // Get validator preferences
      const prefs = await api.query.Staking.Validators.getValue(firstStash)
      if (prefs) {
        console.log("Validator preferences:", {
          commission: prefs.commission,
          blocked: prefs.blocked,
        })
      }

      // Get nominator info (if this stash is also nominating)
      const nominations = await api.query.Staking.Nominators.getValue(firstStash)
      if (nominations) {
        console.log("Nominations:", {
          targets: nominations.targets,
          submitted_in: nominations.submitted_in,
          suppressed: nominations.suppressed,
        })
      }

      // Use staking SDK for more detailed info
      const stashInfo = await getStashInfo(stakingSdk, api, firstStash)

      console.log("Stash info:", stashInfo)
    }

    // Method 2: Get current validators directly
    console.log("\n--- Current Session Validators ---")
    const sessionValidators = await api.query.Session.Validators.getValue()
    console.log(`Current validators count: ${sessionValidators.length}`)
    console.log("First 5:", sessionValidators.slice(0, 5))

  } catch (error) {
    console.error("Error:", error)
  } finally {
    client.destroy()
    smoldot.terminate()
    console.log("\nCleanup complete")
  }
}

discoverAndQueryStashes().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
