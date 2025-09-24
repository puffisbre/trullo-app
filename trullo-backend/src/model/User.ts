import mongoose, { Schema, InferSchemaType } from "mongoose";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true },
        password: {type: String, required: true, minLength: 8}
    },
    { timestamps: true, collection: "users" }
);

export type UserInterface = InferSchemaType<typeof userSchema>

export const User = mongoose.model("User", userSchema, "users");