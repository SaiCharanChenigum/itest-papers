"use client";

import { useState } from "react";
import Script from "next/script";
import { Check, ArrowRight, X, CheckCircle2, AlertCircle, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const plans = [
    {
        name: "Free",
        price: "₹0",
        period: "forever",
        features: ["1 Chapter Access", "Preview Notes", "Basic Support"],
        cta: "Get Started",
        popular: false,
        planKey: null,
    },
    {
        name: "Premium",
        price: "₹299",
        period: "per class",
        features: ["Full Class Access (Bio & Chem)", "All Test Papers", "Solutions & Answers", "Download PDFs", "Priority Support"],
        cta: "Select Class",
        popular: true,
        planKey: "PREMIUM_SELECT",
    },
    {
        name: "Combo",
        price: "₹499",
        period: "all subjects",
        features: ["Class 9 + 10 Access", "All Subjects Included", "All Test Papers", "Download Everything", "Priority Support"],
        cta: "Get Combo",
        popular: false,
        planKey: "ALL_ACCESS",
    },
];

interface UserSubscriptions {
    class9: boolean;
    class10: boolean;
    combo: boolean;
}

interface PricingClientProps {
    userSubscriptions: UserSubscriptions;
}

const SubscribedBadge = () => (
    <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-secondary/10 text-secondary font-semibold text-sm border border-secondary/20">
        <BadgeCheck className="h-4 w-4" />
        Subscribed
    </div>
);

export default function PricingClient({ userSubscriptions }: PricingClientProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [showClassModal, setShowClassModal] = useState(false);
    const [modalInfo, setModalInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Determine if the whole Premium plan is "used" (both classes subscribed or combo)
    const isPremiumFullySubscribed = userSubscriptions.combo || (userSubscriptions.class9 && userSubscriptions.class10);
    const isComboSubscribed = userSubscriptions.combo;

    const handleSubscribe = async (planKey: string | null) => {
        if (!planKey) {
            router.push("/register");
            return;
        }

        if (planKey === "PREMIUM_SELECT") {
            setShowClassModal(true);
            return;
        }

        if (!session) {
            router.push("/login?redirect=/pricing");
            return;
        }

        setLoadingPlan(planKey);
        try {
            const res = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planKey })
            });
            const data = await res.json();

            if (!data.success) throw new Error(data.error);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourTestKey",
                amount: data.data.amount,
                currency: data.data.currency,
                name: "iTestPapers",
                description: "Subscription Payment",
                order_id: data.data.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch("/api/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            })
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            setModalInfo({ type: 'success', message: 'Payment successful! Your subscription is now active. Enjoy full access!' });
                        } else {
                            setModalInfo({ type: 'error', message: 'Payment verification failed. Please contact support if the amount was deducted.' });
                        }
                    } catch (err) {
                        setModalInfo({ type: 'error', message: 'An error occurred while verifying your payment. Please contact support.' });
                    }
                },
                prefill: {
                    name: session.user?.name || "",
                    email: session.user?.email || "",
                },
                theme: { color: "#0f766e" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                setModalInfo({ type: 'error', message: `Payment Failed: ${response.error.description}` });
            });
            rzp.open();

        } catch (error: any) {
            console.error("Payment initiation failed:", error);
            setModalInfo({ type: 'error', message: `Failed to start payment: ${error.message || 'Unknown error'}` });
        } finally {
            setLoadingPlan(null);
            setShowClassModal(false);
        }
    };

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            {/* Payment Result Modal */}
            {modalInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-sm p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
                        {modalInfo.type === 'success' ? (
                            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-5">
                                <CheckCircle2 className="w-9 h-9 text-secondary" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
                                <AlertCircle className="w-9 h-9 text-destructive" />
                            </div>
                        )}
                        <h2 className="text-xl font-bold mb-2">
                            {modalInfo.type === 'success' ? 'Payment Successful!' : 'Payment Failed'}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{modalInfo.message}</p>
                        <Button
                            className="w-full"
                            onClick={() => {
                                setModalInfo(null);
                                if (modalInfo.type === 'success') router.push('/dashboard');
                            }}
                        >
                            {modalInfo.type === 'success' ? 'Go to Dashboard' : 'OK'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Class Selection Modal */}
            {showClassModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-background rounded-2xl shadow-xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowClassModal(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-xl font-bold mb-2">Select Your Class</h2>
                        <p className="text-sm text-muted-foreground mb-6">Which class materials would you like to unlock for ₹299?</p>

                        <div className="space-y-3">
                            {/* Class 9 button — show Subscribed if already subscribed */}
                            {userSubscriptions.class9 || userSubscriptions.combo ? (
                                <div className="w-full px-4">
                                    <div className="flex items-center justify-between h-14">
                                        <span className="text-base font-medium">Class 9 (Bio & Chem)</span>
                                        <span className="flex items-center gap-1.5 text-sm text-secondary font-semibold">
                                            <BadgeCheck className="h-4 w-4" /> Subscribed
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full justify-between h-14 text-base"
                                    onClick={() => handleSubscribe("CLASS_9_FULL")}
                                    isLoading={loadingPlan === "CLASS_9_FULL"}
                                >
                                    <span>Class 9 (Bio & Chem)</span>
                                    {loadingPlan !== "CLASS_9_FULL" && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                            )}

                            {/* Class 10 button — show Subscribed if already subscribed */}
                            {userSubscriptions.class10 || userSubscriptions.combo ? (
                                <div className="w-full px-4">
                                    <div className="flex items-center justify-between h-14">
                                        <span className="text-base font-medium">Class 10 (Bio & Chem)</span>
                                        <span className="flex items-center gap-1.5 text-sm text-secondary font-semibold">
                                            <BadgeCheck className="h-4 w-4" /> Subscribed
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full justify-between h-14 text-base"
                                    onClick={() => handleSubscribe("CLASS_10_FULL")}
                                    isLoading={loadingPlan === "CLASS_10_FULL"}
                                >
                                    <span>Class 10 (Bio & Chem)</span>
                                    {loadingPlan !== "CLASS_10_FULL" && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <section className="section-padding">
                <div className="container-main">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Choose Your Plan</h1>
                        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                            Start with a free chapter. Upgrade anytime to unlock complete study materials.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {plans.map((plan) => {
                            // Determine if this specific plan is already subscribed
                            const isSubscribed =
                                (plan.planKey === "PREMIUM_SELECT" && isPremiumFullySubscribed) ||
                                (plan.planKey === "ALL_ACCESS" && isComboSubscribed);

                            return (
                                <div key={plan.name} className={`card-academic flex flex-col ${plan.popular ? "ring-2 ring-primary relative" : ""}`}>
                                    {plan.popular && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                                            Most Popular
                                        </span>
                                    )}
                                    <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                                    <div className="mb-6">
                                        <span className="text-4xl font-extrabold">{plan.price}</span>
                                        <span className="text-sm text-muted-foreground ml-1">/ {plan.period}</span>
                                    </div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-start gap-2 text-sm">
                                                <Check className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Show Subscribed badge OR the CTA button */}
                                    {isSubscribed ? (
                                        <SubscribedBadge />
                                    ) : (
                                        <Button
                                            variant={plan.popular ? "default" : "outline"}
                                            size="lg"
                                            className="w-full"
                                            onClick={() => handleSubscribe(plan.planKey)}
                                            isLoading={plan.planKey !== null && loadingPlan === plan.planKey}
                                            disabled={plan.planKey === 'PREMIUM_SELECT' && loadingPlan !== null}
                                        >
                                            {plan.planKey !== null && loadingPlan === plan.planKey ? (
                                                <>Processing...</>
                                            ) : (
                                                <>{plan.cta} {plan.planKey !== "PREMIUM_SELECT" && <ArrowRight className="ml-1.5 h-4 w-4" />}</>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
}
