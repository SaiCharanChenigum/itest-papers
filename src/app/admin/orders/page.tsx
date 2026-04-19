import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import OrderTable from "@/components/admin/OrderTable";
import { Package } from "lucide-react";

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

    return (
        <div className="space-y-8">
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
    );
}
