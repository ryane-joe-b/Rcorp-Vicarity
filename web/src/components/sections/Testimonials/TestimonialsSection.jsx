import React, { useState, useEffect } from 'react';
import Container from '../../shared/Container';

/**
 * Testimonials Carousel Section
 * 
 * Rotating carousel of user testimonials
 * - Auto-rotates every 5 seconds
 * - Manual navigation with arrows
 * - Pause on hover
 * - Responsive (1 slide mobile, 2-3 desktop)
 */

const testimonials = [
  // Care Workers
  {
    id: 1,
    quote: "I've increased my income by 30% since joining Vicarity. The flexibility to choose my shifts has been life-changing.",
    name: "Emma R.",
    role: "Care Assistant",
    location: "London",
    rating: 5,
    type: "worker",
    initials: "ER"
  },
  {
    id: 2,
    quote: "Finding quality shifts has never been easier. The verification process was smooth and I was working within 24 hours.",
    name: "David K.",
    role: "Senior Care Worker",
    location: "Manchester",
    rating: 5,
    type: "worker",
    initials: "DK"
  },
  {
    id: 3,
    quote: "The support team is incredible. They helped me every step of the way, from registration to my first shift.",
    name: "Priya S.",
    role: "Registered Nurse",
    location: "Birmingham",
    rating: 5,
    type: "worker",
    initials: "PS"
  },
  // Care Homes
  {
    id: 4,
    quote: "We filled our night shift in under 2 hours. This platform has saved us thousands in agency fees.",
    name: "Jane M.",
    role: "Manager",
    location: "Sunrise Care Home, Leeds",
    rating: 5,
    type: "home",
    initials: "JM"
  },
  {
    id: 5,
    quote: "The quality of workers is exceptional. Every candidate is verified and professional. Highly recommend.",
    name: "Robert T.",
    role: "Director",
    location: "Oakwood Care, Bristol",
    rating: 5,
    type: "home",
    initials: "RT"
  },
  {
    id: 6,
    quote: "Vicarity has become our go-to for emergency cover. Reliable, cost-effective, and easy to use.",
    name: "Lisa H.",
    role: "Administrator",
    location: "Meadowview Care, Glasgow",
    rating: 5,
    type: "home",
    initials: "LH"
  }
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={`text-xl ${
            index < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
};

const TestimonialCard = ({ testimonial }) => {
  const bgColor = testimonial.type === 'worker' ? 'from-sage-50 to-white' : 'from-terracotta-50 to-white';
  const accentColor = testimonial.type === 'worker' ? 'sage' : 'terracotta';
  
  return (
    <div className={`bg-gradient-to-br ${bgColor} p-8 rounded-2xl shadow-healthcare 
                   hover:shadow-trust transition-shadow border border-gray-100 h-full`}>
      {/* Quote */}
      <div className="mb-6">
        <p className="text-lg text-gray-700 leading-relaxed italic">
          "{testimonial.quote}"
        </p>
      </div>
      
      {/* Divider */}
      <div className={`w-16 h-1 bg-${accentColor}-300 mb-6`} aria-hidden="true"></div>
      
      {/* Author Info */}
      <div className="flex items-center gap-4">
        {/* Avatar Circle */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-${accentColor}-200 
                       flex items-center justify-center text-${accentColor}-700 
                       font-bold text-lg`}>
          {testimonial.initials}
        </div>
        
        {/* Name and Details */}
        <div className="flex-1">
          <div className="font-bold text-charcoal-900">{testimonial.name}</div>
          <div className="text-sm text-gray-600">{testimonial.role}</div>
          <div className="text-xs text-gray-500">{testimonial.location}</div>
        </div>
        
        {/* Rating */}
        <div>
          <StarRating rating={testimonial.rating} />
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (isHovered) return; // Pause on hover
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isHovered]);
  
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  // Get visible testimonials (1 on mobile, 3 on desktop)
  const getVisibleTestimonials = () => {
    const testimonialsToShow = window.innerWidth >= 1024 ? 3 : 
                                window.innerWidth >= 768 ? 2 : 1;
    const visible = [];
    for (let i = 0; i < testimonialsToShow; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };
  
  const [visibleTestimonials, setVisibleTestimonials] = useState(getVisibleTestimonials());
  
  // Update visible testimonials when index or window size changes
  useEffect(() => {
    setVisibleTestimonials(getVisibleTestimonials());
    
    const handleResize = () => {
      setVisibleTestimonials(getVisibleTestimonials());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);
  
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-warm-50">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-charcoal-900 mb-4">
            Loved by Care Workers & Care Homes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our community has to say.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
            {visibleTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={goToPrevious}
              className="min-h-[44px] w-12 h-12 rounded-full bg-white shadow-lg 
                       hover:shadow-trust transition-all hover:scale-110 
                       flex items-center justify-center text-charcoal-900 
                       hover:bg-ocean-50 border border-gray-200"
              aria-label="Previous testimonial"
            >
              ←
            </button>
            <button
              onClick={goToNext}
              className="min-h-[44px] w-12 h-12 rounded-full bg-white shadow-lg 
                       hover:shadow-trust transition-all hover:scale-110 
                       flex items-center justify-center text-charcoal-900 
                       hover:bg-ocean-50 border border-gray-200"
              aria-label="Next testimonial"
            >
              →
            </button>
          </div>
          
          {/* Dot Indicators */}
          <div className="flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-ocean-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Join our thriving community</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div>
              <div className="text-3xl font-bold text-ocean-600">4.9/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sage-600">800+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-terracotta-600">98%</div>
              <div className="text-sm text-gray-600">Would Recommend</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TestimonialsSection;
