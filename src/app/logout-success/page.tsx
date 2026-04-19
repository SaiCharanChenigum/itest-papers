"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NavButton } from "@/components/ui/NavButton";

export default function LogoutSuccessPage() {
    const router = useRouter();

    // Automatically send them home after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/");
        }, 5000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Successfully Logged Out</h1>
                <p className="text-slate-600 mb-8">
                    You have been securely logged out of your account. Thank you for studying with iTestPapers!
                </p>
                
                <div className="flex flex-col gap-3">
                    <NavButton href="/" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12">
                        <Home className="mr-2 h-4 w-4" /> Back to Home Page
                    </NavButton>
                    <NavButton href="/login" variant="outline" className="w-full h-12 font-semibold">
                        <LogIn className="mr-2 h-4 w-4" /> Login Again
                    </NavButton>
                </div>
                
                <p className="mt-8 text-xs text-slate-400">
                    Redirecting to home page in 5 seconds...
                </p>
            </div>
        </div>
    );
}
