interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    photoPath: string | null;
    isEmailConfirmed: Boolean;
    confirmationToken: string | null;
    resetToken: string | null;
    resetTokenExpiration: Date | null;
    generateAuthToken: () => string;
    generateConfirmationToken: () => string;
}

export default IUser;
