import React, { useState } from 'react';
import Container from '../../shared/Container';

/**
 * FAQ Section with Accordion
 * 
 * - Two categories: For Care Workers and For Care Homes
 * - Accordion-style (click to expand)
 * - Smooth animations
 * - 5-7 questions per category
 */

const workerFAQs = [
  {
    id: 1,
    question: "How do I get paid?",
    answer: "You receive weekly payments directly to your bank account. Payments are processed every Friday for shifts worked the previous week. You can track all your earnings in your dashboard."
  },
  {
    id: 2,
    question: "What qualifications do I need?",
    answer: "Minimum NVQ Level 2 in Health & Social Care is required. Additional certifications like Moving & Handling, Medication Administration, and First Aid are advantageous and help you access more shifts."
  },
  {
    id: 3,
    question: "Can I choose my own hours?",
    answer: "Absolutely! You have full control over your schedule. Browse available shifts and accept only the ones that fit your availability. Work as much or as little as you want."
  },
  {
    id: 4,
    question: "How does DBS verification work?",
    answer: "We use an instant DBS checking service. Upload your existing DBS certificate or apply for a new one through our platform. The fee is £40 for a new check, which is deducted from your first payment."
  },
  {
    id: 5,
    question: "Is there a fee to join?",
    answer: "No! Creating a profile and browsing jobs is completely free. We only charge a small platform fee (8%) on completed shifts, which covers insurance, payment processing, and support."
  },
  {
    id: 6,
    question: "What if I need to cancel a shift?",
    answer: "We understand emergencies happen. You can cancel up to 24 hours before a shift without penalty. Cancellations with less notice may affect your reliability rating."
  },
  {
    id: 7,
    question: "How quickly can I start working?",
    answer: "Once your profile is verified (usually within 24 hours), you can start applying for shifts immediately. Many of our workers secure their first shift within their first day on the platform."
  }
];

const careHomeFAQs = [
  {
    id: 8,
    question: "How much does it cost?",
    answer: "No upfront fees. Pay per booking with transparent pricing: worker hourly rate + 15% platform fee. This is typically 30% cheaper than traditional agencies and includes insurance coverage."
  },
  {
    id: 9,
    question: "How quickly can I fill a shift?",
    answer: "Most shifts are filled within 2-4 hours. Emergency shifts often fill in under 1 hour thanks to our instant notification system that alerts qualified workers in your area."
  },
  {
    id: 10,
    question: "Are workers vetted?",
    answer: "Yes. All workers undergo enhanced DBS checks, qualification verification, and reference checks. We maintain a 98% reliability rating and workers are rated after each shift."
  },
  {
    id: 11,
    question: "Can I hire the same worker repeatedly?",
    answer: "Yes! You can 'favorite' workers and invite them directly to future shifts. Building a preferred team is encouraged and leads to better continuity of care."
  },
  {
    id: 12,
    question: "What if a worker doesn't show up?",
    answer: "We offer a replacement guarantee. If a booked worker doesn't show, we'll find a replacement within 30 minutes or refund the booking fee. This happens in less than 2% of cases."
  },
  {
    id: 13,
    question: "How do I ensure quality care?",
    answer: "You can review worker profiles including qualifications, ratings, and experience before booking. After each shift, you can rate the worker and leave feedback for other care homes."
  },
  {
    id: 14,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards and bank transfers. Payments are processed securely through Stripe. Invoices are automatically generated for your records."
  }
];

const FAQItem = ({ faq, isOpen, onToggle, color }) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-5 px-4 flex items-center justify-between text-left 
                 hover:bg-warm-50 transition-colors group"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-charcoal-900 pr-4 group-hover:text-ocean-700">
          {faq.question}
        </span>
        <span
          className={`flex-shrink-0 text-2xl text-${color}-600 transition-transform 
                     ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          aria-hidden="true"
        >
          {isOpen ? '−' : '+'}
        </span>
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-5 text-gray-700 leading-relaxed">
          {faq.answer}
        </div>
      </div>
    </div>
  );
};

const FAQCategory = ({ title, faqs, color, icon }) => {
  const [openId, setOpenId] = useState(null);
  
  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
  };
  
  return (
    <div>
      {/* Category Header */}
      <div className={`bg-gradient-to-r from-${color}-100 to-${color}-50 
                     p-6 rounded-t-2xl border border-${color}-200`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{icon}</span>
          <h3 className="text-2xl font-bold text-charcoal-900">
            {title}
          </h3>
        </div>
      </div>
      
      {/* Questions */}
      <div className="bg-white rounded-b-2xl shadow-healthcare border border-gray-200 border-t-0">
        {faqs.map((faq) => (
          <FAQItem
            key={faq.id}
            faq={faq}
            isOpen={openId === faq.id}
            onToggle={() => handleToggle(faq.id)}
            color={color}
          />
        ))}
      </div>
    </div>
  );
};

const FAQSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-charcoal-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Got questions? We've got answers. Find everything you need to know below.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto mb-12">
          {/* For Care Workers */}
          <FAQCategory
            title="For Care Workers"
            faqs={workerFAQs}
            color="sage"
            icon="👤"
          />
          
          {/* For Care Homes */}
          <FAQCategory
            title="For Care Homes"
            faqs={careHomeFAQs}
            color="terracotta"
            icon="🏥"
          />
        </div>

        {/* Still Have Questions CTA */}
        <div className="bg-gradient-to-r from-ocean-50 to-sage-50 p-8 md:p-12 
                       rounded-2xl shadow-lg text-center max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-lg text-gray-700 mb-6">
            Our support team is here to help 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@vicarity.co.uk"
              className="min-h-[44px] px-8 py-3 bg-ocean-500 hover:bg-ocean-600 
                       text-white font-semibold rounded-lg shadow-lg 
                       transition-all hover:scale-105 active:scale-95
                       inline-flex items-center justify-center gap-2"
            >
              <span>📧</span>
              <span>Email Us</span>
            </a>
            <a
              href="tel:+447887141400"
              className="min-h-[44px] px-8 py-3 bg-white hover:bg-gray-50 
                       text-ocean-600 font-semibold rounded-lg shadow-lg 
                       border-2 border-ocean-500
                       transition-all hover:scale-105 active:scale-95
                       inline-flex items-center justify-center gap-2"
            >
              <span>📞</span>
              <span>+44 7887 141400</span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FAQSection;
