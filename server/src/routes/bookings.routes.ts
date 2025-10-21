import { Router } from "express";
import { verifyJwt, requireRole } from "../middleware/auth";
import { BookingModel } from "../models/Booking";
import { ProviderModel } from "../models/Provider";
import { UserModel } from "../models/User";
import { notifyNewBooking, notifyBookingStatusChange } from "../services/notifications";
import { z } from "zod";
import { Request, Response } from 'express';

const router = Router();

// Create new booking with worker selection
router.post("/create", verifyJwt, requireRole("user"), async (req: Request, res: Response) => {
	try {
		const bookingSchema = z.object({
			workerId: z.string().min(1),
			serviceType: z.string().min(1),
			serviceCategory: z.string().min(1),
			duration: z.string().min(1),
			durationValue: z.number().min(1),
			location: z.string().min(1),
			coordinates: z.object({
				lat: z.number(),
				lng: z.number()
			}),
			timeSlot: z.string().min(1),
			date: z.string().min(1),
			urgency: z.enum(["normal", "urgent", "emergency"]).default("normal"),
			skillTags: z.array(z.string()).optional(),
			specialRequirements: z.string().optional(),
			insuranceRequired: z.boolean().default(false),
			backgroundCheckRequired: z.boolean().default(false),
			totalPrice: z.number().min(0),
			basePrice: z.number().min(0),
			surgeMultiplier: z.number().min(1),
			insuranceCost: z.number().min(0)
		});

		const parsed = bookingSchema.safeParse(req.body);
		if (!parsed.success) {
			return res.status(400).json({ error: parsed.error.flatten() });
		}

		const { 
			workerId, 
			serviceType, 
			serviceCategory,
			duration,
			durationValue,
			location,
			coordinates,
			timeSlot,
			date,
			urgency,
			skillTags,
			specialRequirements,
			insuranceRequired,
			backgroundCheckRequired,
			totalPrice,
			basePrice,
			surgeMultiplier,
			insuranceCost
		} = parsed.data;

		// Verify worker exists and is verified
		const worker = await ProviderModel.findById(workerId);
		if (!worker) {
			return res.status(404).json({ error: "Worker not found" });
		}

		if (!worker.verified) {
			return res.status(400).json({ error: "Worker is not verified yet" });
		}

		if (!worker.available) {
			return res.status(400).json({ error: "Worker is currently unavailable" });
		}

		// Create booking with new structure
		const booking = await BookingModel.create({
			userId: req.user!.userId,
			providerId: workerId,
			serviceType,
			description: specialRequirements || `${serviceCategory} service`,
			preferredDate: new Date(date),
			preferredTime: timeSlot,
			urgency: urgency === 'emergency' ? 'high' : urgency === 'urgent' ? 'normal' : 'low',
			address: location,
			amount: totalPrice * 100, // Convert to cents for Stripe
			currency: "inr",
			status: "pending",
			// Additional fields for new booking structure
			serviceCategory,
			duration,
			durationValue,
			coordinates,
			skillTags,
			insuranceRequired,
			backgroundCheckRequired,
			basePrice: basePrice * 100,
			surgeMultiplier,
			insuranceCost: insuranceCost * 100
		});

		// Populate user and worker details for response
		const populatedBooking = await booking.populate([
			{ path: 'userId', select: 'name email' },
      { path: 'providerId', select: 'category description' }
		]);

		// Send notification to worker
    await notifyNewBooking(worker.userId.toString(), {
			id: booking._id,
			serviceType,
			description: specialRequirements || `${serviceCategory} service`,
			preferredDate: date,
			preferredTime: timeSlot,
			urgency: urgency === 'emergency' ? 'high' : urgency === 'urgent' ? 'normal' : 'low',
			address: location
		});

		return res.status(201).json({
			bookingId: booking._id,
			message: "Booking created successfully",
			booking: populatedBooking
		});
	} catch (error) {
		console.error('Error creating booking:', error);
    const message = (error as any)?.message || 'Failed to create booking';
    return res.status(500).json({ error: message });
	}
});

// Create new booking (legacy endpoint)
router.post("/", verifyJwt, requireRole("user"), async (req: Request, res: Response) => {
	try {
		const bookingSchema = z.object({
			providerId: z.string().min(1),
			serviceType: z.string().min(1),
			description: z.string().min(10),
			preferredDate: z.string().min(1),
			preferredTime: z.string().min(1),
			urgency: z.enum(["low", "normal", "high"]).default("normal"),
			budget: z.number().optional(),
			address: z.string().min(1),
			contactPhone: z.string().min(1),
			amount: z.number().default(5000), // Default $50.00
			currency: z.string().default("usd")
		});

		const parsed = bookingSchema.safeParse(req.body);
		if (!parsed.success) {
			return res.status(400).json({ error: parsed.error.flatten() });
		}

		const { 
			providerId, 
			serviceType, 
			description, 
			preferredDate, 
			preferredTime, 
			urgency, 
			budget, 
			address, 
			contactPhone,
			amount,
			currency
		} = parsed.data;

		// Verify provider exists and is verified
		const provider = await ProviderModel.findById(providerId);
		if (!provider) {
			return res.status(404).json({ error: "Provider not found" });
		}

		if (!provider.verified) {
			return res.status(400).json({ error: "Provider is not verified yet" });
		}

		if (!provider.available) {
			return res.status(400).json({ error: "Provider is currently unavailable" });
		}

		const booking = await BookingModel.create({
			userId: req.user!.userId,
			providerId,
			serviceType,
			description,
			preferredDate: new Date(preferredDate),
			preferredTime,
			urgency,
			budget,
			address,
			contactPhone,
			amount,
			currency,
			status: "pending"
		});

		// Populate user and provider details for response
		const populatedBooking = await booking.populate([
			{ path: 'userId', select: 'name email' },
			{ path: 'providerId', select: 'name email' }
		]);

		// Send notification to provider
		await notifyNewBooking(provider.userId.toString(), {
			id: booking._id,
			serviceType,
			description,
			preferredDate,
			preferredTime,
			urgency,
			address
		});

		return res.status(201).json(populatedBooking);
	} catch (error) {
		console.error('Error creating booking:', error);
		return res.status(500).json({ error: "Failed to create booking" });
	}
});

// Get user's bookings
router.get("/me", verifyJwt, requireRole("user"), async (req: Request, res: Response) => {
	try {
		const { status, limit = 100 } = req.query;
		
		const match = { userId: req.user!.userId };
		// if (status) match.status = status;
		if (status) (match as any).status = status;

		
		const docs = await BookingModel.find(match)
			.populate('providerId', 'category description verified')
			.sort({ createdAt: -1 })
			.limit(Number(limit));
		
		return res.json(docs);
	} catch (error) {
		console.error('Error fetching user bookings:', error);
		return res.status(500).json({ error: "Failed to fetch bookings" });
	}
});

// Get provider's bookings
router.get("/provider/me", verifyJwt, requireRole("provider"), async (req: Request, res: Response) => {
  try {
    const provider = await ProviderModel.findOne({ userId: req.user!.userId });
    if (!provider) {
      return res.json([]);
    }

    const { status, limit = 100 } = req.query;
    
    const match: any = { providerId: provider._id };
    if (status) match.status = status;
    
    const docs = await BookingModel.find(match)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    return res.json(docs);
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Provider accepts booking
router.patch("/:id/accept", verifyJwt, requireRole("provider"), async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { providerNotes, estimatedDuration, finalAmount } = req.body;

		// Verify provider owns this booking
		const provider = await ProviderModel.findOne({ userId: req.user!.userId });
		if (!provider) {
			return res.status(403).json({ error: "Provider profile not found" });
		}

		const booking = await BookingModel.findOne({ _id: id, providerId: provider._id });
		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		if (booking.status !== "pending") {
			return res.status(400).json({ error: "Booking cannot be accepted in current status" });
		}

		// Update booking status
		const updatedBooking = await BookingModel.findByIdAndUpdate(
			id,
			{
				status: "accepted",
				acceptedAt: new Date(),
				providerNotes,
				estimatedDuration,
				finalAmount
			},
			{ new: true }
		).populate([
			{ path: 'userId', select: 'name email' },
			{ path: 'providerId', select: 'category description' }
		]);

    // Send notification to both user and provider
    await notifyBookingStatusChange(
      booking.userId.toString(),
      provider.userId.toString(),
      {
        id: booking._id,
        serviceType: booking.serviceType,
        providerNotes,
        estimatedDuration,
        finalAmount
      },
      "accepted"
    );

		return res.json(updatedBooking);
	} catch (error) {
		console.error('Error accepting booking:', error);
		return res.status(500).json({ error: "Failed to accept booking" });
	}
});

// Provider rejects booking
router.patch("/:id/reject", verifyJwt, requireRole("provider"), async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { rejectionReason } = req.body;

		if (!rejectionReason) {
			return res.status(400).json({ error: "Rejection reason is required" });
		}

		// Verify provider owns this booking
		const provider = await ProviderModel.findOne({ userId: req.user!.userId });
		if (!provider) {
			return res.status(403).json({ error: "Provider profile not found" });
		}

		const booking = await BookingModel.findOne({ _id: id, providerId: provider._id });
		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		if (booking.status !== "pending") {
			return res.status(400).json({ error: "Booking cannot be rejected in current status" });
		}

		// Update booking status
		const updatedBooking = await BookingModel.findByIdAndUpdate(
			id,
			{
				status: "rejected",
				rejectedAt: new Date(),
				rejectionReason
			},
			{ new: true }
		).populate([
			{ path: 'userId', select: 'name email' },
			{ path: 'providerId', select: 'category description' }
		]);

    await notifyBookingStatusChange(
      booking.userId.toString(),
      provider.userId.toString(),
      { id: booking._id, serviceType: booking.serviceType, rejectionReason },
      "rejected"
    );

		return res.json(updatedBooking);
	} catch (error) {
		console.error('Error rejecting booking:', error);
		return res.status(500).json({ error: "Failed to reject booking" });
	}
});

// Provider starts work
router.patch("/:id/start", verifyJwt, requireRole("provider"), async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Verify provider owns this booking
		const provider = await ProviderModel.findOne({ userId: req.user!.userId });
		if (!provider) {
			return res.status(403).json({ error: "Provider profile not found" });
		}

		const booking = await BookingModel.findOne({ _id: id, providerId: provider._id });
		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		if (booking.status !== "accepted") {
			return res.status(400).json({ error: "Booking must be accepted before starting work" });
		}

		// Update booking status
		const updatedBooking = await BookingModel.findByIdAndUpdate(
			id,
			{
				status: "in_progress",
				startedAt: new Date()
			},
			{ new: true }
		).populate([
			{ path: 'userId', select: 'name email' },
			{ path: 'providerId', select: 'category description' }
		]);

    // await notifyBookingStatusChange(
    //   booking.userId.toString(),
    //   provider.userId.toString(),
    //   { id: booking._id, serviceType: booking.serviceType, startedAt: updatedBooking.startedAt },
    //   "started"
    // );

	await notifyBookingStatusChange(
		booking.userId.toString(),
		provider.userId.toString(),
		{ id: booking._id, serviceType: booking.serviceType, startedAt: updatedBooking!.startedAt },
		"started"
	  );
	  
		return res.json(updatedBooking);
	} catch (error) {
		console.error('Error starting booking:', error);
		return res.status(500).json({ error: "Failed to start booking" });
	}
});

// Provider completes work
router.patch("/:id/complete", verifyJwt, requireRole("provider"), async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { finalAmount } = req.body;

		// Verify provider owns this booking
		const provider = await ProviderModel.findOne({ userId: req.user!.userId });
		if (!provider) {
			return res.status(403).json({ error: "Provider profile not found" });
		}

		const booking = await BookingModel.findOne({ _id: id, providerId: provider._id });
		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		if (booking.status !== "in_progress") {
			return res.status(400).json({ error: "Booking must be in progress to complete" });
		}

		// Update booking status
		const updatedBooking = await BookingModel.findByIdAndUpdate(
			id,
			{
				status: "completed",
				completedAt: new Date(),
				finalAmount: finalAmount || booking.amount
			},
			{ new: true }
		).populate([
			{ path: 'userId', select: 'name email' },
			{ path: 'providerId', select: 'category description' }
		]);

    // await notifyBookingStatusChange(
    //   booking.userId.toString(),
    //   provider.userId.toString(),
    //   { id: booking._id, serviceType: booking.serviceType, completedAt: updatedBooking.completedAt, finalAmount: updatedBooking.finalAmount },
    //   "completed"
    // );
	if (!updatedBooking) {
		throw new Error("Booking update failed: updatedBooking is null");
	  }
	  
	  await notifyBookingStatusChange(
		booking.userId.toString(),
		provider.userId.toString(),
		{
		  id: booking._id,
		  serviceType: booking.serviceType,
		  completedAt: updatedBooking.completedAt,
		  finalAmount: updatedBooking.finalAmount,
		},
		"completed"
	  );
	  

		return res.json(updatedBooking);
	} catch (error) {
		console.error('Error completing booking:', error);
		return res.status(500).json({ error: "Failed to complete booking" });
	}
});

// User rates and reviews completed booking
router.patch("/:id/review", verifyJwt, requireRole("user"), async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { rating, review } = req.body;

		const reviewSchema = z.object({
			rating: z.number().min(1).max(5),
			review: z.string().min(1).max(500)
		});

		const parsed = reviewSchema.safeParse({ rating, review });
		if (!parsed.success) {
			return res.status(400).json({ error: parsed.error.flatten() });
		}

		// Verify user owns this booking
		const booking = await BookingModel.findOne({ _id: id, userId: req.user!.userId });
		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		if (booking.status !== "completed") {
			return res.status(400).json({ error: "Can only review completed bookings" });
		}

		if (booking.rating) {
			return res.status(400).json({ error: "Booking has already been reviewed" });
		}

		// Update booking with review
		const updatedBooking = await BookingModel.findByIdAndUpdate(
			id,
			{
				rating: parsed.data.rating,
				review: parsed.data.review,
				reviewedAt: new Date()
			},
			{ new: true }
		).populate([
			{ path: 'userId', select: 'name email' },
			{ path: 'providerId', select: 'category description' }
		]);

		// Update provider's average rating
		await updateProviderRating(booking.providerId);

		return res.json(updatedBooking);
	} catch (error) {
		console.error('Error adding review:', error);
		return res.status(500).json({ error: "Failed to add review" });
	}
});

// Cancel booking (user only, before accepted)
router.patch("/:id/cancel", verifyJwt, requireRole("user"), async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Verify user owns this booking
		const booking = await BookingModel.findOne({ _id: id, userId: req.user!.userId });
		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		if (booking.status !== "pending") {
			return res.status(400).json({ error: "Can only cancel pending bookings" });
		}

		// Update booking status
		const updatedBooking = await BookingModel.findByIdAndUpdate(
			id,
			{
				status: "cancelled"
			},
			{ new: true }
		).populate([
			{ path: 'userId', select: 'name email' },
			{ path: 'providerId', select: 'category description' }
		]);

		return res.json(updatedBooking);
	} catch (error) {
		console.error('Error cancelling booking:', error);
		return res.status(500).json({ error: "Failed to cancel booking" });
	}
});

// Get single booking details
router.get("/:id", verifyJwt, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { role, userId } = req.user!;

		let match = { _id: id };
		
		// Users can only see their own bookings, providers can only see bookings assigned to them
		if (role === "user") {
			(match as any).userId = userId;
		} else if (role === "provider") {
			const provider = await ProviderModel.findOne({ userId });
			if (!provider) {
				return res.status(403).json({ error: "Provider profile not found" });
			}
			(match as any).providerId = provider._id;
		}

		const booking = await BookingModel.findOne(match).populate([
			{ path: 'userId', select: 'name email phone' },
			{ path: 'providerId', select: 'category description verified' }
		]);

		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}

		return res.json(booking);
	} catch (error) {
		console.error('Error fetching booking:', error);
		return res.status(500).json({ error: "Failed to fetch booking" });
	}
});

// Helper function to update provider's average rating
async function updateProviderRating(providerId: any) {
	try {
		const ratings = await BookingModel.find({
			providerId,
			rating: { $exists: true, $ne: null }
		}).select('rating');

		if (ratings.length > 0) {
			const averageRating = ratings.reduce((sum, booking) => sum + booking.rating!, 0) / ratings.length;
			await ProviderModel.findByIdAndUpdate(providerId, { rating: averageRating });
		}
	} catch (error) {
		console.error('Error updating provider rating:', error);
	}
}

export default router;


