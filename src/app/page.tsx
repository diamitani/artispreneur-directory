import HeroSection from "@/components/HeroSection"
import FeaturesBanner from "@/components/FeaturesBanner"
import HowItWorks from "@/components/HowItWorks"
import FeaturedContacts from "@/components/FeaturedContacts"
import CategoryGrid from "@/components/CategoryGrid"
import StatsExplorer from "@/components/StatsExplorer"
import NewsletterSection from "@/components/NewsletterSection"

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesBanner />
      <HowItWorks />
      <FeaturedContacts />
      <CategoryGrid />
      <StatsExplorer />
      <NewsletterSection />
    </>
  )
}
