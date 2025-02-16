export enum KycType {
    RENTER = "renter",
    BUSINESS = "business",
}

// may above enums into an array
export const KycTypeArray: KycType[] = Object.values(KycType);