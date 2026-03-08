"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { NavButton } from "@/components/ui/NavButton";
import { useCart } from "@/context/CartContext";

const subjects = [
  { label: "ICSE Class 9 Biology", to: "/icse-class-9-biology" },
  { label: "ICSE Class 9 Chemistry", to: "/icse-class-9-chemistry" },
  { label: "ICSE Class 10 Biology", to: "/icse-class-10-biology" },
  { label: "ICSE Class 10 Chemistry", to: "/icse-class-10-chemistry" },
];

const Header = () => {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount } = useCart();

  // Close mobile drawer whenever the page changes (navigation complete)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container-main flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center -ml-4">
          <img src="/itestpapers official logo (2).svg" alt="itestpapers" className="h-[120px] w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-accent">
            Home
          </Link>

          <div className="relative group">
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-accent">
              Subjects <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-card border border-border rounded-xl shadow-lg p-2 min-w-[220px]">
                {subjects.map((s) => (
                  <NavButton
                    key={s.to}
                    href={s.to}
                    variant="ghost"
                    size="sm"
                    className="flex items-center w-full text-left justify-start px-3 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-accent rounded-lg h-auto font-normal"
                  >
                    {s.label}
                  </NavButton>
                ))}
              </div>
            </div>
          </div>

          <Link href="/pricing" className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-accent">
            Pricing
          </Link>
          <Link href="/blog" className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-accent">
            Blog
          </Link>
          <Link
            href="/cart"
            className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-accent flex items-center gap-1"
          >
            Cart {cartCount > 0 && <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartCount}</span>}
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <>
              <NavButton variant="ghost" href="/dashboard">
                Dashboard
              </NavButton>
              <Button variant="outline" onClick={() => signOut()}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavButton variant="ghost" href="/login">
                Login
              </NavButton>
              <NavButton href="/register">
                Register
              </NavButton>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="px-4 py-4 space-y-1">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent">Home</Link>

            <button onClick={() => setSubjectsOpen(!subjectsOpen)} className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent">
              Subjects <ChevronDown className={`h-3.5 w-3.5 transition-transform ${subjectsOpen ? "rotate-180" : ""}`} />
            </button>
            {subjectsOpen && (
              <div className="pl-4 space-y-1">
                {subjects.map((s) => (
                  <NavButton
                    key={s.to}
                    href={s.to}
                    variant="ghost"
                    size="sm"
                    className="flex items-center w-full text-left justify-start px-3 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg h-auto font-normal"
                  >
                    {s.label}
                  </NavButton>
                ))}
              </div>
            )}

            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent">Pricing</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent">Blog</Link>
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent flex justify-between items-center"
            >
              Cart {cartCount > 0 && <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartCount}</span>}
            </Link>

            <div className="pt-3 flex flex-col gap-2">
              {session ? (
                <>
                  <NavButton variant="outline" className="w-full" href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</NavButton>
                  <Button variant="outline" className="w-full" onClick={() => { signOut(); setMobileOpen(false); }}>Logout</Button>
                </>
              ) : (
                <>
                  <NavButton variant="outline" className="w-full" href="/login" onClick={() => setMobileOpen(false)}>Login</NavButton>
                  <NavButton className="w-full" href="/register" onClick={() => setMobileOpen(false)}>Register</NavButton>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
