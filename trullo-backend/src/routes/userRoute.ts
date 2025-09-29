import express, {Request, Response} from 'express';
import userCrud from '../dbCrud/userCrud.ts'
import bcrypt from "bcrypt";
import {UserInterface} from '../model/User';
import {User} from '../model/User.ts'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const router = express.Router();

interface ErrorResponse {
  message: string;
  error: string;
}

interface LoginError{
  message: string
}

interface LoginSuccess { 
  userId: string; 
  email: string; 
  token: string 
};
type LoginResponse = { data: LoginSuccess } | LoginError;

router.get("/", async (req: Request, res: Response<UserInterface[] | ErrorResponse>) => {
try {
    const allUsers = await userCrud.getUsers();
    return res.status(200).json(allUsers);
} catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(400).json({message:"Couldn't get users", error: errorMessage});
}
})

router.post("/", async (req: Request, res: Response<UserInterface | ErrorResponse>) => {
    
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
})

router.post("/login", async (req: Request, res: Response<LoginResponse>) => {
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

       
    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000
  });
    return res.status(200).json({
        data: { userId: exsistingUser.id, email: exsistingUser.email, token }
      });
   } catch (error) {
      return res.status(500).json({
        message: "Couldn't login user",
      });
    }
})

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  return res.status(200).json({ message: "Logged out" });
});

router.put("/:id", async (req: Request, res: Response<UserInterface | ErrorResponse>)=>{
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
});


router.delete("/:id", async(req: Request, res: Response<UserInterface | ErrorResponse>) => {
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
})

export default router;