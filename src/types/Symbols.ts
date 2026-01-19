export interface Symbols {
    timezone: string
    serverTime: number
    rateLimits: RateLimit[]
    symbols: Symbol[]
}

export interface RateLimit {
    rateLimitType: string
    interval: string
    intervalNum: number
    limit: number
}

export interface Symbol {
    symbol: string
    status: string
    baseAsset: string
    baseAssetPrecision: number
    quoteAsset: string
    quotePrecision: number
    quoteAssetPrecision: number
    baseCommissionPrecision: number
    quoteCommissionPrecision: number
    orderTypes: string[]
    icebergAllowed: boolean
    ocoAllowed: boolean
    otoAllowed: boolean
    opoAllowed: boolean
    quoteOrderQtyMarketAllowed: boolean
    allowTrailingStop: boolean
    cancelReplaceAllowed: boolean
    amendAllowed: boolean
    pegInstructionsAllowed: boolean
    isSpotTradingAllowed: boolean
    isMarginTradingAllowed: boolean
    filters: Filter[]
    permissionSets: string[][]
    defaultSelfTradePreventionMode: string
    allowedSelfTradePreventionModes: string[]
}

export interface Filter {
    filterType: string
    minPrice?: string
    maxPrice?: string
    tickSize?: string
    minQty?: string
    maxQty?: string
    stepSize?: string
    limit?: number
    minTrailingAboveDelta?: number
    maxTrailingAboveDelta?: number
    minTrailingBelowDelta?: number
    maxTrailingBelowDelta?: number
    bidMultiplierUp?: string
    bidMultiplierDown?: string
    askMultiplierUp?: string
    askMultiplierDown?: string
    avgPriceMins?: number
    minNotional?: string
    applyMinToMarket?: boolean
    maxNotional?: string
    applyMaxToMarket?: boolean
    maxNumOrders?: number
    maxNumOrderLists?: number
    maxNumAlgoOrders?: number
    maxNumOrderAmends?: number
    maxPosition?: string
}
