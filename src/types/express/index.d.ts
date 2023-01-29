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
            photoPath: string | null;
            isAdmin: Boolean;
        };
    }
}
