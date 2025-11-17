import express from 'express'
import { 
    addTask, 
    deleteTask, 
    getAllTasks, 
    getTasksByID, 
    updateTask } 
    from '../controllers/taskControllers';

const router = express.Router();

router.get("/", getAllTasks);
router.get("/:id", getTasksByID);
router.post("/", addTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask)


export default router;