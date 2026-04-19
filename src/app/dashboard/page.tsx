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
