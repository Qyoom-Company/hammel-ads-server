interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    isEmailConfirmed: Boolean;
    confirmationToken: string | null;
    resetToken: string | null;
    resetTokenExpiration: Date | null;
    generateAuthToken: () => String;
}

export default IUser;
