import express from 'express';
import {
  getAllUsers,
  signUp,
  signIn,
  signOut,
  updateUser,
  deleteUser
} from '../controllers/userControllers'


const router = express.Router();

router.get("/", getAllUsers);
router.post("/signup", signUp);
router.post("/login", signIn);
router.post("/logout", signOut)
router.put("/:id", updateUser);
router.delete("/:id", deleteUser)



export default router;