import Hero from "@/components/sections/Hero";
import ProblemStatement from "@/components/sections/ProblemStatement";
import HowItWorks from "@/components/sections/HowItWorks";
import KeyFeatures from "@/components/sections/KeyFeatures";
import Statistics from "@/components/sections/Statistics";
import SkillCategories from "@/components/sections/SkillCategories";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <ProblemStatement />
      <HowItWorks />
      <KeyFeatures />
      <Statistics />
      <SkillCategories />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
