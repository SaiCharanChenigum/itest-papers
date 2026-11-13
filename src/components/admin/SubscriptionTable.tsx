"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";
import { Crown, Calendar, Search, CheckCircle2, AlertTriangle, ShieldCheck, CreditCard } from "lucide-react";

export interface SerializedSubscription {
    id: string;
    userId: string;
    planName: string;
    planType: string;
    class: number | null;
    amount: number;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
    createdAt: string;
    user: {
        name: string | null;
        email: string;
        phone: string | null;
    };
    payment: {
        razorpayPaymentId: string | null;
        razorpayOrderId: string | null;
    } | null;
}

export default function SubscriptionTable({
    initialSubscriptions,
}: {
    initialSubscriptions: SerializedSubscription[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "EXPIRED">("ALL");

    const now = new Date();

    const enrichedSubscriptions = useMemo(() => {
        return initialSubscriptions.map((sub) => {
            const endsAtDate = new Date(sub.endsAt);
            const isCurrentlyActive = sub.isActive && endsAtDate > now;
            const msRemaining = endsAtDate.getTime() - now.getTime();
            const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

            return {
                ...sub,
                isCurrentlyActive,
                daysRemaining,
            };
        });
    }, [initialSubscriptions]);

    const filteredSubscriptions = useMemo(() => {
        return enrichedSubscriptions.filter((sub) => {
            const matchesQuery =
                (sub.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                sub.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (sub.payment?.razorpayPaymentId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

            if (!matchesQuery) return false;

            if (filterStatus === "ACTIVE") return sub.isCurrentlyActive;
            if (filterStatus === "EXPIRED") return !sub.isCurrentlyActive;
            return true;
        });
    }, [enrichedSubscriptions, searchQuery, filterStatus]);

    const activeCount = enrichedSubscriptions.filter((s) => s.isCurrentlyActive).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Search input */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search student, email, plan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFilterStatus("ALL")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            filterStatus === "ALL"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                        All ({enrichedSubscriptions.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("ACTIVE")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            filterStatus === "ACTIVE"
                                ? "bg-emerald-600 text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                        Active ({activeCount})
                    </button>
                    <button
                        onClick={() => setFilterStatus("EXPIRED")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            filterStatus === "EXPIRED"
                                ? "bg-amber-600 text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                        Expired ({enrichedSubscriptions.length - activeCount})
                    </button>
                </div>
            </div>

            {filteredSubscriptions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed text-muted-foreground">
                    <Crown className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="font-semibold">No subscriptions found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b text-xs font-semibold uppercase text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3.5">Student</th>
                                <th className="px-4 py-3.5">Plan / Validity</th>
                                <th className="px-4 py-3.5">Amount</th>
                                <th className="px-4 py-3.5">Purchase Date</th>
                                <th className="px-4 py-3.5">1-Year Expiry Date</th>
                                <th className="px-4 py-3.5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {filteredSubscriptions.map((sub) => {
                                const startsAtDate = new Date(sub.startsAt);
                                const endsAtDate = new Date(sub.endsAt);

                                return (
                                    <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                                        {/* Student Info */}
                                        <td className="px-4 py-3.5">
                                            <div className="font-medium text-foreground">
                                                {sub.user.name || "Anonymous User"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{sub.user.email}</div>
                                            {sub.user.phone && (
                                                <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                                                    {sub.user.phone}
                                                </div>
                                            )}
                                        </td>

                                        {/* Plan Name & Duration */}
                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold flex items-center gap-1.5 text-foreground">
                                                <ShieldCheck className="h-4 w-4 text-primary" />
                                                {sub.planName}
                                            </div>
                                            <div className="text-xs text-emerald-600 font-medium mt-0.5">
                                                1 Year Access
                                            </div>
                                            {sub.payment?.razorpayPaymentId && (
                                                <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                    <CreditCard className="h-3 w-3" />
                                                    {sub.payment.razorpayPaymentId}
                                                </div>
                                            )}
                                        </td>

                                        {/* Amount */}
                                        <td className="px-4 py-3.5 font-bold text-foreground">
                                            ₹{sub.amount}
                                        </td>

                                        {/* Purchase Date */}
                                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                                            <div className="font-medium text-foreground">
                                                {format(startsAtDate, "dd MMM yyyy")}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                {format(startsAtDate, "hh:mm a")}
                                            </div>
                                        </td>

                                        {/* Expiry Date (1 Year) */}
                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-foreground flex items-center gap-1 text-xs">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                {format(endsAtDate, "dd MMM yyyy")}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                {format(endsAtDate, "hh:mm a")}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5">
                                            {sub.isCurrentlyActive ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Active ({sub.daysRemaining}d left)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Expired
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

