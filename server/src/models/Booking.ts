import mongoose, { Schema, Document, Types } from "mongoose";

export type BookingStatus = "pending" | "accepted" | "rejected" | "in_progress" | "completed" | "cancelled";

export interface BookingDocument extends Document {
  userId: Types.ObjectId;
  providerId: Types.ObjectId;
  
  // Service details
  serviceType: string;
  description: string;
  preferredDate: Date;
  preferredTime: string;
  urgency: "low" | "normal" | "high";
  budget?: number;
  address: string;
  contactPhone?: string;
  
  // New fields for User Booking Panel
  serviceCategory?: string;
  duration?: string;
  durationValue?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  skillTags?: string[];
  insuranceRequired?: boolean;
  backgroundCheckRequired?: boolean;
  basePrice?: number;
  surgeMultiplier?: number;
  insuranceCost?: number;
  
  // Workflow fields
  status: BookingStatus;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  startedAt?: Date;
  completedAt?: Date;
  
  // Provider response
  providerNotes?: string;
  estimatedDuration?: string;
  finalAmount?: number;
  
  // Payment fields
  amount: number; // smallest currency unit
  currency: string;
  paymentIntentId?: string;
  clientSecret?: string;
  
  // Rating and review
  rating?: number;
  review?: string;
  reviewedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<BookingDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
    
    // Service details
    serviceType: { type: String, required: true },
    description: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    urgency: { type: String, enum: ["low", "normal", "high"], default: "normal" },
    budget: { type: Number },
    address: { type: String, required: true },
    contactPhone: { type: String },
    
    // New fields for User Booking Panel
    serviceCategory: { type: String },
    duration: { type: String },
    durationValue: { type: Number },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    skillTags: [{ type: String }],
    insuranceRequired: { type: Boolean, default: false },
    backgroundCheckRequired: { type: Boolean, default: false },
    basePrice: { type: Number },
    surgeMultiplier: { type: Number, default: 1 },
    insuranceCost: { type: Number, default: 0 },
    
    // Workflow fields
    status: { 
      type: String, 
      enum: ["pending", "accepted", "rejected", "in_progress", "completed", "cancelled"], 
      default: "pending", 
      index: true 
    },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
    
    // Provider response
    providerNotes: { type: String },
    estimatedDuration: { type: String },
    finalAmount: { type: Number },
    
    // Payment fields
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "inr" },
    paymentIntentId: { type: String },
    clientSecret: { type: String },
    
    // Rating and review
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, maxlength: 500 },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for better query performance
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ providerId: 1, status: 1 });
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ preferredDate: 1 });

export const BookingModel = mongoose.model<BookingDocument>("Booking", BookingSchema);


