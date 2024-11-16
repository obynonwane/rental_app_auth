import { UserType } from "../_enums/user-type.enum";

export class CreateStaffDto {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    name: string;
    password: string;
    role: string;
}



export default CreateStaffDto;