import express, {Request, Response} from 'express';
import userCrud from '../dbCrud/userCrud.ts'
import bcrypt from "bcrypt";
import {UserInterface} from '../model/User';
import {User} from '../model/User.ts'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


export async function getAllUsers (req: Request, res: Response) {
    try {
        const allUsers = await userCrud.getUsers();
        return res.status(200).json(allUsers);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(400).json({message:"Couldn't get users", error: errorMessage});
    }
}

export async function signUp (req: Request, res: Response) {
    try {
        const {name, email, password} = req.body;
         if(!name || !email || !password){
            throw new Error("Either name, email or password is missing. All is required to post!");
        }
    
        let uniqueEmail = await User.findOne({email});
        if (uniqueEmail) {
        return res.status(409).json({message:"User with that email is already registered", error: "User with that email is already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date();
        const newUser = await userCrud.createUser({
          name,
          email,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now
        });
        return res.status(200).json(newUser)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(400).json({message:"Couldn't create user", error: errorMessage});
      }
}

export async function signIn(req: Request, res: Response){
    try {
        const {email, password} = req.body;
        let exsistingUser = await User.findOne({email}).select("+password");
        if(!exsistingUser){
            return res.status(404).json({message:"User not found"});
        }
    
           const ok = await bcrypt.compare(password, exsistingUser.password);
          if (!ok) {
           return res.status(400).json({message:"Couldn't login user"});
          }
    
        
       const token = jwt.sign(
            { sub: exsistingUser.id, email: exsistingUser.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
          );
    
           
        // Cookie configuration for cross-domain (production)
        const isProduction = process.env.NODE_ENV === "production" || process.env.PORT !== undefined;
        res.cookie("token", token, {
          httpOnly: true,
          secure: isProduction, // true for HTTPS in production
          sameSite: isProduction ? "none" : "lax", // "none" allows cross-domain cookies
          maxAge: 60 * 60 * 1000, // 1 hour
          domain: isProduction ? undefined : undefined, // Let browser handle domain
          path: "/"
        });
        return res.status(200).json({
            user: { 
                _id: exsistingUser.id, 
                email: exsistingUser.email, 
                name: exsistingUser.name 
            },
            token
          });
       } catch (error) {
          return res.status(500).json({
            message: "Couldn't login user",
          });
        }
}

export async function signOut(req: Request, res: Response) {
    try {
        // Cookie configuration for cross-domain (production)
        const isProduction = process.env.NODE_ENV === "production" || process.env.PORT !== undefined;
        res.clearCookie("token", {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          path: "/"
        });
        return res.status(200).json({ message: "Logged out" });
      } catch (error) {
        return res
        .status(500)
        .json({ error, message: "Internal server error during logout" });
      }
}

export async function updateUser(req: Request, res: Response){
    try {
        const updateUser = await userCrud.updateUser(req.params.id, req.body);
        if (!updateUser) {
           return res.status(404).json({message:"User not found", error: "User not found"});
        }
        return res.status(200).json(updateUser);   
       } catch (error) {
           const errorMessage = error instanceof Error ? error.message : String(error);
       return res.status(400).json({message:"Couldn't update user", error: errorMessage});
       }
}

export async function deleteUser(req: Request, res: Response){
    try {
        const deleteUser = await userCrud.deleteUser(req.params.id);
        if(!deleteUser){
            return res.status(404).json({message:"User not found", error: "User not found"});
        }
        return res.status(200).json(deleteUser); 
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(400).json({message:"Couldn't delete user", error: errorMessage});
    }
}