"use client";

import { useState } from "react";
import { DeliveryOrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";
import { User, MapPin, Phone, Mail, Package, Clock } from "lucide-react";

interface OrderItem {
    id: string;
    chapter: { title: string };
    quantity: number;
    priceAt: number;
}

interface Order {
    id: string;
    orderNumber: string;
    status: DeliveryOrderStatus;
    totalAmount: number;
    deliveryFee: number;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    createdAt: string;
    user: {
        name: string | null;
        email: string;
        phone: string | null;
    };
    items: OrderItem[];
}

export default function OrderTable({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleStatusUpdate = async (orderId: string, newStatus: DeliveryOrderStatus) => {
        console.log("Updating order:", orderId, "to status:", newStatus);
        setUpdatingId(orderId);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                console.log("Status updated successfully");
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            } else {
                const data = await res.json();
                console.error("Failed to update status:", data);
                alert(`Failed to update status: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Status update error:", error);
            alert("An error occurred during communication with the server.");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusVariant = (status: DeliveryOrderStatus) => {
        switch (status) {
            case "DELIVERED": return "secondary";
            case "SHIPPED": return "default";
            case "PROCESSING": return "outline";
            case "CANCELLED": return "destructive";
            default: return "outline";
        }
    };

    return (
        <div className="space-y-6">
            {orders.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No delivery orders found.</p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <Card key={order.id} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 bg-muted/30 border-b border-border/50 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <Package className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase font-semibold">Order ID</span>
                                        <p className="font-bold text-sm">#{order.orderNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="text-xs text-muted-foreground uppercase font-semibold">Date</span>
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            {format(new Date(order.createdAt), "dd MMM yyyy")}
                                        </div>
                                    </div>
                                    <div className="h-8 w-[1px] bg-border/50" />
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs text-muted-foreground uppercase font-semibold">Update Status</span>
                                        <select
                                            className="text-xs bg-background border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value as DeliveryOrderStatus)}
                                            disabled={updatingId === order.id || order.status === "CANCELLED"}
                                        >
                                            {Object.values(DeliveryOrderStatus).map(status => (
                                                <option key={status} value={status} disabled={status === "CANCELLED" && order.status !== "CANCELLED"}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Badge variant={getStatusVariant(order.status)} className="capitalize px-3 py-1">
                                        {updatingId === order.id ? "Updating..." : order.status.toLowerCase()}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-2">
                                        <User className="h-3.5 w-3.5" /> Customer Details
                                    </h4>
                                    <div className="space-y-2.5">
                                        <p className="text-sm font-semibold">{order.fullName}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5" /> {order.user.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-3.5 w-3.5" /> {order.phone}
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Info */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5" /> Delivery Location
                                    </h4>
                                    <div className="space-y-1.5 text-sm">
                                        <p className="font-medium">{order.address}</p>
                                        <p className="text-muted-foreground">{order.city}, {order.state} - <span className="font-bold text-foreground">{order.pincode}</span></p>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-primary tracking-wider flex items-center gap-2">
                                        <Package className="h-3.5 w-3.5" /> Order Summary
                                    </h4>
                                    <div className="space-y-2">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground truncate max-w-[180px]" title={item.chapter.title}>
                                                    {item.chapter.title} (x{item.quantity})
                                                </span>
                                                <span className="font-medium">₹{item.priceAt * item.quantity}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-border/50 pt-2 flex justify-between font-bold text-lg text-primary">
                                            <span>Total</span>
                                            <span>₹{order.totalAmount}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground text-right italic">Incl. ₹{order.deliveryFee} delivery fee</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
