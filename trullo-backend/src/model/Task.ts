import mongoose, { Schema, HydratedDocument, InferSchemaType } from "mongoose";


const taskSchema = new Schema(
    {
        title: {type: String, required: true, trim: true},
        description: {type: String, required: true},
        status: {type: String, enum: ['to-do','in progress','blocked','done'], required: true },
        assignedTo: {type: Schema.ObjectId, default: null, required: true},
        finishedAt: {type: Schema.Types.Mixed, default: null},
    },
    { timestamps: true, collection: "tasks" }
);

//Middlewares for checking status. If its done it sets finished at this date. If its not finished its set to null.

taskSchema.pre('validate', function (next) {
  if (this.status === 'done') {
    if (!this.finishedAt) this.finishedAt = new Date(); 
  } else {
    this.finishedAt = null; 
  }
  next();
});

//Also middleware, but this one checks when we are updating the task. So it checks if ive changed the status and then updates finished at accordingly.

taskSchema.pre('findOneAndUpdate', function (next) {
  const u: any = this.getUpdate() || {};
  const set = (u.$set ??= {});
  const status = set.status ?? u.status;

  if (status === undefined) return next();

  if (status === 'done') {
    if (set.finishedAt === undefined && u.finishedAt === undefined) {
      set.finishedAt = new Date();
    }
    if (u.$unset) delete u.$unset.finishedAt;
  } else {
    set.finishedAt = null;
  }

  next();
});

  
export type TaskInterface = InferSchemaType<typeof taskSchema>
export const Task = mongoose.model("Task", taskSchema, "tasks");
