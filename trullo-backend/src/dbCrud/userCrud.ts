import {User, UserInterface} from '../model/User';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt'

const getUsers = async () => {
    return User.find().lean();
}

const createUser = async (userData: UserInterface) => {
    return User.create(userData);
}

const updateUser = async (id: string | Types.ObjectId, userData: UserInterface) => {
     const payload = {...userData};

      if (typeof payload.password === "string" && payload.password.trim()) {
        payload.password = await bcrypt.hash(payload.password, 10);
       }

 return await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

const deleteUser = async(id: string | Types.ObjectId) => {
    return await User.findByIdAndDelete(id);
}

export default {getUsers, createUser, updateUser, deleteUser};