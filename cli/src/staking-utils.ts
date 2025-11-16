import type { StakingSdk, AccountStatus } from "@polkadot-api/sdk-staking"
import type { TypedApi } from "polkadot-api"
import type { dot } from "@polkadot-api/descriptors"

export interface StashInfo {
  balance: {
    total: string
    spendable: string
    locked: string
    untouchable: string
  }
  activeEra: {
    index: number
    start: string
  }
}

/**
 * Retrieves stash account information including balance and active era details
 * @param stakingSdk - The StakingSdk instance
 * @param typedApi - The TypedApi instance for querying chain state
 * @param stashAddress - The stash account address to query
 * @returns Promise containing stash balance and active era information
 */
export async function getStashInfo(
  stakingSdk: StakingSdk,
  typedApi: TypedApi<typeof dot>,
  stashAddress: string
): Promise<StashInfo> {
  // Get account status (returns Observable, so we convert to Promise)
  const status = await new Promise<AccountStatus>((resolve, reject) => {
    const sub = stakingSdk.getAccountStatus$(stashAddress).subscribe({
      next: (value) => {
        sub.unsubscribe()
        resolve(value)
      },
      error: reject,
    })
  })

  // Get active era information from the chain
  const activeEraData = await typedApi.query.Staking.ActiveEra.getValue()

  if (!activeEraData) {
    throw new Error("Active era data not available")
  }

  return {
    balance: {
      total: status.balance.total.toString(),
      spendable: status.balance.spendable.toString(),
      locked: status.balance.locked.toString(),
      untouchable: status.balance.untouchable.toString(),
    },
    activeEra: {
      index: activeEraData.index,
      start: activeEraData.start?.toString() ?? "0",
    },
  }
}
