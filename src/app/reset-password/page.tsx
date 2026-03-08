"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { CheckCircle2, KeyRound, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid reset link. Please request a new one.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || "Something went wrong. Please try again.");
                return;
            }

            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="card-academic text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-9 h-9 text-secondary" />
                </div>
                <h1 className="text-2xl font-bold mb-3">Password Reset!</h1>
                <p className="text-muted-foreground mb-2 leading-relaxed">
                    Your password has been updated successfully.
                </p>
                <p className="text-sm text-muted-foreground mb-6">Redirecting you to login...</p>
                <Link href="/login">
                    <Button className="w-full">Go to Login</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="card-academic">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto mb-5">
                <KeyRound className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Set New Password</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
                Choose a strong password of at least 8 characters.
            </p>

            {error && (
                <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={!token}>
                    {isLoading ? "Updating..." : "Reset Password"}
                </Button>
            </form>

            <div className="mt-5 text-center text-sm">
                <Link href="/forgot-password" className="text-primary hover:underline">
                    Request a new reset link
                </Link>
            </div>
        </div>
    );
}

const ResetPasswordPage = () => (
    <section className="section-padding">
        <div className="container-main max-w-md">
            <Suspense fallback={<div className="card-academic text-center text-muted-foreground">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    </section>
);

export default ResetPasswordPage;
