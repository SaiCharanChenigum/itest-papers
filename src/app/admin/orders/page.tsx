import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import OrderTable from "@/components/admin/OrderTable";
import SubscriptionTable from "@/components/admin/SubscriptionTable";
import { Package, Crown } from "lucide-react";
import ContentManagerClient from "./ContentManagerClient";
import MaterialPreviewManager from "@/components/admin/MaterialPreviewManager";
import PricingRateManager from "@/components/admin/PricingRateManager";
import HeroImageManager from "@/components/admin/HeroImageManager";
import BannerStudio from "@/components/admin/BannerStudio";
import { getPricingRates } from "@/lib/pricing";
import { getHeroImageUrl } from "@/lib/hero";
import { getHomepageBanner } from "@/lib/banner";
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
    const session = await auth();

    // Security check: Only admins can view this page
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Fetch all orders from database
    const orders = await prisma.deliveryOrder.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true
                }
            },
            items: {
                include: {
                    chapter: {
                        select: { title: true }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    // Serialize orders for client-side use (handling date conversion)
    const serializedOrders = JSON.parse(JSON.stringify(orders));

    // Fetch all student subscriptions
    const subscriptions = await prisma.subscription.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            payment: {
                select: {
                    razorpayPaymentId: true,
                    razorpayOrderId: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    const serializedSubscriptions = JSON.parse(JSON.stringify(subscriptions));

    // Fetch subjects and content for management
    const subjects = await prisma.subject.findMany({
        include: {
            chapters: {
                include: {
                    contents: {
                        orderBy: { order: "asc" }
                    }
                },
                orderBy: { order: "asc" }
            }
        },
        orderBy: { class: "asc" }
    });

    // Ensure slots and board are loaded from the database directly
    let slotsMap = new Map<string, string[]>();
    let boardMap = new Map<string, string>();
    try {
        const subjectMetadataRows = await prisma.$queryRawUnsafe<Array<{ id: string, slots: string[] | null, board: string | null }>>(
            'SELECT id, slots, board FROM "Subject"'
        );
        slotsMap = new Map(subjectMetadataRows.map(r => [r.id, r.slots || ['NOTES', 'TEST_PAPER']]));
        boardMap = new Map(subjectMetadataRows.map(r => [r.id, r.board || 'ICSE']));
    } catch (e) {
        console.error("Failed to fetch subject metadata via raw query:", e);
    }

    const subjectsWithSlots = subjects.map(s => ({
        ...s,
        board: boardMap.get(s.id) || 'ICSE',
        slots: slotsMap.get(s.id) || ['NOTES', 'TEST_PAPER']
    }));

    // Fetch material previews for the homepage
    let initialPreviews: any[] = [];
    try {
        const previewRows = await prisma.$queryRawUnsafe<any[]>(
            'SELECT id, title, "imageUrl", width, height, "order", "createdAt", "updatedAt" FROM "MaterialPreview" ORDER BY "order" ASC, "createdAt" ASC'
        );
        initialPreviews = previewRows.map(r => ({
            ...r,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
        }));
    } catch (e) {
        console.error("Failed to fetch material previews via raw query:", e);
    }

    // Fetch dynamic pricing rates
    const initialRates = await getPricingRates();

    // Fetch dynamic hero image
    const initialHeroImage = await getHeroImageUrl();

    // Fetch dynamic homepage banner
    const initialBanner = await getHomepageBanner();

    return (
        <div className="space-y-12">
            <div id="orders" className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Package className="h-8 w-8 text-primary" /> Delivery Orders
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                            Manage all physical paper deliveries and track customer orders in real-time.
                        </p>
                    </div>
                    <div className="bg-primary/5 border border-primary/10 px-4 py-2 rounded-full">
                        <span className="text-sm font-semibold text-primary">{orders.length} Total Orders</span>
                    </div>
                </div>

                <OrderTable initialOrders={serializedOrders} />
            </div>

            {/* Student Subscriptions & 1-Year Expiries Section */}
            <div id="subscriptions" className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Crown className="h-7 w-7 text-amber-500" /> Student Subscriptions
                        </h2>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                            Track student premium plans, 1-year expiry timelines, and active access privileges.
                        </p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full">
                        <span className="text-sm font-semibold text-amber-700">
                            {serializedSubscriptions.length} Total Subscriptions
                        </span>
                    </div>
                </div>

                <SubscriptionTable initialSubscriptions={serializedSubscriptions} />
            </div>

            {/* Subscription Pricing Rates Section */}
            <PricingRateManager initialRates={initialRates} />

            {/* Homepage Hero Image Section */}
            <div id="hero-image">
                <HeroImageManager initialHeroImage={initialHeroImage} />
            </div>

            {/* Homepage Custom Canvas Banner Section */}
            <div id="homepage-banner">
                <BannerStudio initialBanner={initialBanner} />
            </div>

            {/* Homepage Material Previews Section */}
            <MaterialPreviewManager initialPreviews={initialPreviews} />

            {/* Curriculum & Content Management Section */}
            <div id="content-manager">
                <ContentManagerClient initialSubjects={subjectsWithSlots} />
            </div>
        </div>
    );
}
