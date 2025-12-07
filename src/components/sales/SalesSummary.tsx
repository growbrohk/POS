import { DollarSign, Package, Percent, Gift } from 'lucide-react';

interface SalesSummaryProps {
  totalUnits: number;
  totalRevenue: number;
  totalDiscounts: number;
  freeGiftsCount: number;
}

export function SalesSummary({ totalUnits, totalRevenue, totalDiscounts, freeGiftsCount }: SalesSummaryProps) {
  const stats = [
    {
      label: 'Total Units Sold',
      value: totalUnits.toString(),
      icon: Package,
      color: 'text-primary'
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-success'
    },
    {
      label: 'Total Discounts',
      value: `$${totalDiscounts.toFixed(2)}`,
      icon: Percent,
      color: 'text-warning'
    },
    {
      label: 'Free Gifts',
      value: freeGiftsCount.toString(),
      icon: Gift,
      color: 'text-pos-gift'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${stat.color}`} />
              <span className="stat-label">{stat.label}</span>
            </div>
            <span className="stat-value">{stat.value}</span>
          </div>
        );
      })}
    </div>
  );
}
