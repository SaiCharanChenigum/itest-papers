import Link from "next/link";
import { Package, LayoutDashboard, Settings, User } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-background hidden md:flex flex-col">
                <div className="p-6 border-b border-border">
                    <h2 className="font-bold text-lg text-primary flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5" /> Admin Panel
                    </h2>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <Link 
                        href="/admin/orders" 
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md bg-accent text-accent-foreground"
                    >
                        <Package className="h-4 w-4" />
                        Manage Orders
                    </Link>
                    <Link 
                        href="/dashboard" 
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        <User className="h-4 w-4" />
                        Student Dashboard
                    </Link>
                </nav>
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary italic">
                            AD
                        </div>
                        <span className="text-sm font-semibold truncate">Administrator</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-8 md:hidden">
                    <h2 className="font-bold text-primary">Admin Panel</h2>
                    <button className="p-2 rounded-md border border-border">
                        <Package className="h-5 w-5" />
                    </button>
                </header>

                <div className="flex-1 section-padding">
                    <div className="container-main max-w-6xl">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
