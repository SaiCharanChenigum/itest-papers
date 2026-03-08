import { auth } from "@/auth"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { getUserSubscriptions } from "@/lib/access-control"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { NavButton } from "@/components/ui/NavButton"
import { User, BookOpen, Clock, Settings, LogOut, Award, Crown } from "lucide-react"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const user = session.user
    const subscriptions = await getUserSubscriptions(user.id)
    const hasActiveSubscription = subscriptions.length > 0 && subscriptions.some(s => s.isActive)

    // Fetch valid subjects
    const accessibleSubjects = await prisma.subject.findMany({
        where: { isActive: true },
        orderBy: [
            { class: "asc" },
            { name: "asc" }
        ]
    })

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className="w-full md:w-64 space-y-6">
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <div className="h-24 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
                            <div className="px-6 pb-6 text-center -mt-10">
                                <div className="w-20 h-20 bg-white rounded-full p-1 mx-auto shadow-md">
                                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10" />
                                        )}
                                    </div>
                                </div>
                                <h2 className="mt-3 font-bold text-slate-900">{user.name}</h2>
                                <p className="text-sm text-slate-500">{user.email}</p>

                                <div className="mt-4">
                                    {hasActiveSubscription ? (
                                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                                            <Crown className="w-3 h-3 mr-1" />
                                            Premium Member
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                            Free Plan
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>


                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 space-y-8">

                        {/* Welcome Banner */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                    Welcome back, {user.name?.split(" ")[0]}! 👋
                                </h1>
                                <p className="text-slate-600">
                                    You've made great progress. Keep it up!
                                </p>
                            </div>
                            {!hasActiveSubscription && (
                                <NavButton href="/pricing" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/20">
                                    Upgrade to Premium
                                </NavButton>
                            )}
                        </div>

                        {/* Recent Courses */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
                                Continue Learning
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {accessibleSubjects.map((subject) => (
                                    <Card key={subject.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg font-bold text-slate-900">{subject.name}</CardTitle>
                                            <CardDescription>Class {subject.class}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                                                {/* In a real app, calculate true progress here */}
                                                <div className="bg-teal-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                                            </div>
                                            <p className="text-xs text-slate-500 text-right">Begin Course</p>

                                            <NavButton className="w-full mt-4" variant="outline" href={`/icse-class-${subject.class}-${subject.name.toLowerCase()}`}>
                                                Start Now
                                            </NavButton>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>



                    </main>
                </div>
            </div>
        </div>
    )
}
