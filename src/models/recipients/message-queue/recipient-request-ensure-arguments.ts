

export interface TransactionId {
    type: string
    value: string
}

export interface RecipientRequestEnsureArguments {
    userHash: string
    wId: string
    metaData: any
    tags: any
    uProfile: any
    transactionId: TransactionId
}