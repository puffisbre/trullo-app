import {Request, Response} from 'express';
import mongoose from 'mongoose';
import userCrud from '../dbCrud/taskCrud.ts'
import taskCrud from '../dbCrud/taskCrud.ts';

export async function getAllTasks(req: Request & {user?: {id: string; email: string}}, res: Response) {
    try{
        const allTasks = await taskCrud.getTasks(req.user!.id);
        return res.status(200).json(allTasks);
    }catch (error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(400).json({message: "Couldn't get tasks", error: errorMessage});
    }
}

export async function getTasksByID(req: Request, res: Response) {
    try {
        const { userId } = req.params;
        if (!mongoose.isValidObjectId(userId)) {
          return res.status(400).json({ message: "Invalid user id", error: "Bad ObjectId" });
        }
        const tasks = await taskCrud.getTasksByUserID({ assignedTo: userId });
        return res.status(200).json(tasks);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message: "Couldn't get tasks", error: errorMessage });
      }
}

export async function addTask(req: Request, res: Response) {
    try {
        const {title, status, assignedTo, description} = req.body;
        if(!title || !status || !assignedTo){
            throw new Error("Either title, status or assignedTo is missing. All is required to post!");
        }

        // Ensure assignedTo is an array
        const assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

        const now = new Date();
         let finishedAt = req.body.finishedAt;
    if (finishedAt === '' || finishedAt === 'null' || finishedAt === undefined) {
      finishedAt = null;
    }else if (finishedAt === 'done'){
        finishedAt === now
    }
        const newTask = await taskCrud.createTask({
            title,
            description,
            status,
            assignedTo: assignedToArray,
            finishedAt,
            createdAt: now,
            updatedAt: now
        })

        return res.status(200).json(newTask);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(400).json({message:"Couldn't create task", error: errorMessage});
    }
}

export async function updateTask(req: Request, res: Response) {
    try{
        console.log('Updating task:', req.params.id, 'with data:', req.body);
        const updateTask = await taskCrud.updateTask(req.params.id, req.body);
        if(!updateTask){
            return res.status(404).json({message: "Task not found", error: "Task not found"});
        }
        return res.status(200).json(updateTask);
    }catch (error){
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error updating task:', error);
        return res.status(400).json({message: "Couldnt update task", error: errorMessage})
    }
}

export async function deleteTask(req: Request, res: Response){
    try {
        const deleteTask = await userCrud.deleteTask(req.params.id);
        if(!deleteTask){
            return res.status(404).json({message:"Task not found", error: "Task not found"});
        }
        return res.status(200).json(deleteTask); 
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(400).json({message:"Couldn't delete task", error: errorMessage});
    }
}