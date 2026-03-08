import Link from "next/link";
import { Lock, Eye, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ChapterData = {
    name: string;
    slug: string;
    notes: boolean;
    test: boolean;
    free: boolean;
};

const subjectData: Record<string, { title: string; seoTitle: string; description: string; chapters: ChapterData[] }> = {
    "icse-class-9-biology": {
        title: "ICSE Class 9 Biology",
        seoTitle: "ICSE Class 9 Biology Notes & Test Papers",
        description: "Comprehensive chapter-wise notes and test papers for ICSE Class 9 Biology. Aligned with the latest ICSE syllabus and exam pattern.",
        chapters: [
            { name: "Cell – The Unit of Life", slug: "cell", notes: true, test: true, free: true },
            { name: "Tissues – Plant and Animal", slug: "tissues", notes: true, test: true, free: false },
            { name: "Plant Physiology", slug: "plant-physiology", notes: true, test: true, free: false },
            { name: "Human Anatomy & Physiology", slug: "human-anatomy", notes: true, test: true, free: false },
            { name: "Pollination & Fertilization", slug: "pollination", notes: true, test: true, free: false },
            { name: "Seeds – Structure & Germination", slug: "seeds", notes: true, test: true, free: false },
            { name: "Respiration in Plants", slug: "respiration-plants", notes: true, test: true, free: false },
            { name: "Five Kingdom Classification", slug: "five-kingdom", notes: true, test: true, free: false },
        ],
    },
    "icse-class-9-chemistry": {
        title: "ICSE Class 9 Chemistry",
        seoTitle: "ICSE Class 9 Chemistry Notes & Test Papers",
        description: "Complete chapter-wise study materials for ICSE Class 9 Chemistry including notes, test papers, and solutions.",
        chapters: [
            { name: "Matter & Its Composition", slug: "matter", notes: true, test: true, free: true },
            { name: "The Language of Chemistry", slug: "language-chemistry", notes: true, test: true, free: false },
            { name: "Water", slug: "water", notes: true, test: true, free: false },
            { name: "Atomic Structure", slug: "atomic-structure", notes: true, test: true, free: false },
            { name: "The Periodic Table", slug: "periodic-table", notes: true, test: true, free: false },
            { name: "Chemical Bonding", slug: "chemical-bonding", notes: true, test: true, free: false },
            { name: "Study of Gas Laws", slug: "gas-laws", notes: true, test: true, free: false },
        ],
    },
    "icse-class-10-biology": {
        title: "ICSE Class 10 Biology",
        seoTitle: "ICSE Class 10 Biology Notes & Test Papers",
        description: "Board exam focused notes and test papers for ICSE Class 10 Biology. Covers all chapters with important questions.",
        chapters: [
            { name: "Cell Division", slug: "cell-division", notes: true, test: true, free: true },
            { name: "Genetics", slug: "genetics", notes: true, test: true, free: false },
            { name: "Absorption by Roots", slug: "absorption-roots", notes: true, test: true, free: false },
            { name: "Transpiration", slug: "transpiration", notes: true, test: true, free: false },
            { name: "Nervous System", slug: "nervous-system", notes: true, test: true, free: false },
            { name: "The Reproductive System", slug: "reproductive-system", notes: true, test: true, free: false },
            { name: "Population", slug: "population", notes: true, test: true, free: false },
        ],
    },
    "icse-class-10-chemistry": {
        title: "ICSE Class 10 Chemistry",
        seoTitle: "ICSE Class 10 Chemistry Notes & Test Papers",
        description: "Chapter-wise ICSE Class 10 Chemistry study materials, solutions and practice test papers for board exam preparation.",
        chapters: [
            { name: "Periodic Properties", slug: "periodic-properties", notes: true, test: true, free: true },
            { name: "Chemical Bonding", slug: "chemical-bonding", notes: true, test: true, free: false },
            { name: "Acids, Bases & Salts", slug: "acids-bases-salts", notes: true, test: true, free: false },
            { name: "Analytical Chemistry", slug: "analytical-chemistry", notes: true, test: true, free: false },
            { name: "Mole Concept", slug: "mole-concept", notes: true, test: true, free: false },
            { name: "Electrolysis", slug: "electrolysis", notes: true, test: true, free: false },
            { name: "Organic Chemistry", slug: "organic-chemistry", notes: true, test: true, free: false },
        ],
    },
};

interface SubjectPageProps {
    params: {
        id: string;
    };
}

const SubjectPage = ({ params }: SubjectPageProps) => {
    const subjectSlug = params.id;
    const data = subjectData[subjectSlug || ""];

    if (!data) {
        return (
            <div className="section-padding text-center">
                <h1 className="text-2xl font-bold mb-4">Subject not found</h1>
                <Button asChild><Link href="/">Go Home</Link></Button>
            </div>
        );
    }

    return (
        <section className="section-padding">
            <div className="container-main">
                {/* Breadcrumb */}
                <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{data.title}</span>
                </nav>

                <h1 className="text-2xl sm:text-3xl font-bold mb-3">{data.seoTitle}</h1>
                <p className="text-muted-foreground mb-8 max-w-2xl">{data.description}</p>

                {/* Chapter Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="py-3 px-4 text-sm font-semibold">Chapter</th>
                                <th className="py-3 px-4 text-sm font-semibold text-center">Notes</th>
                                <th className="py-3 px-4 text-sm font-semibold text-center">Test Paper</th>
                                <th className="py-3 px-4 text-sm font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.chapters.map((ch) => (
                                <tr key={ch.slug} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                    <td className="py-4 px-4">
                                        <span className="font-medium text-sm">{ch.name}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {ch.free ? (
                                            <Link href={`/subjects/${subjectSlug}/${ch.slug}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                                <Eye className="h-3.5 w-3.5" /> View
                                            </Link>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                <Lock className="h-3.5 w-3.5" /> Locked
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {ch.free ? (
                                            <Link href={`/subjects/${subjectSlug}/${ch.slug}`} className="inline-flex items-center gap-1 text-sm text-secondary hover:underline">
                                                <FileText className="h-3.5 w-3.5" /> Attempt
                                            </Link>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                <Lock className="h-3.5 w-3.5" /> Locked
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {ch.free ? (
                                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">FREE</span>
                                        ) : (
                                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Premium</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Upgrade CTA */}
                <div className="mt-8 card-academic bg-accent/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold mb-1">Unlock All Chapters</h3>
                        <p className="text-sm text-muted-foreground">Get full access to notes, test papers, and solutions.</p>
                    </div>
                    <Button asChild>
                        <Link href="/pricing">Upgrade Now <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default SubjectPage;
