"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Eye, FileText, ArrowRight, ShoppingCart, Check } from "lucide-react";
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
                                    <span className="font-medium text-sm">{ch.title}</span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    {unlocked ? (
                                        <Link href={`/${subjectSlug}/${ch.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
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
                                        <Link href={`/${subjectSlug}/${ch.id}`} className="inline-flex items-center gap-1 text-sm text-secondary hover:underline">
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
                                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Premium</span>
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
        </div>
    );
}
