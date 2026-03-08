"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const LoginPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="section-padding">
            <div className="container-main max-w-md">
                <div className="card-academic">
                    <h1 className="text-2xl font-bold text-center mb-6">Login to itestpapers</h1>
                    {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                            Login
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
                        <p><Link href="/forgot-password" className="text-primary hover:underline">Forgot Password?</Link></p>
                        <p>Don&apos;t have an account? <Link href="/register" className="text-primary font-medium hover:underline">Register Now</Link></p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;
