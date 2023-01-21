import { NextFunction, Request, Response } from "express";

const test = (req: Request, res: Response, next: NextFunction) => {
    console.log(req);
    next();
};

export default test;
