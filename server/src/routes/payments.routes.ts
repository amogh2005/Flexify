import { Router } from "express";
import { ProviderModel } from "../models/Provider";
import { verifyJwt } from "../middleware/auth";

const router = Router();

// Platform commission configuration
const PLATFORM_COMMISSION_RATE = 0.15; // 15% commission
const MINIMUM_COMMISSION = 5; // Minimum $5 commission
const MAXIMUM_COMMISSION = 100; // Maximum $100 commission

// Add/Update payment method for provider
router.post("/payment-method", verifyJwt, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { method, details } = req.body;

    const provider = await ProviderModel.findOne({ userId: req.user.userId });

    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // Validate payment method details
    if (method === "bank") {
      const { accountNumber, ifscCode, accountHolderName, bankName } = details;
      if (!accountNumber || !ifscCode || !accountHolderName) {
        return res.status(400).json({ message: "Bank details incomplete" });
      }
      
      provider.bankDetails = {
        accountNumber,
        ifscCode,
        accountHolderName,
        bankName: bankName || ""
      };
    } else if (method === "upi") {
      const { upiId } = details;
      if (!upiId) {
        return res.status(400).json({ message: "UPI ID is required" });
      }
      
      // Basic UPI ID validation
      if (!upiId.includes("@")) {
        return res.status(400).json({ message: "Invalid UPI ID format" });
      }
      
      provider.upiId = upiId;
    } else {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    await provider.save();

    res.json({ 
      message: "Payment method updated successfully",
      paymentMethod: method
		});
	} catch (error) {
    console.error("Update payment method error:", error);
    res.status(500).json({ message: "Failed to update payment method" });
  }
});

// Get payment methods
router.get("/payment-methods", verifyJwt, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const provider = await ProviderModel.findOne({ userId: req.user.userId });

    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    const paymentMethods = {
      bank: provider.bankDetails ? {
        accountNumber: provider.bankDetails.accountNumber?.replace(/\d(?=\d{4})/g, "*"),
        ifscCode: provider.bankDetails.ifscCode,
        accountHolderName: provider.bankDetails.accountHolderName,
        bankName: provider.bankDetails.bankName
      } : null,
      upi: provider.upiId || null
    };

    res.json(paymentMethods);
  } catch (error) {
    console.error("Get payment methods error:", error);
    res.status(500).json({ message: "Failed to get payment methods" });
  }
});

// Calculate commission for a booking
router.post("/calculate-commission", verifyJwt, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { bookingAmount } = req.body;

    if (!bookingAmount || bookingAmount <= 0) {
      return res.status(400).json({ message: "Invalid booking amount" });
    }

    const commission = calculateCommission(bookingAmount);
    const providerEarnings = bookingAmount - commission;

    res.json({
      bookingAmount,
      commission,
      providerEarnings,
      commissionRate: PLATFORM_COMMISSION_RATE,
      breakdown: {
        platformCommission: commission,
        providerEarnings: providerEarnings,
        percentage: `${(PLATFORM_COMMISSION_RATE * 100).toFixed(1)}%`
      }
    });
	} catch (error) {
    console.error("Calculate commission error:", error);
    res.status(500).json({ message: "Failed to calculate commission" });
  }
});

// Process payment after work completion
router.post("/process-payment", verifyJwt, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { bookingId, bookingAmount, workCompleted } = req.body;

    if (!bookingId || !bookingAmount || !workCompleted) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const provider = await ProviderModel.findOne({ userId: req.user.userId });

    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // Calculate commission
    const commission = calculateCommission(bookingAmount);
    const providerEarnings = bookingAmount - commission;

    // Update provider earnings
    provider.totalEarnings += providerEarnings;
    provider.platformFees += commission;
    provider.completedBookings += 1;

    // Add to withdrawal history
    const withdrawalEntry = {
      amount: providerEarnings,
      date: new Date(),
      status: "completed" as const,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    provider.withdrawalHistory.push(withdrawalEntry);
    await provider.save();

    res.json({
      message: "Payment processed successfully",
      paymentDetails: {
        bookingId,
        totalAmount: bookingAmount,
        commission,
        providerEarnings,
        transactionId: withdrawalEntry.transactionId,
        status: "completed"
      }
		});
	} catch (error) {
    console.error("Process payment error:", error);
    res.status(500).json({ message: "Failed to process payment" });
  }
});

// Request withdrawal
router.post("/request-withdrawal", verifyJwt, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount" });
    }

    const provider = await ProviderModel.findOne({ userId: req.user.userId });

    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // Check if provider has sufficient balance
    const availableBalance = provider.totalEarnings - provider.platformFees;
    if (amount > availableBalance) {
      return res.status(400).json({ 
        message: "Insufficient balance",
        availableBalance,
        requestedAmount: amount
      });
    }

    // Check minimum withdrawal amount
    const minimumWithdrawal = 50; // $50 minimum
    if (amount < minimumWithdrawal) {
      return res.status(400).json({ 
        message: `Minimum withdrawal amount is $${minimumWithdrawal}`,
        minimumWithdrawal
      });
    }

    // Validate payment method
    if (paymentMethod === "bank" && !provider.bankDetails?.accountNumber) {
      return res.status(400).json({ message: "Bank details not configured" });
    }
    if (paymentMethod === "upi" && !provider.upiId) {
      return res.status(400).json({ message: "UPI ID not configured" });
    }

    // Create withdrawal request
    const withdrawalRequest = {
      amount,
      date: new Date(),
      status: "pending" as const,
      transactionId: `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      paymentMethod
    };

    provider.withdrawalHistory.push(withdrawalRequest);
    await provider.save();

    res.json({
      message: "Withdrawal request submitted successfully",
      withdrawalRequest: {
        transactionId: withdrawalRequest.transactionId,
        amount,
        status: "pending",
        estimatedProcessingTime: "2-3 business days"
      }
    });
  } catch (error) {
    console.error("Request withdrawal error:", error);
    res.status(500).json({ message: "Failed to request withdrawal" });
  }
});

// Get earnings summary
router.get("/earnings-summary", verifyJwt, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const provider = await ProviderModel.findOne({ userId: req.user.userId });

    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    const totalEarnings = provider.totalEarnings || 0;
    const platformFees = provider.platformFees || 0;
    const netEarnings = totalEarnings - platformFees;

    // Calculate this month's earnings
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const thisMonthWithdrawals = provider.withdrawalHistory.filter(
      w => w.date >= currentMonth && w.status === "completed"
    );
    const thisMonthEarnings = thisMonthWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    // Get recent transactions
    const recentTransactions = provider.withdrawalHistory
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    res.json({
      totalEarnings,
      platformFees,
      netEarnings,
      thisMonthEarnings,
      completedBookings: provider.completedBookings || 0,
      averageEarningsPerBooking: provider.completedBookings > 0 
        ? (netEarnings / provider.completedBookings).toFixed(2)
        : 0,
      recentTransactions,
      paymentMethods: {
        bank: !!provider.bankDetails?.accountNumber,
        upi: !!provider.upiId
      }
		});
	} catch (error) {
    console.error("Get earnings summary error:", error);
    res.status(500).json({ message: "Failed to get earnings summary" });
  }
});

// Helper function to calculate commission
function calculateCommission(amount: number): number {
  const commission = amount * PLATFORM_COMMISSION_RATE;
  return Math.min(Math.max(commission, MINIMUM_COMMISSION), MAXIMUM_COMMISSION);
}

export default router;