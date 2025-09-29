import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

//sub: Subject, who the token belongs to
//iat: Issued at, when token was created
//exp: Expiration time, when token is expired

interface JwtPayLoad {
    sub: string,
    email: string,
    iat: number,
    exp: number
}

const authUser = async (req: Request & { user?: { id: string; email: string } }, res: Response, next: NextFunction) => {
 const header = req.headers.authorization;
 const bearer = header?.startsWith("Bearer ") ? header.slice(7): undefined;
 const token = req.cookies?.token || bearer;

 if(!token) return res.status(401).json({message: "Not authenticated"});

 try{
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayLoad;
    req.user = {id: payload.sub, email: payload.email};
    next();
 }catch{
    return res.status(401).json({message: "Invalid or expired token"})
 }
}

export default authUser;