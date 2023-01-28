declare namespace Express {
    interface Request {
        currentUser?: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string;
            isEmailConfirmed: Boolean;
            password: string;
        };
    }
}
