import { createStakingSdk } from "@polkadot-api/sdk-staking"
import { createClient } from "polkadot-api"
import { getSmProvider } from "polkadot-api/sm-provider"
import { polkadot, polkadot_asset_hub } from "polkadot-api/chains"
import { start } from "polkadot-api/smoldot"
import { dot } from "@polkadot-api/descriptors"

async function testStaking() {
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

  try {
    const activeEra = await typedApi.query.Staking.ActiveEra.getValue()
    const prevEra = activeEra!.index - 1
    const { validators, totalRewards, totalBond } =
      await stakingSdk.getEraValidators(prevEra)

    console.log("Validators in era", prevEra)
    validators.forEach((validator) => {
      console.log(validator.address, validator.reward.toString())
    })
    console.log("Era reward pool:", totalRewards.toString())
    console.log("Total active bond:", totalBond.toString())
  } catch (error) {
    console.error("Error:", error)
  } finally {
    client.destroy()
  }
}

testStaking()