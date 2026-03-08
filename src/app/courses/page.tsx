import { prisma } from "@/lib/db"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { BookOpen, ChevronRight, GraduationCap } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function CoursesPage() {
  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: [{ class: "asc" }, { name: "asc" }],
    include: {
      chapters: {
        select: { id: true }
      }
    }
  })

  const class9 = subjects.filter((s) => s.class === 9)
  const class10 = subjects.filter((s) => s.class === 10)

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Header */}
      <div className="bg-[#0B3C49] text-white py-12 mb-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-teal-100 max-w-2xl text-lg">
            Comprehensive learning materials for ICSE Class 9 & 10.
            Select your class and subject to start learning.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-16">
          {/* Class 10 Section */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-teal-100 rounded-xl text-teal-700">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Class 10</h2>
                <p className="text-slate-500">Board Year Preparation</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {class10.map((subject) => (
                <CourseCard key={subject.id} subject={subject} />
              ))}
            </div>
          </section>

          {/* Class 9 Section */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-cyan-100 rounded-xl text-cyan-700">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Class 9</h2>
                <p className="text-slate-500">Foundation Year</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {class9.map((subject) => (
                <CourseCard key={subject.id} subject={subject} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function CourseCard({ subject }: { subject: any }) {
  const isBiology = subject.name.toLowerCase().includes("biology")
  const gradient = isBiology
    ? "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20"
    : "from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20"

  const iconColor = isBiology ? "text-emerald-600" : "text-cyan-600"

  return (
    <Link href={`/subjects/${subject.id}`} className="group">
      <Card className={`h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br ${gradient}`}>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200">
              {subject.chapters.length} Chapters
            </Badge>
            {/* <Badge className="bg-teal-500 text-white">Free Preview</Badge> */}
          </div>
        </CardHeader>
        <CardContent>
          <h3 className={`text-2xl font-bold mb-2 group-hover:text-teal-700 transition-colors ${iconColor}`}>
            {subject.name}
          </h3>
          <p className="text-slate-600 mb-4 line-clamp-2">
            Complete study notes, test papers, and solutions for ICSE Class {subject.class} {subject.name}.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-white text-slate-900 border border-slate-200 hover:bg-white hover:text-teal-600 hover:border-teal-200 group-hover:translate-x-1 transition-all duration-300">
            View Course
            <ChevronRight className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
