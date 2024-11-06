export enum UserType {
    // PRODUCT_OWNER = "product_owner",
    // RENTER = "renter",
    // PRODUCT_OWNER_STAFF = "product_owner_staff",
    // ADMIN = "admin",
    // SUPER_ADMIN = "super_admin"

    PARTICIPANT = "participant",
    PATICIPANT_STAFF = "participant_staff",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}

// may above enums into an array
export const UserTypeArray: UserType[] = Object.values(UserType);