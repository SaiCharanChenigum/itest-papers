import NextAuth, { type DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession["user"] & {
    id: string
    role: string
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }
    interface User {
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
    }
}
