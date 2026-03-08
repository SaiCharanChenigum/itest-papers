"use client";

import { useState } from "react";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { CheckCircle2, Mail } from "lucide-react";

const EMAILJS_SERVICE_ID = "service_euq9gsm";
const EMAILJS_TEMPLATE_ID = "template_ayqmmaj";
const EMAILJS_PUBLIC_KEY = "ejWUMJJ_b0PSuayNW";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Frontend validation
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setError("Please enter your email address.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);

        try {
            // Step 1: Check if user exists and get reset token from backend
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: trimmedEmail }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || "Something went wrong. Please try again.");
                return;
            }

            // Step 2: Send reset email via EmailJS
            const resetLink = `${window.location.origin}/reset-password?token=${data.data.resetToken}`;

            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    to_name: data.data.userName,
                    to_email: data.data.userEmail,
                    reset_link: resetLink,
                },
                EMAILJS_PUBLIC_KEY
            );

            setSuccess(true);

        } catch (err: any) {
            console.error("Forgot password error:", err);
            setError("Failed to send reset email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <section className="section-padding">
                <div className="container-main max-w-md">
                    <div className="card-academic text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                            <CheckCircle2 className="w-9 h-9 text-secondary" />
                        </div>
                        <h1 className="text-2xl font-bold mb-3">Check Your Email</h1>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            We've sent a password reset link to <strong>{email}</strong>. The link expires in 1 hour.
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            Didn't receive it? Check your spam folder or{" "}
                            <button
                                className="text-primary hover:underline font-medium"
                                onClick={() => { setSuccess(false); setEmail(""); }}
                            >
                                try again
                            </button>.
                        </p>
                        <Link href="/login" className="text-sm text-primary hover:underline">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section-padding">
            <div className="container-main max-w-md">
                <div className="card-academic">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto mb-5">
                        <Mail className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-center mb-2">Forgot Password?</h1>
                    <p className="text-sm text-muted-foreground text-center mb-6">
                        Enter your registered email and we'll send you a reset link.
                    </p>

                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>

                    <div className="mt-5 text-center text-sm text-muted-foreground">
                        <Link href="/login" className="text-primary hover:underline">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ForgotPasswordPage;
