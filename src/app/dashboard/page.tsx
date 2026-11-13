import { auth } from "@/auth"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { NavButton } from "@/components/ui/NavButton"
import { User, BookOpen, Clock, Settings, LogOut, Award, Crown, Calendar, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from "lucide-react"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const user = session.user
    
    // Fetch all user subscriptions (active and past) with 1-year details
    const allSubscriptions = await prisma.subscription.findMany({
        where: { userId: user.id },
        orderBy: { endsAt: "desc" }
    })

    const now = new Date()
    const activeSubscriptions = allSubscriptions.filter(s => s.isActive && new Date(s.endsAt) > now)
    const hasActiveSubscription = activeSubscriptions.length > 0
    const expiredSubscriptions = allSubscriptions.filter(s => !s.isActive || new Date(s.endsAt) <= now)

    // Fetch user progress
    const userProgress = await prisma.userProgress.findMany({
        where: { userId: user.id },
        select: {
            contentId: true,
            completed: true,
            lastAccessed: true
        }
    })

    // Fetch accessible subjects with their chapters and content details to calculate progress
    const allSubjects = await prisma.subject.findMany({
        where: { isActive: true },
        include: {
            chapters: {
                include: {
                    contents: {
                        select: { id: true }
                    }
                }
            }
        }
    })

    // Calculate progress for each subject
    const subjectsWithProgress = allSubjects.map(subject => {
        const allContentIds = subject.chapters.flatMap(c => c.contents.map(cnt => cnt.id))
        const totalContent = allContentIds.length
        
        // Items are "viewed" if they exist in progress; "completed" if completed: true
        const completedCount = allContentIds.filter(id => 
            userProgress.some(p => p.contentId === id && p.completed)
        ).length
        
        const progressPercentage = totalContent > 0 
            ? Math.round((completedCount / totalContent) * 100) 
            : 0

        // Find the most recent activity for this subject
        const subjectProgressEntries = userProgress.filter(p => allContentIds.includes(p.contentId))
        const latestStats = subjectProgressEntries.length > 0 
            ? Math.max(...subjectProgressEntries.map(p => p.lastAccessed.getTime())) 
            : 0

        // Format the URL slug
        const subjectSlug = `/icse-class-${subject.class}-${subject.name.toLowerCase().replace(/\s+/g, '-')}`

        return {
            ...subject,
            progressPercentage,
            lastAccessed: latestStats,
            subjectSlug
        }
    })

    // "Continue Learning" section: showed subjects with recent activity first, followed by others
    const sortedSubjects = [...subjectsWithProgress].sort((a, b) => b.lastAccessed - a.lastAccessed)

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

                                <div className="mt-4 flex flex-col gap-2">
                                    {hasActiveSubscription ? (
                                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                                            <Crown className="w-3 h-3 mr-1" />
                                            Premium Member
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                            Free Plan
                                        </div>
                                    )}

                                    {user.role === "ADMIN" && (
                                        <Link 
                                            href="/admin/orders" 
                                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                                        >
                                            <Settings className="w-3 h-3 mr-1.5" />
                                            Admin Dashboard
                                        </Link>
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
                                    {hasActiveSubscription
                                        ? "Your 1-year premium subscription is active. Enjoy unlimited access to all materials!"
                                        : "You've made great progress. Upgrade to unlock complete 1-year study materials!"}
                                </p>
                            </div>
                            {!hasActiveSubscription && (
                                <NavButton href="/pricing" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/20">
                                    Upgrade to 1-Year Access
                                </NavButton>
                            )}
                        </div>

                        {/* Active Subscriptions Card */}
                        {hasActiveSubscription && (
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                                        <Crown className="w-5 h-5 mr-2 text-amber-500" />
                                        Your 1-Year Subscription
                                    </h2>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                    </span>
                                </div>

                                <div className="grid gap-4">
                                    {activeSubscriptions.map((sub) => {
                                        const startDate = new Date(sub.startsAt)
                                        const endDate = new Date(sub.endsAt)
                                        const formattedStart = startDate.toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })
                                        const formattedEnd = endDate.toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })

                                        const totalDurationMs = endDate.getTime() - startDate.getTime()
                                        const elapsedMs = Math.max(0, now.getTime() - startDate.getTime())
                                        const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)))

                                        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

                                        return (
                                            <Card key={sub.id} className="border border-slate-200/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50 overflow-hidden">
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck className="w-5 h-5 text-teal-600" />
                                                                <h3 className="font-bold text-lg text-slate-900">{sub.planName}</h3>
                                                            </div>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                                                <span>Duration: <strong>1 Full Year</strong></span>
                                                                <span>•</span>
                                                                <span>Purchased on: {formattedStart}</span>
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <div className="text-right">
                                                                <p className="text-xs text-slate-500">Valid Until</p>
                                                                <p className="text-sm font-bold text-teal-700 flex items-center gap-1 justify-end">
                                                                    <Calendar className="w-4 h-4" />
                                                                    {formattedEnd}
                                                                </p>
                                                            </div>
                                                            <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold text-center min-w-[90px]">
                                                                <span className="block font-bold text-sm text-teal-900">{daysRemaining}</span>
                                                                days left
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Progress bar and details */}
                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                                                            <span>1-Year Access Period</span>
                                                            <span>{progressPercent}% completed</span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${progressPercent}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-2 gap-2">
                                                            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                                                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                                <span>All ICSE notes, chapter test papers, and model papers unlocked</span>
                                                            </div>
                                                            <Link
                                                                href="/pricing"
                                                                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                                                            >
                                                                Extend or Change Plan <ArrowRight className="w-3 h-3" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Expired Subscriptions Alert */}
                        {!hasActiveSubscription && expiredSubscriptions.length > 0 && (
                            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 font-bold text-base text-amber-950">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                        Your 1-Year Subscription has Expired
                                    </div>
                                    <p className="text-xs text-amber-800">
                                        Expired on {new Date(expiredSubscriptions[0].endsAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}. Renew today for another full year of complete access to notes and test papers.
                                    </p>
                                </div>
                                <NavButton
                                    href="/pricing"
                                    className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 text-xs px-4 py-2"
                                >
                                    Renew for 1 Year
                                </NavButton>
                            </div>
                        )}

                        {/* Recent Courses */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
                                Continue Learning
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedSubjects.map((subject) => (
                                    <Card key={subject.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3 text-left">
                                            <CardTitle className="text-lg font-bold text-slate-900">{subject.name}</CardTitle>
                                            <CardDescription>Class {subject.class}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-xs font-bold text-teal-600">{subject.progressPercentage}%</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Completed</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                                                <div 
                                                    className="bg-teal-500 h-2 rounded-full transition-all duration-500" 
                                                    style={{ width: `${subject.progressPercentage}%` }}
                                                ></div>
                                            </div>

                                            <NavButton className="w-full" variant={subject.progressPercentage > 0 ? "default" : "outline"} href={subject.subjectSlug}>
                                                {subject.progressPercentage === 100 ? "Review Course" : (subject.progressPercentage > 0 ? "Continue" : "Start Now")}
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
