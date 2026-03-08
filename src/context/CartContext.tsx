"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
    id: string;
    chapterId: string;
    title: string;
    subjectName: string;
    className: string;
    quantity: number;
    price: number;
}

interface CartContextType {
    cartItems: CartItem[];
    isLoading: boolean;
    addToCart: (chapterId: string) => Promise<boolean>;
    updateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
    removeFromCart: (cartItemId: string) => Promise<void>;
    clearCartLocal: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCart = async () => {
        if (!session?.user?.id) {
            setCartItems([]);
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/cart");
            const data = await res.json();
            if (data.success) {
                setCartItems(data.cartItems);
            }
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [session?.user?.id]);

    const addToCart = async (chapterId: string) => {
        if (!session) return false;
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chapterId })
            });
            const data = await res.json();
            if (data.success) {
                await fetchCart(); // Refresh cart to get full item details
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error adding to cart", error);
            return false;
        }
    };

    const updateQuantity = async (cartItemId: string, newQuantity: number) => {
        if (newQuantity < 1) return removeFromCart(cartItemId);

        // Optimistic update
        setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));

        try {
            await fetch(`/api/cart/${cartItemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: newQuantity })
            });
        } catch (error) {
            console.error("Error updating quantity", error);
            fetchCart(); // Revert on failure
        }
    };

    const removeFromCart = async (cartItemId: string) => {
        // Optimistic update
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));

        try {
            await fetch(`/api/cart/${cartItemId}`, { method: "DELETE" });
        } catch (error) {
            console.error("Error removing from cart", error);
            fetchCart(); // Revert on failure
        }
    };

    const clearCartLocal = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            isLoading,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCartLocal,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
