"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import {
    IndianRupee,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
    Sparkles,
    GraduationCap,
    Layers
} from "lucide-react";
import { PricingRates, DEFAULT_PRICING_RATES } from "@/lib/pricing";

interface PricingRateManagerProps {
    initialRates?: PricingRates;
}

export default function PricingRateManager({ initialRates = DEFAULT_PRICING_RATES }: PricingRateManagerProps) {
    const [rates, setRates] = useState<PricingRates>(initialRates);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleRateChange = (planKey: keyof PricingRates, value: string) => {
        const num = parseFloat(value);
        setRates(prev => ({
            ...prev,
            [planKey]: isNaN(num) ? 0 : num
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        // Validation
        if (rates.CLASS_9_FULL < 0 || rates.CLASS_10_FULL < 0 || rates.ALL_ACCESS < 0) {
            setErrorMessage("Rates cannot be negative.");
            setIsSaving(false);
            return;
        }

        try {
            const res = await fetch("/api/admin/pricing", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rates })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to update pricing rates");
            }

            const data = await res.json();
            if (data.rates) {
                setRates(data.rates);
            }
            setSuccessMessage("Pricing rates updated successfully! New rates are now active on the website and checkout.");
        } catch (err: any) {
            console.error("Save pricing error:", err);
            setErrorMessage(err.message || "Failed to save pricing rates");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="p-6 border border-border shadow-xs bg-card" id="pricing-rates">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                            <IndianRupee className="h-5 w-5 text-primary" />
                            Subscription Pricing Rates
                        </h2>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Live on Site
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configure the exact rates in Rupees (₹) charged for student subscriptions on the website.
                    </p>
                </div>
            </div>

            {/* Notifications */}
            {successMessage && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                    <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={() => setErrorMessage(null)} className="text-destructive hover:opacity-80">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSave} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Class 9 Plan */}
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border flex flex-col justify-between hover:border-primary/40 transition-colors">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Class 9 Full
                                </span>
                                <GraduationCap className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-bold text-base text-foreground mb-1">Class 9 (Bio & Chem)</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Full 1-year access to all Class 9 notes, test papers & solutions.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rate-class-9" className="text-xs font-semibold text-foreground">
                                Rate in Rupees (₹)
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                                    ₹
                                </span>
                                <Input
                                    id="rate-class-9"
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="pl-7 text-base font-bold"
                                    value={rates.CLASS_9_FULL}
                                    onChange={(e) => handleRateChange("CLASS_9_FULL", e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Class 10 Plan */}
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border flex flex-col justify-between hover:border-primary/40 transition-colors">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Class 10 Full
                                </span>
                                <GraduationCap className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-bold text-base text-foreground mb-1">Class 10 (Bio & Chem)</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Full 1-year access to all Class 10 notes, test papers & solutions.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rate-class-10" className="text-xs font-semibold text-foreground">
                                Rate in Rupees (₹)
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                                    ₹
                                </span>
                                <Input
                                    id="rate-class-10"
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="pl-7 text-base font-bold"
                                    value={rates.CLASS_10_FULL}
                                    onChange={(e) => handleRateChange("CLASS_10_FULL", e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Combo Plan */}
                    <div className="p-5 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent border border-primary/20 flex flex-col justify-between shadow-2xs">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> All Access Combo
                                </span>
                                <Layers className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-bold text-base text-foreground mb-1">Combo (Class 9 + 10)</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Complete all-access pass for both Class 9 & Class 10 across all subjects.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rate-combo" className="text-xs font-semibold text-foreground">
                                Rate in Rupees (₹)
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                                    ₹
                                </span>
                                <Input
                                    id="rate-combo"
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="pl-7 text-base font-bold text-primary"
                                    value={rates.ALL_ACCESS}
                                    onChange={(e) => handleRateChange("ALL_ACCESS", e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button type="submit" disabled={isSaving} className="gap-2 px-6">
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Saving Rates...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" /> Save Rates
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    );
}

