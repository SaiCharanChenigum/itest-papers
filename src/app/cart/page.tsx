"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ShoppingCart, ArrowLeft, Trash2, Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export default function CartAndOrdersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const { cartItems, updateQuantity, removeFromCart, cartTotal, isLoading: isCartLoading } = useCart();

    const [activeTab, setActiveTab] = useState<"CART" | "ORDERS">("CART");
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (searchParams.get("tab") === "orders") {
            setActiveTab("ORDERS");
        }
    }, [searchParams]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/cart");
        }
    }, [status, router]);

    useEffect(() => {
        if (activeTab === "ORDERS" && status === "authenticated") {
            setOrdersLoading(true);
            fetch("/api/orders")
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setOrders(data.orders);
                    }
                })
                .catch(err => toast.error("Failed to load orders"))
                .finally(() => setOrdersLoading(false));
        }
    }, [activeTab, status]);

    if (status === "loading" || (isCartLoading && activeTab === "CART")) {
        return (
            <div className="section-padding min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const handleCheckout = () => {
        router.push("/checkout");
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
            return;
        }

        setCancellingOrderId(orderId);
        try {
            const res = await fetch("/api/orders/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                // Refresh orders
                const ordersRes = await fetch("/api/orders");
                const ordersData = await ordersRes.json();
                if (ordersData.success) setOrders(ordersData.orders);
            } else {
                toast.error(data.error || "Failed to cancel order");
            }
        } catch (err) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setCancellingOrderId(null);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "PENDING":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium"><Clock className="w-3 h-3" /> Pending</span>;
            case "PROCESSING":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium"><Package className="w-3 h-3" /> Processing</span>;
            case "SHIPPED":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-medium"><Truck className="w-3 h-3" /> Shipped</span>;
            case "DELIVERED":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium"><CheckCircle className="w-3 h-3" /> Delivered</span>;
            case "CANCELLED":
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-medium"><XCircle className="w-3 h-3" /> Cancelled</span>;
            default:
                return null;
        }
    };

    return (
        <section className="section-padding bg-muted/30 min-h-screen">
            <div className="container-main max-w-5xl">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <h1 className="text-3xl font-bold">Shopping Cart & Orders</h1>

                    {/* Tabs */}
                    <div className="flex p-1 bg-card border border-border rounded-lg inline-flex w-fit">
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "CART" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"}`}
                            onClick={() => setActiveTab("CART")}
                        >
                            My Cart
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "ORDERS" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"}`}
                            onClick={() => setActiveTab("ORDERS")}
                        >
                            My Orders
                        </button>
                    </div>
                </div>

                {/* CART TAB */}
                {activeTab === "CART" && (
                    <div className="animate-in fade-in duration-300">
                        {cartItems.length === 0 ? (
                            <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                                <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                                <p className="text-muted-foreground mb-6">Looks like you haven't added any books yet.</p>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-12 gap-8">
                                {/* Cart Items */}
                                <div className="lg:col-span-8 space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-5 border border-border rounded-xl bg-card shadow-sm">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
                                                        <p className="text-sm text-muted-foreground">{item.className} • {item.subjectName}</p>
                                                    </div>
                                                    <span className="font-bold text-lg hidden sm:block">₹{item.price * item.quantity}</span>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center bg-muted/50 border border-border rounded-lg">
                                                        <button
                                                            className="p-2 hover:bg-muted rounded-l-lg transition-colors disabled:opacity-50"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                        <button
                                                            className="p-2 hover:bg-muted rounded-r-lg transition-colors"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <span className="font-bold text-lg sm:hidden">₹{item.price * item.quantity}</span>

                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-sm text-destructive hover:text-destructive/80 font-medium flex items-center gap-1 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary */}
                                <div className="lg:col-span-4">
                                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
                                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-muted-foreground text-sm">
                                                <span>Items Total</span>
                                                <span className="font-medium text-foreground">₹{cartTotal}</span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground text-sm">
                                                <span>Delivery Fee</span>
                                                <span className="font-medium text-foreground">₹60</span>
                                            </div>
                                            <div className="border-t border-border pt-4 mt-2 flex justify-between items-center">
                                                <span className="font-bold text-lg">Total</span>
                                                <span className="font-bold text-2xl text-primary">₹{cartTotal + 60}</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full text-base h-12"
                                            onClick={handleCheckout}
                                        >
                                            Proceed to Checkout
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === "ORDERS" && (
                    <div className="animate-in fade-in duration-300">
                        {ordersLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
                                <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">No past orders</h2>
                                <p className="text-muted-foreground">You haven't ordered any physical books yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                                        <div className="bg-muted/30 p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex flex-wrap gap-x-8 gap-y-2">
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Order Placed</p>
                                                    <p className="text-sm font-medium">{format(new Date(order.createdAt), "dd MMM yyyy, p")}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total</p>
                                                    <p className="text-sm font-medium">₹{order.totalAmount}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Items</p>
                                                    <p className="text-sm font-medium">{order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} items</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:items-end gap-1">
                                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Order # {order.orderNumber}</p>
                                                <p className="text-xs text-muted-foreground">Paid via {order.paymentMethod}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 sm:p-6">
                                            <div className="mb-6 flex justify-between items-start">
                                                <h3 className="font-semibold text-lg">Delivery Status</h3>
                                                <StatusBadge status={order.status} />
                                            </div>
                                            <div className="space-y-3">
                                                {order.items.map((item: any) => (
                                                    <div key={item.id} className="flex gap-4 items-center">
                                                        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                                                            <Package className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate">{item.chapter.title}</p>
                                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.priceAt}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-border grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Delivery Address</p>
                                                    <p className="text-sm">{order.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">{order.address}, {order.city}, {order.state} - {order.pincode}</p>
                                                </div>

                                                {/* Cancel Order Section */}
                                                <div className="flex flex-col sm:items-end justify-end">
                                                    {(() => {
                                                        const orderTime = new Date(order.createdAt);
                                                        const diffMinutes = (new Date().getTime() - orderTime.getTime()) / (1000 * 60);
                                                        const isEligible = diffMinutes <= 30 && (order.status === "PROCESSING" || order.status === "PENDING");

                                                        if (!isEligible) return null;

                                                        return (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-destructive hover:bg-destructive hover:text-white border-destructive/50"
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                disabled={cancellingOrderId === order.id}
                                                            >
                                                                {cancellingOrderId === order.id ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                        Cancelling...
                                                                    </div>
                                                                ) : "Cancel Order"}
                                                            </Button>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </section>
    );
}
