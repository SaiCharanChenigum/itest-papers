"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    // In a real app we might fetch the actual order details here via a GET /api/orders/[id]
    // For now we just show a generic success page with the ID.

    useEffect(() => {
        // Trigger EmailJS logic here optionally if client-side, 
        // though server-side is theoretically better for security.
        // We will leave the frontend success screen static for now.
    }, [orderId]);

    return (
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-lg animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <CheckCircle className="h-10 w-10 text-green-500 relative z-10" />
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            </div>

            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-6">
                Thank you for your purchase. We are getting your physical copies ready for dispatch.
            </p>

            {orderId && (
                <div className="bg-muted/50 rounded-xl p-4 mb-8 text-left flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Order Number</p>
                        <p className="font-bold text-lg">{orderId}</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <Button asChild className="w-full text-base h-12">
                    <Link href="/cart?tab=orders">View My Order Details</Link>
                </Button>
                <Button asChild variant="outline" className="w-full text-base h-12">
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <section className="section-padding min-h-[80vh] flex items-center justify-center bg-muted/30">
            <Suspense fallback={<div className="h-10 w-10 animate-spin border-4 border-primary border-t-transparent rounded-full" />}>
                <OrderSuccessContent />
            </Suspense>
        </section>
    );
}
