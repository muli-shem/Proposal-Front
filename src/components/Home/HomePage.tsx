// ============================================================
// ESTATE HUB — HOME PAGE
// src/pages/Home/HomePage.tsx
// ============================================================

import HeroSection         from '@/components/HeroSection'
import PropertyFeedSection from '@/components/PropertyFeedSection'
import AgencySpotlight     from '@/components/AgencySpotlight'
import ReelPreviewStrip    from '@/components/ReelPreviewStrip'
import HowItWorksSection   from '@/components/HowItWorksSection'
import TrustSection        from '@/components/TrustSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import CTASection          from '@/components/CTASection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* 1. Full-viewport hero with search bar */}
      <HeroSection />

      {/* 2. How it works — 4 steps with icons */}
      <HowItWorksSection />

      {/* 3. Live property feed with filter tabs */}
      <PropertyFeedSection />

      {/* 4. Reels preview strip — dark Swahili blue bg */}
      <ReelPreviewStrip />

      {/* 5. Featured agencies spotlight */}
      <AgencySpotlight />

      {/* 6. Trust & escrow explainer */}
      <TrustSection />

      {/* 7. Testimonials */}
      <TestimonialsSection />

      {/* 8. Final CTA */}
      <CTASection />
    </div>
  )
}