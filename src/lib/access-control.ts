import { prisma } from "@/lib/db"

/**
 * Check if a user has an active subscription
 * @param userId - The user's ID
 * @returns boolean - true if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            isActive: true,
            endsAt: {
                gte: new Date() // Subscription end date is in the future
            }
        }
    })

    return !!subscription
}

/**
 * Check if user can access specific content
 * @param userId - The user's ID (can be null for guests)
 * @param contentId - The content ID to check access for
 * @returns boolean - true if user can access the content
 */
export async function canAccessContent(
    userId: string | null,
    contentId: string
): Promise<boolean> {
    const content = await prisma.content.findUnique({
        where: { id: contentId },
        include: { chapter: { include: { subject: true } } }
    })

    if (!content) return false

    // Free content is accessible to everyone
    if (content.isFree) return true

    // Premium content requires authentication and active subscription
    if (!userId) return false

    // Check if subscription matches subject/class
    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            isActive: true,
            endsAt: { gt: new Date() },
            OR: [
                { planType: "FULL_ACCESS", class: null }, // Combo (All Classes)
                { planType: "FULL_ACCESS", class: content.chapter.subject.class }, // Premium (Specific Class)
                { subjectId: content.chapter.subject.id } // Specific Subject
            ]
        }
    })

    return !!subscription
}

/**
 * Check if user can access content in a specific chapter
 * @param userId - The user's ID (can be null for guests)
 * @param chapterId - The chapter ID
 * @returns Object with free and premium content counts
 */
export async function getChapterAccess(
    userId: string | null,
    chapterId: string
) {
    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
            subject: true,
            contents: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    isFree: true,
                    order: true
                },
                orderBy: { order: "asc" }
            }
        }
    })

    if (!chapter) return []

    let hasSubscription = false

    if (userId) {
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId,
                isActive: true,
                endsAt: { gt: new Date() },
                OR: [
                    { planType: "FULL_ACCESS", class: null }, // Combo (All Classes)
                    { planType: "FULL_ACCESS", class: chapter.subject.class }, // Premium (Specific Class)
                    { subjectId: chapter.subject.id } // Specific Subject
                ]
            }
        })
        hasSubscription = !!subscription
    }

    return chapter.contents.map(content => ({
        ...content,
        isAccessible: content.isFree || hasSubscription
    }))
}

/**
 * Check if user has admin role
 * @param userId - The user's ID
 * @returns boolean - true if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    })

    return user?.role === "ADMIN"
}

/**
 * Get user's active subscriptions with details
 * @param userId - The user's ID
 * @returns Array of active subscriptions
 */
export async function getUserSubscriptions(userId: string) {
    return await prisma.subscription.findMany({
        where: {
            userId,
            isActive: true,
            endsAt: {
                gte: new Date()
            }
        },
        orderBy: {
            endsAt: "desc"
        }
    })
}
