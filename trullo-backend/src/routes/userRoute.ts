import express, {Request, Response} from 'express';
import userCrud from '../dbCrud/userCrud.ts'
import bcrypt from "bcrypt";
import {UserInterface} from '../model/User';


const router = express.Router();

interface ErrorResponse {
  message: string;
  error: string;
}

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