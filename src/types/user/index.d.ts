interface IUser {
    id: String;
    firstName: String;
    lastName: String;
    email: String;
    phoneNumber: String;
    password: string;
    generateAuthToken: () => String;
}

export default IUser;
