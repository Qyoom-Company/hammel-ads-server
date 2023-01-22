declare namespace Express {
    interface Request {
        currentUser?: {
            id?: String;
            firstName?: String;
            lastName?: String;
            email?: String;
            phoneNumber?: String;
            password?: string;
        };
    }
}
