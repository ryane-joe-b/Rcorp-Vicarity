import React from 'react';
import Container from '../../shared/Container';
import useQualifications from '../../../hooks/useQualifications';

/**
 * Qualifications Showcase Section
 * 
 * Displays all UK care qualifications with worker counts
 * - Interactive grid of qualifications
 * - Shows breadth of qualified workers
 * - Real-time data from API
 */

// Icon mapping for qualification categories
const categoryIcons = {
  mandatory: "🔴",
  clinical: "🏥",
  specialized: "🎯",
  training: "📚",
  professional: "🎓"
};

// Category colors for badges
const categoryColors = {
  mandatory: "bg-red-50 border-red-200 text-red-700",
  clinical: "bg-blue-50 border-blue-200 text-blue-700",
  specialized: "bg-purple-50 border-purple-200 text-purple-700",
  training: "bg-green-50 border-green-200 text-green-700",
  professional: "bg-amber-50 border-amber-200 text-amber-700"
};

const QualificationCard = ({ qualification }) => {
  const icon = categoryIcons[qualification.category] || "📋";
  const colorClass = categoryColors[qualification.category] || "bg-gray-50 border-gray-200 text-gray-700";
  
  return (
    <div className="group relative bg-white p-6 rounded-xl shadow-healthcare 
                   hover:shadow-trust transition-all duration-300 
                   border border-gray-100 hover:border-sage-300
                   hover:-translate-y-1">
      
      {/* Category Badge */}
      <div className="absolute top-4 right-4">
        <span className={`text-xs px-2 py-1 rounded-full border ${colorClass} font-medium`}>
          {qualification.category}
        </span>
      </div>
      
      {/* Icon */}
      <div className="text-4xl mb-3 transition-transform group-hover:scale-110">
        {icon}
      </div>
      
      {/* Qualification Name */}
      <h3 className="text-lg font-bold text-charcoal-900 mb-2 pr-20">
        {qualification.name}
      </h3>
      
      {/* Description */}
      {qualification.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {qualification.description}
        </p>
      )}
      
      {/* Worker Count */}
      <div className="mt-auto pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Qualified Workers</span>
          <span className="text-2xl font-bold text-sage-600">
            {qualification.worker_count > 0 ? qualification.worker_count : 0}
          </span>
        </div>
      </div>
      
      {/* Mandatory Badge */}
      {qualification.is_mandatory && (
        <div className="absolute bottom-4 left-4">
          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
            Required
          </span>
        </div>
      )}
    </div>
  );
};

const CategoryLegend = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {Object.entries(categoryColors).map(([category, colorClass]) => (
        <div key={category} className="flex items-center gap-2">
          <span className="text-2xl">{categoryIcons[category]}</span>
          <span className={`text-xs px-3 py-1 rounded-full border ${colorClass} font-medium capitalize`}>
            {category}
          </span>
        </div>
      ))}
    </div>
  );
};

const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-healthcare border border-gray-100 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-3"></div>
          <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

const QualificationsSection = () => {
  const { qualifications, loading, error } = useQualifications();
  
  // Group qualifications by category
  const groupedQualifications = qualifications.reduce((acc, qual) => {
    if (!acc[qual.category]) {
      acc[qual.category] = [];
    }
    acc[qual.category].push(qual);
    return acc;
  }, {});
  
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-warm-50 to-white">
      <Container>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-charcoal-900 mb-4">
            Highly Qualified Care Professionals
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Our care workers hold a wide range of UK-recognized qualifications, 
            from mandatory certifications to specialized training. 
            Every professional is fully vetted and qualified for their role.
          </p>
        </div>
        
        {/* Category Legend */}
        <CategoryLegend />
        
        {/* Loading State */}
        {loading && <LoadingSkeleton />}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium mb-2">Failed to load qualifications</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {/* Qualifications Grid */}
        {!loading && !error && qualifications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {qualifications.map((qual) => (
              <QualificationCard key={qual.id} qualification={qual} />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!loading && !error && qualifications.length === 0 && (
          <div className="bg-warm-100 border border-warm-200 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 text-lg">
              Qualifications data will appear here once workers complete their profiles.
            </p>
          </div>
        )}
        
        {/* Stats Summary */}
        {!loading && qualifications.length > 0 && (
          <div className="mt-12 bg-white border border-sage-200 rounded-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-sage-600">
                  {qualifications.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Qualifications</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sage-600">
                  {qualifications.filter(q => q.is_mandatory).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Mandatory</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sage-600">
                  {qualifications.filter(q => q.category === 'clinical').length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Clinical Skills</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sage-600">
                  {qualifications.filter(q => q.category === 'professional').length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Professional</div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
};

export default QualificationsSection;
