import React from 'react';

const colorMap = {
  sage: {
    bg: 'bg-sage-50',
    border: 'border-sage-200',
    icon: 'bg-sage-100 text-sage-600',
    value: 'text-sage-700',
  },
  terracotta: {
    bg: 'bg-terracotta-50',
    border: 'border-terracotta-200',
    icon: 'bg-terracotta-100 text-terracotta-600',
    value: 'text-terracotta-700',
  },
  ocean: {
    bg: 'bg-ocean-50',
    border: 'border-ocean-200',
    icon: 'bg-ocean-100 text-ocean-600',
    value: 'text-ocean-700',
  },
};

const StatCard = ({ icon, label, value, color = 'sage' }) => {
  const c = colorMap[color] || colorMap.sage;

  return (
    <div className={`rounded-xl border ${c.bg} ${c.border} p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-lg ${c.icon} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
