import { UserType } from "../_enums/user-type.enum";

export class CreateUserDto {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    name: string;
    password: string;
    role: string;
    is_business: string;
}



export default CreateUserDto;