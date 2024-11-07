export enum UserType {
    PARTICIPANT = "participant",
    PARTICIPANT_STAFF = "participant_staff",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}

// may above enums into an array
export const UserTypeArray: UserType[] = Object.values(UserType);