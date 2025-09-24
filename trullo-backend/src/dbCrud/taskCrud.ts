import {Task, TaskInterface} from '../model/Task'
import {Types} from 'mongoose'

const getTasks = async () => {
    return Task.find().lean();
}

const createTask = async (taskData: TaskInterface) => {
    return Task.create(taskData);
}

const updateTask = async (id: string | Types.ObjectId, taskData: TaskInterface) => {
    const payload = {...taskData};

    return await Task.findByIdAndUpdate(id, payload, {new: true, runValidators: true})
}

const deleteTask = async (id: string | Types.ObjectId) => {
    return await Task.findByIdAndDelete(id);
}

export default {getTasks, createTask, updateTask, deleteTask};
