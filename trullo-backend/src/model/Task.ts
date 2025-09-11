import mongoose, { Schema, HydratedDocument } from "mongoose";


interface TaskInterface {
    title: String,
    description: String,
    status: 'to-do' | 'in progress' | 'blocked' | 'done',
    assignedTo: typeof Schema.Types.ObjectId
    finishedAt: Date | null
}



const taskSchema = new Schema<TaskInterface>(
    {
        title: {type: String, required: true, trim: true},
        description: {type: String, required: true},
        status: {type: String, enum: ['to-do','in progress','blocked','done'], required: true },
        assignedTo: {type: Schema.ObjectId, default: null, required: true},
        finishedAt: {type: Date, default: null},
    },
    { timestamps: true, collection: "tasks" }
);

taskSchema.path("finishedAt").validate(function (
    this: HydratedDocument<TaskInterface>,
    value: Date | null
  ) {
    if (this.status_enum === "done") return value instanceof Date;
    return value == null;
  }, "finishedAt måste vara satt om status är 'done', annars null");

export const Task = mongoose.model("Task", taskSchema, "tasks");
