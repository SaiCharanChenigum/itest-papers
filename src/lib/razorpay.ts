import Razorpay from "razorpay"
import crypto from "crypto"

// Lazily create Razorpay instance so env vars are guaranteed loaded at request time
function getRazorpayInstance() {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
}

/**
 * Create a Razorpay order for subscription payment
 * @param amount - Amount in INR (will be converted to paise)
 * @param planName - Name of the subscription plan
 * @param userId - User ID for notes
 * @returns Razorpay order object
 */
export async function createRazorpayOrder(
    amount: number,
    planName: string,
    userId: string
) {
    const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: "INR",
        receipt: `ord_${Date.now()}`,
        notes: {
            userId,
            planName,
            type: "subscription"
        }
    }

    return await getRazorpayInstance().orders.create(options)
}

/**
 * Verify Razorpay payment signature
 * @param orderId - Razorpay order ID
 *@param paymentId - Razorpay payment ID
 * @param signature - Razorpay signature
 * @returns boolean - true if signature is valid
 */
export function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const text = `${orderId}|${paymentId}`
    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(text)
        .digest("hex")

    return generated_signature === signature
}

/**
 * Subscription plans configuration
 */
export const SUBSCRIPTION_PLANS = {
    CLASS_9_BIOLOGY: {
        name: "Class 9 Biology - Full Access",
        planType: "SUBJECT",
        class: 9,
        subject: "Biology",
        amount: 299,
        duration: 365, // days
        description: "Complete access to all Biology content for Class 9"
    },
    CLASS_9_CHEMISTRY: {
        name: "Class 9 Chemistry - Full Access",
        planType: "SUBJECT",
        class: 9,
        subject: "Chemistry",
        amount: 299,
        duration: 365,
        description: "Complete access to all Chemistry content for Class 9"
    },
    CLASS_10_BIOLOGY: {
        name: "Class 10 Biology - Full Access",
        planType: "SUBJECT",
        class: 10,
        subject: "Biology",
        amount: 299,
        duration: 365,
        description: "Complete access to all Biology content for Class 10"
    },
    CLASS_10_CHEMISTRY: {
        name: "Class 10 Chemistry - Full Access",
        planType: "SUBJECT",
        class: 10,
        subject: "Chemistry",
        amount: 299,
        duration: 365,
        description: "Complete access to all Chemistry content for Class 10"
    },
    CLASS_9_FULL: {
        name: "Class 9 - Complete Package",
        planType: "FULL_ACCESS",
        class: 9,
        subject: null,
        amount: 299,
        duration: 365,
        description: "Full access to both Biology and Chemistry for Class 9"
    },
    CLASS_10_FULL: {
        name: "Class 10 - Complete Package",
        planType: "FULL_ACCESS",
        class: 10,
        subject: null,
        amount: 299,
        duration: 365,
        description: "Full access to both Biology and Chemistry for Class 10"
    },
    ALL_ACCESS: {
        name: "All Access - Classes 9 & 10",
        planType: "FULL_ACCESS",
        class: null,
        subject: null,
        amount: 499,
        duration: 365,
        description: "Complete access to all subjects for both Class 9 and Class 10"
    }
} as const
