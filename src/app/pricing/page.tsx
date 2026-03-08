import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import PricingClient from "./PricingClient";

/**
 * Server component — fetches the user's active subscriptions and
 * passes them to PricingClient so it can show "Subscribed" badges.
 */
export default async function PricingPage() {
    const session = await auth();

    const userSubscriptions = { class9: false, class10: false, combo: false };

    if (session?.user?.id) {
        const subs = await prisma.subscription.findMany({
            where: {
                userId: session.user.id,
                isActive: true,
                endsAt: { gt: new Date() },
            },
            select: { planType: true, class: true },
        });

        for (const sub of subs) {
            if (sub.planType === "FULL_ACCESS") {
                if (sub.class === null) userSubscriptions.combo = true;
                if (sub.class === 9) userSubscriptions.class9 = true;
                if (sub.class === 10) userSubscriptions.class10 = true;
            }
        }
    }

    return <PricingClient userSubscriptions={userSubscriptions} />;
}
