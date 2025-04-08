import { NextFunction, Request, Response } from "express";

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: "No admin token found" });
  }
  next();
};

export default isAdmin;
