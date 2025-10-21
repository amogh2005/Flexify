import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "admin" | "user" | "provider";

export interface UserDocument extends Document {
	name: string;
	email: string;
	phone?: string;
	passwordHash: string;
	role: UserRole;
	blocked: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true, index: true },
		phone: { type: String },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ["admin", "user", "provider"], required: true },
		blocked: { type: Boolean, default: false, index: true },
	},
	{ timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);


