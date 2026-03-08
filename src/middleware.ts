import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { pathname } = req.nextUrl

    // Protect API routes (except public ones)
    if (pathname.startsWith("/api")) {
        // Public API routes
        const publicApiRoutes = [
            "/api/auth",
            "/api/subjects",
        ]

        const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route))

        if (!isPublicApi && !isLoggedIn) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            )
        }
    }

    // Protect dashboard and user-specific pages
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", req.url))
        }
    }

    // Redirect logged-in users away from login/register pages
    if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
