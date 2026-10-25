import HeroSection from "@/components/HeroSection";
import TrustSection from "@/components/TrustSection";
import SubjectsGrid from "@/components/SubjectsGrid";
import HowItWorks from "@/components/HowItWorks";
import SamplePreview from "@/components/SamplePreview";
import ProfessorSection from "@/components/ProfessorSection";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function Home() {
  const session = await auth();
  let hasSubscription = false;

  if (session?.user?.id) {
    const sub = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
        endsAt: { gt: new Date() },
      },
    });
    hasSubscription = !!sub;
  }

  let previews: any[] = [];
  try {
    previews = await prisma.$queryRawUnsafe<any[]>(
      'SELECT id, title, "imageUrl", width, height, "order" FROM "MaterialPreview" ORDER BY "order" ASC, "createdAt" ASC'
    );
  } catch (e) {
    console.error("Failed to load material previews:", e);
  }

  return (
    <>
      <HeroSection />
      <TrustSection />
      <SubjectsGrid />
      <HowItWorks />
      <SamplePreview hasSubscription={hasSubscription} previews={previews} />
      <ProfessorSection />
    </>
  );
}
