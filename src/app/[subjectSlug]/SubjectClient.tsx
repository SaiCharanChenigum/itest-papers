"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Eye, FileText, ArrowRight, ShoppingCart, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NavButton } from "@/components/ui/NavButton";
import { useCart } from "@/context/CartContext";

interface SubjectClientProps {
    subject: any;
    hasAccess: boolean;
    subjectSlug: string;
}

export default function SubjectClient({ subject, hasAccess, subjectSlug }: SubjectClientProps) {
    const { addToCart, cartItems } = useCart();
    const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

    const handleAddToCart = async (chapterId: string) => {
        setAddingToCartId(chapterId);
        await addToCart(chapterId);
        setAddingToCartId(null);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border text-left">
                        <th className="py-3 px-4 text-sm font-semibold">Chapter</th>
                        <th className="py-3 px-4 text-sm font-semibold text-center">Notes</th>
                        <th className="py-3 px-4 text-sm font-semibold text-center">Test Paper</th>
                        <th className="py-3 px-4 text-sm font-semibold text-center">Status</th>
                        <th className="py-3 px-4 text-sm font-semibold text-center">Delivery</th>
                    </tr>
                </thead>
                <tbody>
                    {subject.chapters.map((ch: any, index: number) => {
                        const isFree = index === 0;
                        const unlocked = isFree || hasAccess;
                        const inCart = cartItems.some(item => item.chapterId === ch.id);

                        return (
                            <tr key={ch.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                <td className="py-4 px-4">
                                    <Link href={`/${subjectSlug}/${ch.id}`} className="font-medium text-sm hover:text-primary hover:underline">
                                        {ch.title}
                                    </Link>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    {unlocked ? (
                                        <Link href={`/${subjectSlug}/${ch.id}?tab=NOTES`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                            <Eye className="h-3.5 w-3.5" /> View
                                        </Link>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                            <Lock className="h-3.5 w-3.5" /> Locked
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    {unlocked ? (
                                        <Link href={`/${subjectSlug}/${ch.id}?tab=TEST_PAPER`} className="inline-flex items-center gap-1 text-sm text-secondary hover:underline">
                                            <FileText className="h-3.5 w-3.5" /> Attempt
                                        </Link>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                            <Lock className="h-3.5 w-3.5" /> Locked
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    {unlocked ? (
                                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">{isFree ? 'FREE' : 'UNLOCKED'}</span>
                                    ) : (
                                        <Link href="/pricing">
                                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold cursor-pointer hover:bg-primary/20 transition-colors">Premium</span>
                                        </Link>
                                    )}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    {unlocked ? (
                                        inCart ? (
                                            <span className="inline-flex items-center gap-1 text-sm text-secondary font-medium">
                                                <Check className="h-4 w-4" /> Added
                                            </span>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs gap-1.5"
                                                onClick={() => handleAddToCart(ch.id)}
                                                disabled={addingToCartId === ch.id}
                                            >
                                                {addingToCartId === ch.id ? (
                                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                ) : (
                                                    <ShoppingCart className="h-3.5 w-3.5" />
                                                )}
                                                {addingToCartId === ch.id ? "Adding..." : "Add to Cart"}
                                            </Button>
                                        )
                                    ) : (
                                        <span className="text-sm text-muted-foreground/60 italic text-xs">Unlock to Order</span>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {/* Upgrade CTA — only show if user doesn't have access */}
            {!hasAccess && (
                <div className="mt-8 card-academic bg-accent/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold mb-1">Unlock All Chapters</h3>
                        <p className="text-sm text-muted-foreground">Get full access to notes, test papers, and order physical books.</p>
                    </div>
                    <NavButton href="/pricing">
                        Upgrade Now <ArrowRight className="ml-1.5 h-4 w-4" />
                    </NavButton>
                </div>
            )}

            {/* Solutions Inquiry Notice */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-100 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <Mail className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-sm sm:text-base">Looking for Test Paper Solutions?</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            For complete step-by-step solutions and answer keys, please reach out to us at{" "}
                            <a
                                href="mailto:itestpapers@gmail.com"
                                className="font-semibold text-primary hover:underline"
                            >
                                itestpapers@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
                <a
                    href="mailto:itestpapers@gmail.com?subject=Request%20for%20Solutions%20-%20ICSE"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-border hover:border-primary/40 text-foreground font-semibold text-xs sm:text-sm shadow-xs hover:bg-accent transition-colors shrink-0"
                >
                    <Mail className="h-4 w-4 text-primary" /> Email for Solutions
                </a>
            </div>
        </div>
    );
}
