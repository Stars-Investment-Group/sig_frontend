// Utility functions for interpreting economic trends and generating insights

export interface TrendAnalysis {
  direction: 'rising' | 'falling' | 'stable' | 'volatile';
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
  confidence: number; // 0-100
  alert?: {
    level: 'info' | 'warning' | 'critical';
    message: string;
  };
}

export interface EconomicRegimeAnalysis {
  regime: 'expansion' | 'peak' | 'contraction' | 'trough' | 'recovery' | 'overheating';
  confidence: number;
  factors: string[];
  outlook: 'positive' | 'neutral' | 'negative';
  recommendations: string[];
}

/**
 * Analyze trend direction and strength from historical data
 */
export function analyzeTrend(values: number[], periods: number = 6): TrendAnalysis {
  if (values.length < 3) {
    return {
      direction: 'stable',
      strength: 'weak',
      description: 'Insufficient data for trend analysis',
      confidence: 0
    };
  }

  // Calculate moving averages for smoothing
  const recentPeriod = Math.min(periods, values.length);
  const recentValues = values.slice(-recentPeriod);
  const olderValues = values.slice(-recentPeriod * 2, -recentPeriod);

  if (olderValues.length === 0) {
    return {
      direction: 'stable',
      strength: 'weak',
      description: 'Insufficient historical data',
      confidence: 20
    };
  }

  const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;
  
  const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;
  const absChange = Math.abs(percentChange);

  // Calculate volatility
  const variance = recentValues.reduce((acc, val) => {
    return acc + Math.pow(val - recentAvg, 2);
  }, 0) / recentValues.length;
  const volatility = Math.sqrt(variance);

  // Determine direction
  let direction: TrendAnalysis['direction'];
  if (volatility > recentAvg * 0.2) {
    direction = 'volatile';
  } else if (absChange < 2) {
    direction = 'stable';
  } else if (percentChange > 0) {
    direction = 'rising';
  } else {
    direction = 'falling';
  }

  // Determine strength
  let strength: TrendAnalysis['strength'];
  if (absChange > 10) {
    strength = 'strong';
  } else if (absChange > 5) {
    strength = 'moderate';
  } else {
    strength = 'weak';
  }

  // Calculate confidence based on data consistency
  const trendConsistency = calculateTrendConsistency(recentValues);
  const confidence = Math.min(95, Math.max(10, trendConsistency * 100));

  // Generate description
  const description = generateTrendDescription(direction, strength, percentChange);

  return {
    direction,
    strength,
    description,
    confidence,
    alert: generateTrendAlert(direction, strength, percentChange)
  };
}

/**
 * Analyze economic regime based on multiple indicators
 */
export function analyzeEconomicRegime(indicators: {
  inflation: number;
  unemployment: number;
  gdpGrowth: number;
  interestRate: number;
}): EconomicRegimeAnalysis {
  const { inflation, unemployment, gdpGrowth, interestRate } = indicators;
  const factors: string[] = [];
  let score = 0;

  // GDP Growth Analysis
  if (gdpGrowth > 3) {
    score += 2;
    factors.push('Strong GDP growth');
  } else if (gdpGrowth > 1) {
    score += 1;
    factors.push('Moderate GDP growth');
  } else if (gdpGrowth < 0) {
    score -= 2;
    factors.push('Negative GDP growth');
  } else {
    score -= 1;
    factors.push('Weak GDP growth');
  }

  // Inflation Analysis
  if (inflation > 4) {
    score += 1; // High inflation can indicate overheating
    factors.push('High inflation pressure');
  } else if (inflation < 1) {
    score -= 1; // Very low inflation can indicate weakness
    factors.push('Low inflation');
  } else {
    factors.push('Stable inflation');
  }

  // Unemployment Analysis
  if (unemployment < 4) {
    score += 1;
    factors.push('Low unemployment');
  } else if (unemployment > 7) {
    score -= 2;
    factors.push('High unemployment');
  } else {
    factors.push('Moderate unemployment');
  }

  // Interest Rate Analysis
  if (interestRate > 5 && inflation > 3) {
    factors.push('Tight monetary policy');
  } else if (interestRate < 2) {
    factors.push('Accommodative monetary policy');
  }

  // Determine regime
  let regime: EconomicRegimeAnalysis['regime'];
  let outlook: EconomicRegimeAnalysis['outlook'];
  
  if (score >= 3 && inflation > 3.5) {
    regime = 'overheating';
    outlook = 'negative';
  } else if (score >= 2) {
    regime = 'expansion';
    outlook = 'positive';
  } else if (score >= 0) {
    regime = 'recovery';
    outlook = 'neutral';
  } else if (score >= -2) {
    regime = 'trough';
    outlook = 'neutral';
  } else {
    regime = 'contraction';
    outlook = 'negative';
  }

  const confidence = Math.min(90, Math.max(40, 60 + Math.abs(score) * 10));

  const recommendations = generateRecommendations(regime, indicators);

  return {
    regime,
    confidence,
    factors,
    outlook,
    recommendations
  };
}

/**
 * Generate economic intelligence alerts
 */
export function generateEconomicAlerts(
  countryCode: string,
  currentIndicators: any[],
  historicalData: any[]
): Array<{
  title: string;
  description: string;
  type: 'info' | 'warning' | 'critical';
  priority: number;
}> {
  const alerts: Array<{
    title: string;
    description: string;
    type: 'info' | 'warning' | 'critical';
    priority: number;
  }> = [];

  // Inflation alerts
  const inflation = currentIndicators.find(i => i.indicatorType === 'inflation');
  if (inflation && inflation.value > 4) {
    alerts.push({
      title: 'High Inflation Alert',
      description: `${countryCode} inflation reached ${inflation.value.toFixed(1)}%, exceeding central bank targets`,
      type: 'warning',
      priority: 8
    });
  }

  // Unemployment alerts
  const unemployment = currentIndicators.find(i => i.indicatorType === 'unemployment');
  if (unemployment && unemployment.value > 7) {
    alerts.push({
      title: 'Rising Unemployment',
      description: `Unemployment rate at ${unemployment.value.toFixed(1)}% suggests labor market stress`,
      type: 'warning',
      priority: 7
    });
  }

  // GDP growth alerts
  const gdpGrowth = currentIndicators.find(i => i.indicatorType === 'gdpGrowth');
  if (gdpGrowth && gdpGrowth.value < 0) {
    alerts.push({
      title: 'Economic Contraction',
      description: `Negative GDP growth of ${gdpGrowth.value.toFixed(1)}% indicates economic downturn`,
      type: 'critical',
      priority: 10
    });
  }

  return alerts.sort((a, b) => b.priority - a.priority);
}

// Helper functions

function calculateTrendConsistency(values: number[]): number {
  if (values.length < 3) return 0;
  
  let consistentMoves = 0;
  for (let i = 2; i < values.length; i++) {
    const move1 = values[i - 1] - values[i - 2];
    const move2 = values[i] - values[i - 1];
    
    if ((move1 > 0 && move2 > 0) || (move1 < 0 && move2 < 0)) {
      consistentMoves++;
    }
  }
  
  return consistentMoves / (values.length - 2);
}

function generateTrendDescription(
  direction: TrendAnalysis['direction'],
  strength: TrendAnalysis['strength'],
  percentChange: number
): string {
  const directionMap = {
    rising: 'increasing',
    falling: 'decreasing',
    stable: 'remaining stable',
    volatile: 'showing high volatility'
  };

  const strengthMap = {
    strong: 'significantly',
    moderate: 'moderately',
    weak: 'slightly'
  };

  const base = `Indicator is ${directionMap[direction]}`;
  
  if (direction === 'stable') {
    return `${base} with minimal variation`;
  }
  
  if (direction === 'volatile') {
    return `${base} with frequent directional changes`;
  }

  return `${base} ${strengthMap[strength]} (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%)`;
}

function generateTrendAlert(
  direction: TrendAnalysis['direction'],
  strength: TrendAnalysis['strength'],
  percentChange: number
): TrendAnalysis['alert'] | undefined {
  if (direction === 'volatile') {
    return {
      level: 'warning',
      message: 'High volatility detected - monitor for potential instability'
    };
  }

  if (strength === 'strong' && Math.abs(percentChange) > 15) {
    return {
      level: 'critical',
      message: `Rapid ${direction === 'rising' ? 'increase' : 'decrease'} detected - significant economic shift`
    };
  }

  return undefined;
}

function generateRecommendations(
  regime: EconomicRegimeAnalysis['regime'],
  indicators: any
): string[] {
  const recommendations: string[] = [];

  switch (regime) {
    case 'overheating':
      recommendations.push('Monitor inflation closely');
      recommendations.push('Prepare for potential interest rate increases');
      recommendations.push('Consider defensive positioning');
      break;
    
    case 'expansion':
      recommendations.push('Favorable environment for growth investments');
      recommendations.push('Monitor for signs of overheating');
      break;
    
    case 'recovery':
      recommendations.push('Early-stage growth opportunities');
      recommendations.push('Monitor employment trends');
      break;
    
    case 'contraction':
      recommendations.push('Focus on defensive assets');
      recommendations.push('Monitor central bank response');
      recommendations.push('Prepare for potential stimulus measures');
      break;
    
    case 'trough':
      recommendations.push('Look for early recovery signals');
      recommendations.push('Monitor fiscal policy responses');
      break;
  }

  return recommendations;
}
