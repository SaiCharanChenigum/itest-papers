"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface RazorpayCheckoutProps {
    planId: string
    price: number
    buttonText?: string
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
    className?: string
    onSuccess?: () => void
}

export default function RazorpayCheckout({
    planId,
    price,
    buttonText = "Buy Now",
    variant = "default",
    className,
    onSuccess
}: RazorpayCheckoutProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handlePayment = async () => {
        if (!session?.user) {
            router.push("/login?callbackUrl=/pricing")
            return
        }

        setLoading(true)

        try {
            // 1. Create Order
            const response = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to create order")
            }

            // 2. Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: "iTestPapers",
                description: "Premium Subscription",
                order_id: data.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await fetch("/api/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        })

                        const verifyData = await verifyRes.json()

                        if (verifyRes.ok) {
                            // Success!
                            if (onSuccess) onSuccess()
                            router.push("/dashboard?payment=success")
                            router.refresh()
                        } else {
                            alert("Payment verification failed: " + verifyData.message)
                        }
                    } catch (error) {
                        console.error("Verification error:", error)
                        alert("Payment verification failed")
                    }
                },
                prefill: {
                    name: session.user.name,
                    email: session.user.email,
                },
                theme: {
                    color: "#0FB9B1", // Teal theme color
                },
            }

            const paymentObject = new (window as any).Razorpay(options)
            paymentObject.open()

        } catch (error: any) {
            console.error("Payment error:", error)
            alert(error.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Load Razorpay Script dynamically if not already loaded, or rely on layout script */}
            {/* Ideally use a Script component in layout or here */}
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

            <Button
                onClick={handlePayment}
                disabled={loading}
                variant={variant}
                className={className}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    buttonText
                )}
            </Button>
        </>
    )
}
