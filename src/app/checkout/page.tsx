"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Copy, CreditCard, ChevronLeft, MapPin, Edit2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Script from "next/script";

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { cartItems, cartTotal, cartCount, clearCartLocal, isLoading: isCartLoading } = useCart();

    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("ONLINE");
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });
    const [savedAddress, setSavedAddress] = useState<any>(null);
    const [isEditingAddress, setIsEditingAddress] = useState(true);
    const [addressLoading, setAddressLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/checkout");
        }
    }, [status, router]);

    // Redirect if cart is empty and not loading (and not successful yet)
    useEffect(() => {
        if (!isCartLoading && cartItems.length === 0 && !isSuccess) {
            router.push("/");
        }
    }, [isCartLoading, cartItems, router, isSuccess]);

    // Fetch previously saved address
    useEffect(() => {
        if (status === "authenticated") {
            fetch("/api/user/address")
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.address) {
                        setSavedAddress(data.address);
                        setFormData(data.address);
                        setIsEditingAddress(false);
                    }
                })
                .catch(err => console.error("Failed to fetch address", err))
                .finally(() => setAddressLoading(false));
        }
    }, [status]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (paymentMethod === "COD") {
                // Handle Cash on Delivery
                const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, paymentMethod })
                });

                const data = await res.json();
                if (data.success) {
                    setIsSuccess(true);
                    clearCartLocal();
                    router.push(`/order-success?orderId=${data.order.orderNumber}`);
                } else {
                    toast.error(data.error || "Failed to place order.");
                }
            } else {
                // Handle Razorpay Online Payment
                const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, paymentMethod })
                });

                const data = await res.json();
                if (!data.success) {
                    toast.error(data.error || "Failed to initialize payment.");
                    setLoading(false);
                    return;
                }

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: data.razorpayOrder.amount,
                    currency: data.razorpayOrder.currency,
                    name: "iTestPapers Delivery",
                    description: "Physical Books Order",
                    order_id: data.razorpayOrder.id,
                    handler: async function (response: any) {
                        toast.loading("Verifying payment...");
                        const verifyRes = await fetch("/api/verify-checkout", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                internal_order_id: data.order.id
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        toast.dismiss();

                        if (verifyData.success) {
                            setIsSuccess(true);
                            clearCartLocal();
                            router.push(`/order-success?orderId=${verifyData.orderNumber}`);
                        } else {
                            toast.error(verifyData.error || "Payment verification failed");
                        }
                    },
                    prefill: {
                        name: formData.fullName,
                        email: session?.user?.email || "",
                        contact: formData.phone
                    },
                    theme: {
                        color: "#0f172a"
                    }
                };

                const extWindow = window as any;
                if (!extWindow.Razorpay) {
                    toast.error("Payment SDK not loaded. Please refresh and try again.");
                    setLoading(false);
                    return;
                }

                const rzp = new extWindow.Razorpay(options);
                rzp.on("payment.failed", function (response: any) {
                    toast.error(response.error.description || "Payment failed");
                });
                rzp.open();
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Something went wrong during checkout.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || isCartLoading || addressLoading || (cartItems.length === 0 && !isSuccess)) {
        return (
            <div className="section-padding min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const deliveryFee = 60;
    const finalTotal = cartTotal + deliveryFee;

    return (
        <section className="section-padding bg-muted/30 min-h-screen">
            <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="container-main max-w-6xl">
                <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Home
                </Link>

                <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-7 space-y-6">

                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">1. Delivery Address</h2>

                            {!isEditingAddress && savedAddress ? (
                                <div className="border border-primary/20 bg-primary/5 rounded-xl p-5 relative">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-semibold">{formData.fullName}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {formData.address}<br />
                                                {formData.city}, {formData.state} - {formData.pincode}
                                            </p>
                                            <p className="text-sm font-medium mt-2">Mobile: {formData.phone}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-primary hover:text-primary hover:bg-primary/10 h-8 gap-1"
                                            onClick={() => setIsEditingAddress(true)}
                                            type="button"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" /> Edit
                                        </Button>
                                    </div>
                                    <form id="checkout-form" onSubmit={handleCheckout} className="hidden" />
                                </div>
                            ) : (
                                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Full Name</label>
                                            <Input required name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Rahul Sharma" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Phone Number</label>
                                            <Input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Address (House No, Street, Landmark)</label>
                                        <Input required name="address" value={formData.address} onChange={handleChange} placeholder="123, ABC Layout, Near XYZ Tower..." />
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">City</label>
                                            <Input required name="city" value={formData.city} onChange={handleChange} placeholder="Bangalore" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">State</label>
                                            <Input required name="state" value={formData.state} onChange={handleChange} placeholder="Karnataka" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Pincode</label>
                                            <Input required name="pincode" value={formData.pincode} onChange={handleChange} placeholder="560001" />
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">2. Payment Method</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("ONLINE")}
                                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === "ONLINE"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border hover:border-primary/50 text-foreground"
                                        }`}
                                >
                                    <CreditCard className="h-6 w-6 mb-2" />
                                    <span className="font-semibold text-sm">Pay Online (UPI/Card)</span>
                                    {paymentMethod === "ONLINE" && (
                                        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary" />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("COD")}
                                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === "COD"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border hover:border-primary/50 text-foreground"
                                        }`}
                                >
                                    <Copy className="h-6 w-6 mb-2" />
                                    <span className="font-semibold text-sm">Cash on Delivery</span>
                                    {paymentMethod === "COD" && (
                                        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary" />
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start text-sm">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium line-clamp-2">{item.title}</p>
                                            <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal ({cartCount} items)</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Delivery Fee</span>
                                    <span>₹{deliveryFee}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                                    <span>Total Amount</span>
                                    <span className="text-primary">₹{finalTotal}</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                form="checkout-form"
                                className="w-full mt-6 h-12 text-base font-semibold transition-all"
                                disabled={loading || isSuccess}
                            >
                                {(loading || isSuccess) ? "Processing..." : (paymentMethod === "ONLINE" ? `Pay ₹${finalTotal}` : "Place Order (COD)")}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground mt-4">
                                By placing this order, you agree to our Terms of Service & Shipping Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
