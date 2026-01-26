# Landing Page - Remaining Work

**Created:** January 27, 2026  
**Phase 1 Status:** ✅ Complete (60%)  
**Phase 2 Status:** ⏸️ Pending (40%)

---

## 🎯 PHASE 2 - PRIORITY TASKS

### 1. How It Works Timeline Section ⏸️
**File to Create:** `web/src/components/sections/HowItWorks/HowItWorksSection.jsx`

**Requirements:**
- Dual-path journey visualization (workers vs care homes)
- 4 steps for each path with icons and time estimates
- Vertical timeline on mobile, horizontal on desktop
- Animated step indicators on scroll
- Clean, modern design with brand colors

**Worker Journey:**
1. Create free profile (2 minutes)
2. Get verified (instant DBS check)
3. Browse jobs (1000+ shifts available)  
4. Get hired (same-day starts)

**Care Home Journey:**
1. Post a shift (30 seconds)
2. Get matches (instant algorithm)
3. Review candidates (verified profiles)
4. Hire (one-click booking)

**Estimated Time:** 2-3 hours

**Resources:**
- Use existing Container, PrimaryButton components
- Icons: Consider react-icons or heroicons
- Animation: Intersection Observer API or framer-motion

**Acceptance Criteria:**
- [ ] Renders correctly on mobile and desktop
- [ ] Steps animate in on scroll
- [ ] Uses brand colors (sage for workers, terracotta for homes)
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Matches existing design system

---

### 2. Trust & Compliance Center ⏸️
**File to Create:** `web/src/components/sections/Trust/TrustCenterSection.jsx`

**Requirements:**
- Badge grid showcasing compliance and security
- 7-8 trust badges with icons and descriptions
- Hover effects with additional details
- Professional, reassuring tone

**Badges to Include:**
- CQC Compliant
- DBS Verified
- GDPR Compliant  
- Secure Payments (Stripe)
- 256-bit SSL Encryption
- Professional Indemnity Insurance
- 24/7 Support
- Data Protection Registered

**Design:**
- Grid layout (2 cols mobile, 4 cols desktop)
- Badge icon + title + short description
- Hover reveals more info (optional tooltip)
- Links to compliance certificates (future)

**Estimated Time:** 1-2 hours

**Acceptance Criteria:**
- [ ] 7-8 badges displayed in responsive grid
- [ ] Professional icons for each badge
- [ ] Hover effects work on desktop
- [ ] Touch-friendly on mobile
- [ ] Consistent with design system

---

### 3. Testimonials Carousel ⏸️
**File to Create:** `web/src/components/sections/Testimonials/TestimonialsSection.jsx`

**Requirements:**
- Rotating carousel of user testimonials
- 6-8 testimonials (mix of workers and care homes)
- Auto-play with manual controls
- Responsive (1 slide mobile, 2-3 desktop)

**Each Testimonial:**
- Quote (2-3 sentences)
- Name + role (e.g., "Sarah T., Care Assistant")
- Location (e.g., "Manchester, UK")
- Star rating (5/5)
- Photo (placeholder circle for now)

**Features:**
- Auto-rotate every 5 seconds
- Pause on hover
- Previous/Next arrow buttons
- Dot indicators for slide position
- Smooth transitions

**Estimated Time:** 2-3 hours

**Library Options:**
- Custom implementation (useState + setInterval)
- React Slick (popular, 8.7KB gzipped)
- Swiper (feature-rich, 40KB)
- Embla Carousel (lightweight, modern)

**Testimonial Content (Placeholder):**

**Workers:**
1. "I've increased my income by 30% since joining Vicarity. The flexibility to choose my shifts has been life-changing." - Emma R., Care Assistant, London
2. "Finding quality shifts has never been easier. The verification process was smooth and I was working within 24 hours." - David K., Senior Care Worker, Manchester
3. "The support team is incredible. They helped me every step of the way." - Priya S., Nurse, Birmingham

**Care Homes:**
1. "We filled our night shift in under 2 hours. This platform has saved us thousands in agency fees." - Jane M., Manager, Sunrise Care Home, Leeds
2. "The quality of workers is exceptional. Every candidate is verified and professional." - Robert T., Director, Oakwood Care, Bristol
3. "Vicarity has become our go-to for emergency cover. Reliable and cost-effective." - Lisa H., Administrator, Meadowview Care, Glasgow

**Acceptance Criteria:**
- [ ] 6-8 testimonials in carousel
- [ ] Auto-rotates every 5 seconds
- [ ] Manual navigation works (arrows + dots)
- [ ] Pauses on hover/touch
- [ ] Responsive (1 mobile, 2-3 desktop)
- [ ] Smooth transitions
- [ ] Accessible (keyboard navigation, ARIA)

---

### 4. FAQ Section with Accordion ⏸️
**File to Create:** `web/src/components/sections/FAQ/FAQSection.jsx`

**Requirements:**
- Accordion-style FAQ with two categories
- Smooth expand/collapse animations
- 5-7 questions per category
- Search functionality (optional Phase 3)

**Categories:**
1. For Care Workers (sage accent)
2. For Care Homes (terracotta accent)

**Questions (Workers):**
1. **How do I get paid?**
   - You receive weekly payments directly to your bank account. Payments are processed every Friday for shifts worked the previous week.

2. **What qualifications do I need?**
   - Minimum NVQ Level 2 in Health & Social Care. Additional certifications like Moving & Handling, Medication Administration, and First Aid are advantageous.

3. **Can I choose my own hours?**
   - Absolutely! You have full control over your schedule. Browse available shifts and accept only the ones that fit your availability.

4. **How does DBS verification work?**
   - We use an instant DBS checking service. Upload your existing DBS certificate or apply for a new one through our platform (£40 fee).

5. **Is there a fee to join?**
   - No! Creating a profile and browsing jobs is completely free. We only charge a small platform fee (8%) on completed shifts.

**Questions (Care Homes):**
1. **How much does it cost?**
   - No upfront fees. Pay per booking with transparent pricing: worker rate + 15% platform fee. Save 30% vs traditional agencies.

2. **How quickly can I fill a shift?**
   - Most shifts are filled within 2-4 hours. Emergency shifts often fill in under 1 hour with our instant notification system.

3. **Are workers vetted?**
   - Yes. All workers undergo DBS checks, qualification verification, and reference checks. We maintain a 98% reliability rating.

4. **Can I hire the same worker repeatedly?**
   - Yes! Build your preferred team. You can "favorite" workers and invite them directly to future shifts.

5. **What if a worker doesn't show up?**
   - We offer a replacement guarantee. If a booked worker doesn't show, we'll find a replacement within 30 minutes or refund the booking.

**Design:**
- Accordion with smooth height transitions
- Icons for expand/collapse (chevron)
- Category tabs or separate columns
- "Still have questions? Contact us" CTA at bottom

**Estimated Time:** 2-3 hours

**Acceptance Criteria:**
- [ ] 10-14 questions total (5-7 per category)
- [ ] Smooth accordion animations
- [ ] Only one question open at a time (optional)
- [ ] Category organization clear
- [ ] Contact CTA at bottom
- [ ] Mobile-friendly tap targets
- [ ] Accessible (keyboard + screen reader)

---

### 5. Qualifications Showcase ⏸️
**File to Create:** `web/src/components/sections/Qualifications/QualificationsSection.jsx`

**Requirements:**
- Interactive grid of UK care qualifications
- Show breadth of qualified workers
- Fetch from API (requires backend endpoint)
- Display worker count per qualification

**Qualifications to Show:**
- NVQ Level 2 in Health & Social Care
- NVQ Level 3 in Health & Social Care
- NVQ Level 5 in Leadership & Management
- Moving & Handling
- Medication Administration
- Dementia Care Certificate
- First Aid at Work
- Food Hygiene Level 2
- Infection Control
- Safeguarding Adults
- Mental Health Awareness
- End of Life Care
- Continence Care
- (+ more from database)

**Design:**
- Grid layout (2 cols mobile, 3-4 cols desktop)
- Each card:
  - Icon/badge
  - Qualification name
  - Number of workers with this qual
  - Hover effect
- Optional filter by category

**Estimated Time:** 2-3 hours

**Dependencies:**
- **Backend:** Need to create `GET /api/qualifications` endpoint
- **API Service:** Add `publicApi.getQualifications()` method
- **Hook:** Create `useQualifications()` hook

**Backend Work Required (30 mins):**
```python
# api/app/routers/public.py
@router.get("/qualifications")
async def get_qualifications(db: Session = Depends(get_db)):
    qualifications = db.query(Qualification).all()
    result = []
    for qual in qualifications:
        worker_count = db.query(WorkerProfile).filter(
            WorkerProfile.qualifications.contains([qual.id])
        ).count()
        result.append({
            "id": qual.id,
            "name": qual.name,
            "category": qual.category,
            "description": qual.description,
            "worker_count": worker_count
        })
    return {"qualifications": result}
```

**Acceptance Criteria:**
- [ ] Grid displays all qualifications from API
- [ ] Shows worker count per qualification
- [ ] Responsive grid layout
- [ ] Loading state while fetching
- [ ] Error handling if API fails
- [ ] Hover effects work
- [ ] Accessible

---

## 🔧 ENHANCEMENTS & POLISH

### 6. Hero Illustration 🎨
**File to Update:** `web/src/components/sections/Hero/HeroSection.jsx`

**Requirements:**
- Replace placeholder div with actual illustration
- Options:
  - Custom illustration (hire designer on Fiverr/Upwork)
  - Stock illustration (modify colors to match brand)
  - Photo collage (care worker + care home)
  - Abstract healthcare graphic

**Specifications:**
- Format: SVG (preferred) or WebP
- Size: 800×600px @ 2x (1600×1200px)
- Colors: Use brand palette (sage, terracotta, ocean)
- Style: Modern, professional, warm
- Mobile: Consider different crop or simplified version

**Resources:**
- unDraw (free customizable illustrations)
- Storyset (free animated illustrations)
- Freepik (paid, high quality)
- Commission custom (Fiverr: $50-200)

**Estimated Time:** 
- Design/sourcing: Varies
- Implementation: 30 mins

**Acceptance Criteria:**
- [ ] High-quality, professional illustration
- [ ] Matches brand colors and style
- [ ] Optimized for web (< 200KB)
- [ ] Responsive (looks good on all screens)
- [ ] Alt text for accessibility

---

### 7. Mobile Menu Smooth Animations 🔧
**File to Update:** `web/src/components/layout/Navbar/Navbar.jsx`

**Current State:** Functional but basic (instant show/hide)

**Enhancements:**
- Smooth slide-in from right (transform translateX)
- Backdrop blur effect on overlay
- Touch swipe to close gesture
- Close on escape key
- Focus trap (trap focus inside menu)
- Staggered animation for menu items

**Implementation:**
- Use CSS transitions or Framer Motion
- Add touch event listeners for swipe
- Use `useEffect` for keyboard listeners
- Focus management with `useRef`

**Estimated Time:** 1 hour

**Acceptance Criteria:**
- [ ] Smooth slide-in/out animation
- [ ] Backdrop blur effect
- [ ] Swipe to close works on mobile
- [ ] Escape key closes menu
- [ ] Focus trapped in menu when open
- [ ] Menu items animate in staggered

---

### 8. Loading States & Skeletons 🔧
**Files to Update:**
- `web/src/components/sections/Stats/StatsSection.jsx`
- `web/src/hooks/usePublicStats.js`
- Any other components fetching data

**Requirements:**
- Skeleton loaders for stats cards while loading
- Loading spinner for buttons (future)
- Error boundaries for component failures
- Retry button on error
- Toast notifications for errors (optional)

**Design:**
- Skeleton cards with pulsing animation
- Maintain layout to prevent content shift
- Error state with friendly message + retry CTA

**Implementation:**
- Create `<Skeleton>` component
- Update `usePublicStats` loading state
- Add error boundary wrapper
- Consider react-hot-toast for notifications

**Estimated Time:** 2 hours

**Acceptance Criteria:**
- [ ] Stats show skeletons while loading
- [ ] Error boundary catches component errors
- [ ] Retry button works
- [ ] No content layout shift
- [ ] Accessible (loading announced to screen readers)

---

### 9. Connect CTAs to Auth Flow 🔗
**Files to Update:**
- `web/src/components/sections/Hero/HeroSection.jsx`
- `web/src/components/layout/Navbar/Navbar.jsx`
- `web/src/components/sections/FinalCTA/FinalCTASection.jsx`

**Current State:** Buttons log to console

**Requirements:**
- Update button onClick to route to registration
- Pass role as query param
- "Find Care Work" → `/register?role=worker`
- "Hire Care Staff" → `/register?role=care_home`
- "Get Started" → Role selection page or smart default

**Dependencies:**
- Requires authentication pages to be built first
- React Router setup
- Registration flow

**Estimated Time:** 1 hour (after auth pages exist)

**Acceptance Criteria:**
- [ ] All CTAs route correctly
- [ ] Role param passed correctly
- [ ] No console logs
- [ ] Works on mobile and desktop

---

## 📈 FUTURE ENHANCEMENTS

### 10. SEO Meta Tags 🔍
**File to Update:** `web/public/index.html` or create `web/src/components/SEO.jsx`

**Tasks:**
- Add comprehensive meta tags
- Open Graph tags for social sharing
- Twitter Card tags
- Structured data (JSON-LD)
- Sitemap.xml
- Robots.txt

**Estimated Time:** 1 hour

---

### 11. Analytics Integration 📊
**Requirements:**
- Google Analytics 4 setup
- Event tracking for CTAs
- Conversion tracking
- Heatmap integration (Hotjar)

**Estimated Time:** 2 hours

---

### 12. Performance Audit ⚡
**Tasks:**
- Run Lighthouse audit
- Optimize images (WebP, lazy loading)
- Code splitting
- Remove unused CSS
- Preload critical assets

**Estimated Time:** 2-3 hours

---

### 13. Accessibility Audit ♿
**Tasks:**
- WCAG 2.1 AA compliance check
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS)
- Color contrast validation
- Focus management audit

**Estimated Time:** 2-3 hours

---

## 📅 RECOMMENDED TIMELINE

### Week 1: Core Phase 2 Sections (8-10 hours)
- [ ] Day 1-2: How It Works section (2-3 hours)
- [ ] Day 2: Trust & Compliance Center (1-2 hours)
- [ ] Day 3-4: Testimonials Carousel (2-3 hours)
- [ ] Day 4-5: FAQ Section (2-3 hours)

### Week 2: Qualifications + Polish (6-8 hours)
- [ ] Day 1: Backend qualifications endpoint (30 mins)
- [ ] Day 1-2: Qualifications showcase (2-3 hours)
- [ ] Day 3: Hero illustration sourcing + implementation (2-4 hours)
- [ ] Day 4: Mobile menu enhancements (1 hour)
- [ ] Day 4: Loading states (2 hours)

### Week 3: Optimization & Launch Prep (6-8 hours)
- [ ] Day 1: Connect CTAs (requires auth pages first)
- [ ] Day 2: SEO meta tags (1 hour)
- [ ] Day 3: Analytics integration (2 hours)
- [ ] Day 4: Performance audit (2 hours)
- [ ] Day 5: Accessibility audit (2 hours)

**Total Estimated Time:** 20-26 hours

---

## ✅ COMPLETION CHECKLIST

### Phase 2 Must-Haves
- [ ] How It Works section
- [ ] Trust & Compliance Center
- [ ] Testimonials Carousel
- [ ] FAQ Section
- [ ] Qualifications Showcase
- [ ] Hero Illustration

### Phase 2 Nice-to-Haves
- [ ] Mobile menu animations
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Toast notifications

### Phase 3 (Future)
- [ ] Connect CTAs to auth
- [ ] SEO optimization
- [ ] Analytics
- [ ] Performance tuning
- [ ] Accessibility audit

---

## 📝 NOTES

### Design Consistency
- Use existing components (Container, PrimaryButton, SecondaryButton)
- Follow Tailwind config (colors, spacing, typography)
- Match existing section patterns
- Maintain mobile-first approach

### Code Quality
- Write JSDoc comments for components
- Keep components under 200 lines (split if needed)
- Use TypeScript types (if converting)
- Follow existing file structure conventions

### Testing Before Deploy
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS and Android)
- [ ] Test all breakpoints (mobile, tablet, desktop)
- [ ] Test with slow 3G connection
- [ ] Test keyboard navigation
- [ ] Verify analytics events fire (when implemented)

### Documentation
- Update `LANDING_PAGE_IMPLEMENTATION.md` after each section
- Take before/after screenshots
- Document any challenges or learnings
- Update `PROJECT_STATUS.md` completion percentages

---

**Document Created:** January 27, 2026  
**Last Updated:** January 27, 2026  
**Priority:** Start with Section 1-4 (core Phase 2)

---

## 🆘 GETTING HELP

### Resources
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **React Docs:** https://react.dev
- **Heroicons:** https://heroicons.com
- **React Icons:** https://react-icons.github.io/react-icons
- **Framer Motion:** https://www.framer.com/motion/ (for animations)

### Troubleshooting
- Check `vibe/LANDING_PAGE_IMPLEMENTATION.md` for component details
- See existing components for patterns
- Review Tailwind config for available utilities
- Check deployment docs if issues arise

### Questions
- See `vibe/README.md` for documentation index
- Check `vibe/PROJECT_STATUS.md` for overall project context

---

**Happy Coding!** 🚀
