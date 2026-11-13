import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPricingRates } from "@/lib/pricing";
import PricingClient from "./PricingClient";

export const dynamic = "force-dynamic";

/**
 * Server component — fetches dynamic rates and user's active subscriptions
 * and passes them to PricingClient.
 */
export default async function PricingPage() {
    const session = await auth();

    const userSubscriptions = {
        class9: false,
        class10: false,
        combo: false,
        class9EndsAt: null as string | null,
        class10EndsAt: null as string | null,
        comboEndsAt: null as string | null,
    };

    if (session?.user?.id) {
        const subs = await prisma.subscription.findMany({
            where: {
                userId: session.user.id,
                isActive: true,
                endsAt: { gt: new Date() },
            },
            select: { planType: true, class: true, endsAt: true },
            orderBy: { endsAt: "desc" }
        });

        for (const sub of subs) {
            const endsAtIso = sub.endsAt.toISOString();
            if (sub.planType === "FULL_ACCESS") {
                if (sub.class === null) {
                    userSubscriptions.combo = true;
                    if (!userSubscriptions.comboEndsAt) userSubscriptions.comboEndsAt = endsAtIso;
                }
                if (sub.class === 9) {
                    userSubscriptions.class9 = true;
                    if (!userSubscriptions.class9EndsAt) userSubscriptions.class9EndsAt = endsAtIso;
                }
                if (sub.class === 10) {
                    userSubscriptions.class10 = true;
                    if (!userSubscriptions.class10EndsAt) userSubscriptions.class10EndsAt = endsAtIso;
                }
            }
        }
    }

    const rates = await getPricingRates();

    return <PricingClient userSubscriptions={userSubscriptions} rates={rates} />;
}
