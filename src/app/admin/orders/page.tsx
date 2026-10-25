import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import OrderTable from "@/components/admin/OrderTable";
import { Package } from "lucide-react";
import ContentManagerClient from "./ContentManagerClient";
import MaterialPreviewManager from "@/components/admin/MaterialPreviewManager";
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

            {/* Homepage Material Previews Section */}
            <MaterialPreviewManager initialPreviews={initialPreviews} />

            {/* Curriculum & Content Management Section */}
            <div id="content-manager">
                <ContentManagerClient initialSubjects={subjectsWithSlots} />
            </div>
        </div>
    );
}
