// Utility functions for formatting economic indicators

export interface FormattedIndicator {
  value: number;
  formattedValue: string;
  unit: string;
  change?: number;
  changeDirection: 'up' | 'down' | 'stable';
  changeFormatted?: string;
}

/**
 * Format economic indicator values with appropriate units and precision
 */
export function formatIndicator(
  value: number, 
  indicatorType: string, 
  previousValue?: number
): FormattedIndicator {
  let formattedValue: string;
  let unit: string;
  let change: number | undefined;
  let changeDirection: 'up' | 'down' | 'stable' = 'stable';
  let changeFormatted: string | undefined;

  // Calculate change if previous value is provided
  if (previousValue !== undefined) {
    change = value - previousValue;
    changeDirection = change > 0.05 ? 'up' : change < -0.05 ? 'down' : 'stable';
    changeFormatted = `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
  }

  switch (indicatorType) {
    case 'inflation':
    case 'unemployment':
    case 'interestRate':
    case 'gdpGrowth':
      formattedValue = `${value.toFixed(1)}%`;
      unit = '%';
      if (changeFormatted) changeFormatted += '%';
      break;
    
    case 'tradeBalance':
      if (Math.abs(value) >= 1000) {
        formattedValue = `$${(value / 1000).toFixed(1)}B`;
        unit = 'B';
        if (changeFormatted) changeFormatted = `$${(change! / 1000).toFixed(1)}B`;
      } else {
        formattedValue = `$${value.toFixed(1)}M`;
        unit = 'M';
        if (changeFormatted) changeFormatted = `$${change!.toFixed(1)}M`;
      }
      break;
    
    case 'housingStarts':
    case 'industrialProduction':
      if (value >= 1000) {
        formattedValue = `${(value / 1000).toFixed(1)}K`;
        unit = 'K';
        if (changeFormatted) changeFormatted = `${(change! / 1000).toFixed(1)}K`;
      } else {
        formattedValue = value.toFixed(0);
        unit = '';
        if (changeFormatted) changeFormatted = change!.toFixed(0);
      }
      break;
    
    case 'consumerSpending':
    case 'retailSales':
      formattedValue = `${value.toFixed(1)}%`;
      unit = '%';
      if (changeFormatted) changeFormatted += '%';
      break;
    
    case 'businessConfidence':
      formattedValue = value.toFixed(1);
      unit = '';
      if (changeFormatted) changeFormatted = change!.toFixed(1);
      break;
    
    default:
      formattedValue = value.toFixed(2);
      unit = '';
      if (changeFormatted) changeFormatted = change!.toFixed(2);
  }

  return {
    value,
    formattedValue,
    unit,
    change,
    changeDirection,
    changeFormatted
  };
}

/**
 * Get human-readable indicator name
 */
export function getIndicatorDisplayName(indicatorType: string): string {
  const names: Record<string, string> = {
    inflation: 'Inflation Rate',
    unemployment: 'Unemployment Rate',
    interestRate: 'Interest Rate',
    gdpGrowth: 'GDP Growth',
    consumerSpending: 'Consumer Spending',
    industrialProduction: 'Industrial Production',
    tradeBalance: 'Trade Balance',
    housingStarts: 'Housing Starts',
    retailSales: 'Retail Sales',
    businessConfidence: 'Business Confidence'
  };
  
  return names[indicatorType] || indicatorType.replace(/([A-Z])/g, ' $1').trim();
}

/**
 * Get indicator description for tooltips
 */
export function getIndicatorDescription(indicatorType: string): string {
  const descriptions: Record<string, string> = {
    inflation: 'Annual percentage change in consumer prices',
    unemployment: 'Percentage of labor force that is unemployed',
    interestRate: 'Central bank policy interest rate',
    gdpGrowth: 'Annual percentage change in real GDP',
    consumerSpending: 'Monthly change in consumer expenditure',
    industrialProduction: 'Monthly change in industrial output',
    tradeBalance: 'Difference between exports and imports',
    housingStarts: 'Number of new residential construction projects',
    retailSales: 'Monthly change in retail sales volume',
    businessConfidence: 'Survey-based measure of business optimism'
  };
  
  return descriptions[indicatorType] || 'Economic indicator measurement';
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Format time ago
 */
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
}

/**
 * Color mapping for different value ranges
 */
export function getIndicatorColor(indicatorType: string, value: number): string {
  switch (indicatorType) {
    case 'inflation':
      if (value > 4) return 'text-red-400';
      if (value > 2) return 'text-amber-400';
      return 'text-emerald-400';
    
    case 'unemployment':
      if (value > 7) return 'text-red-400';
      if (value > 5) return 'text-amber-400';
      return 'text-emerald-400';
    
    case 'gdpGrowth':
      if (value < 0) return 'text-red-400';
      if (value < 1) return 'text-amber-400';
      return 'text-emerald-400';
    
    default:
      return 'text-terminal-100';
  }
}
