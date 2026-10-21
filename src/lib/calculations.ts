/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PHARMACIES, PRODUCT_DEMAND, ENGAGEMENT } from '../data';
import { OpportunityMetrics, ProductDemand } from '../types';

// Extract the 10 unique products
export const UNIQUE_PRODUCTS = [
  "Omeprazole 20mg",
  "Cetirizine 10mg",
  "Amoxicillin 500mg",
  "Atorvastatin 20mg",
  "Paracetamol 500mg",
  "Amoxicillin+Clavulanate 625mg",
  "Ibuprofen 400mg",
  "Pantoprazole 40mg",
  "Losartan 50mg",
  "Metformin 850mg"
];

// Map products to categories for completeness
export const PRODUCT_CATEGORIES: Record<string, { category: string; type: 'Brand' | 'Generic' }> = {
  "Omeprazole 20mg": { category: "Gastrointestinal", type: "Brand" },
  "Cetirizine 10mg": { category: "Antihistamine", type: "Generic" },
  "Amoxicillin 500mg": { category: "Antibiotic", type: "Generic" },
  "Atorvastatin 20mg": { category: "Cardiovascular", type: "Brand" },
  "Paracetamol 500mg": { category: "Pain Relief", type: "Generic" },
  "Amoxicillin+Clavulanate 625mg": { category: "Antibiotic", type: "Brand" },
  "Ibuprofen 400mg": { category: "Pain Relief", type: "Generic" },
  "Pantoprazole 40mg": { category: "Gastrointestinal", type: "Brand" },
  "Losartan 50mg": { category: "Cardiovascular", type: "Generic" },
  "Metformin 850mg": { category: "Diabetes", type: "Generic" }
};

export function calculateOpportunityScores(): OpportunityMetrics[] {
  // 1. Gather raw aggregates for all unique products
  const rawData = UNIQUE_PRODUCTS.map(productName => {
    const demandRows = PRODUCT_DEMAND.filter(row => row.ProductName === productName);
    const catInfo = PRODUCT_CATEGORIES[productName];
    
    // Sub-score 1 raw: Sum of EstimatedMonthlyDemand
    const totalDemand = demandRows.reduce((sum, row) => sum + row.EstimatedMonthlyDemand, 0);
    
    // Sub-score 2 raw: Distinct pharmacies requesting this product
    const pharmaciesRequesting = new Set(demandRows.map(row => row.PharmacyID));
    const reachCount = pharmaciesRequesting.size;
    
    // Sub-score 3 raw: monthly or frequent stockout signal / total rows
    const stockoutCount = demandRows.filter(row => row.StockOutFrequency === 'Monthly' || row.StockOutFrequency === 'Frequent').length;
    const stockoutSignalRatio = demandRows.length > 0 ? stockoutCount / demandRows.length : 0;
    
    // Sub-score 4 raw: yes switching readiness / total rows
    const switchingCount = demandRows.filter(row => row.WillingToTryNewSupplier === 'Yes').length;
    const switchingSignalRatio = demandRows.length > 0 ? switchingCount / demandRows.length : 0;
    
    // Sub-score 5 raw: Sum of ExpectedTrialOrderQuantity
    const totalTrialQty = demandRows.reduce((sum, row) => sum + row.ExpectedTrialOrderQuantity, 0);
    
    return {
      productName,
      category: catInfo.category,
      type: catInfo.type,
      totalDemand,
      reachCount,
      stockoutSignalRatio,
      switchingSignalRatio,
      totalTrialQty
    };
  });

  // 2. Find MAX values across all products for normalization
  const maxTotalDemand = Math.max(...rawData.map(d => d.totalDemand));
  const maxTotalTrialQty = Math.max(...rawData.map(d => d.totalTrialQty));

  // 3. Normalise and calculate Opportunity Score
  const metrics: OpportunityMetrics[] = rawData.map(d => {
    // Normalise to 0-1 scale
    const normDemandIntensity = maxTotalDemand > 0 ? d.totalDemand / maxTotalDemand : 0;
    const normPharmacyReach = d.reachCount / 20; // total pharmacies is 20
    const normStockoutSignal = d.stockoutSignalRatio; // already 0-1
    const normSwitchingReadiness = d.switchingSignalRatio; // already 0-1
    const normTrialOrderSignal = maxTotalTrialQty > 0 ? d.totalTrialQty / maxTotalTrialQty : 0;

    // OpportunityScore = (DemandIntensity x 0.30) + (PharmacyReach x 0.25) + (StockoutSignal x 0.20) + (SwitchingReadiness x 0.15) + (TrialOrderSignal x 0.10)
    const rawScore = (normDemandIntensity * 0.30) + 
                     (normPharmacyReach * 0.25) + 
                     (normStockoutSignal * 0.20) + 
                     (normSwitchingReadiness * 0.15) + 
                     (normTrialOrderSignal * 0.10);

    const opportunityScore = Math.round(rawScore * 100);

    let classification: OpportunityMetrics['classification'] = 'LOW POTENTIAL';
    if (opportunityScore >= 70) {
      classification = 'HIGH PRIORITY';
    } else if (opportunityScore >= 50) {
      classification = 'MEDIUM';
    } else if (opportunityScore >= 30) {
      classification = 'MONITOR';
    }

    return {
      productName: d.productName,
      category: d.category,
      type: d.type,
      demandIntensity: d.totalDemand,
      pharmacyReachCount: d.reachCount,
      stockoutSignalCount: d.reachCount, // how many pharmacies request it
      switchingReadinessCount: Math.round(d.switchingSignalRatio * 100), // represented as % switching readiness
      trialOrderSignalSum: d.totalTrialQty,
      
      normDemandIntensity,
      normPharmacyReach,
      normStockoutSignal,
      normSwitchingReadiness,
      normTrialOrderSignal,
      
      opportunityScore,
      classification
    };
  });

  // Sort descending by opportunityScore
  return metrics.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

// Metric 2 Calculations: Suggested Pilot Import Quantity
export interface ImportSimulationResult {
  productName: string;
  baseDemand: number;
  expectedQuantity: number;
  lowQuantity: number;
  highQuantity: number;
  stockCoverWeeks: number;
}

export function runImportSimulation(
  productName: string,
  conversionRate: number, // slider value (e.g. 42 for 42%)
  safetyStockPercent: number, // slider value (e.g. 20 for 20%)
  targetStockCoverWeeks: number // slider value (e.g. 8)
): ImportSimulationResult {
  // BaseDemand per product = SUM of EstimatedMonthlyDemand for selected product
  const demandRows = PRODUCT_DEMAND.filter(row => row.ProductName === productName);
  const baseDemand = demandRows.reduce((sum, row) => sum + row.EstimatedMonthlyDemand, 0);

  const rate = conversionRate / 100;
  const safety = safetyStockPercent / 100;

  // Required Quantity = (BaseDemand ÷ 4) × TargetStockCoverWeeks × ConversionRate × (1 + SafetyStock%)
  const requiredQuantity = Math.round((baseDemand / 4) * targetStockCoverWeeks * rate * (1 + safety));

  // Low = Required Quantity × 0.7
  const lowQuantity = Math.round(requiredQuantity * 0.7);
  // Expected = Required Quantity
  const expectedQuantity = requiredQuantity;
  // High = Required Quantity × 1.3
  const highQuantity = Math.round(requiredQuantity * 1.3);

  // StockCoverWeeks is targetStockCoverWeeks
  const stockCoverWeeks = targetStockCoverWeeks;

  return {
    productName,
    baseDemand,
    expectedQuantity,
    lowQuantity,
    highQuantity,
    stockCoverWeeks
  };
}

// Metric 3 Calculations: Pricing and Margin Model
export interface PricingSimulationResult {
  productName: string;
  landedCost: number;
  effectivePrice: number;
  grossProfitUnit: number;
  grossMarginPercent: number;
  breakEvenVolume: number;
  marketAvgPrice: number;
  isViable: boolean;
}

export function runPricingSimulation(
  productName: string,
  acquisitionCost: number,
  freightCost: number,
  proposedSellingPrice: number,
  discountPercent: number // e.g. 8 for 8%
): PricingSimulationResult {
  // LandedCost = AcquisitionCost + FreightCost
  const landedCost = acquisitionCost + freightCost;

  // EffectivePrice = ProposedSellingPrice x (1 - Discount%)
  const effectivePrice = proposedSellingPrice * (1 - (discountPercent / 100));

  // GrossProfitUnit = EffectivePrice - LandedCost
  const grossProfitUnit = effectivePrice - landedCost;

  // GrossMargin% = GrossProfitUnit divided by EffectivePrice x 100
  const grossMarginPercent = effectivePrice > 0 ? (grossProfitUnit / effectivePrice) * 100 : 0;

  // BreakEvenVolume = 1000 divided by GrossProfitUnit (assumes 1000 fixed cost for pilot)
  const breakEvenVolume = grossProfitUnit > 0 ? Math.round(1000 / grossProfitUnit) : Infinity;

  // MarketAvgPrice = AVERAGE of CurrentPurchasePrice from ProductDemand table
  const demandRows = PRODUCT_DEMAND.filter(row => row.ProductName === productName);
  const marketAvgPrice = demandRows.length > 0 
    ? demandRows.reduce((sum, row) => sum + row.CurrentPurchasePrice, 0) / demandRows.length 
    : 0;

  // Viability flag: below 15%
  const isViable = grossMarginPercent >= 15;

  return {
    productName,
    landedCost,
    effectivePrice,
    grossProfitUnit,
    grossMarginPercent,
    breakEvenVolume,
    marketAvgPrice,
    isViable
  };
}

// Phase 4 - Early Traction Metrics
export interface TractionMetrics {
  contactedCount: number;
  responseRate: number; // %
  highInterestRate: number; // %
  quoteRequestRate: number; // %
  sampleRequestRate: number; // %
  trialDiscussionRate: number; // %
  pipelineValue: number;
}

export function calculateTractionMetrics(): TractionMetrics {
  // KPI 1 — Pharmacies Contacted = COUNT of distinct PharmacyIDs in Engagement table
  const contactedPharmacies = new Set(ENGAGEMENT.map(e => e.PharmacyID));
  const contactedCount = contactedPharmacies.size;

  if (contactedCount === 0) {
    return {
      contactedCount: 0,
      responseRate: 0,
      highInterestRate: 0,
      quoteRequestRate: 0,
      sampleRequestRate: 0,
      trialDiscussionRate: 0,
      pipelineValue: 0
    };
  }

  // Helper to count distinct PharmacyIDs satisfying a condition
  const getDistinctCountSatisfying = (condition: (e: any) => boolean) => {
    const matchingPharms = new Set<string>();
    ENGAGEMENT.forEach(e => {
      if (condition(e)) {
        matchingPharms.add(e.PharmacyID);
      }
    });
    return matchingPharms.size;
  };

  // KPI 2 — Response Rate = distinct where InterestLevel is High or Medium
  const responsivePharmsCount = getDistinctCountSatisfying(e => e.InterestLevel === 'High' || e.InterestLevel === 'Medium');
  const responseRate = (responsivePharmsCount / contactedCount) * 100;

  // KPI 3 — High Interest Rate = distinct where InterestLevel is High
  const highInterestPharmsCount = getDistinctCountSatisfying(e => e.InterestLevel === 'High');
  const highInterestRate = (highInterestPharmsCount / contactedCount) * 100;

  // KPI 4 — Quote Request Rate = distinct where QuoteRequested = Yes
  const quotePharmsCount = getDistinctCountSatisfying(e => e.QuoteRequested === 'Yes');
  const quoteRequestRate = (quotePharmsCount / contactedCount) * 100;

  // KPI 5 — Sample Request Rate = distinct where SampleRequested = Yes
  const samplePharmsCount = getDistinctCountSatisfying(e => e.SampleRequested === 'Yes');
  const sampleRequestRate = (samplePharmsCount / contactedCount) * 100;

  // KPI 6 — Trial Discussion Rate = distinct where TrialOrderDiscussed = Yes
  const trialPharmsCount = getDistinctCountSatisfying(e => e.TrialOrderDiscussed === 'Yes');
  const trialDiscussionRate = (trialPharmsCount / contactedCount) * 100;

  // KPI 7 — Pipeline Value = SUM of (ExpectedTrialOrderQuantity x CurrentPurchasePrice) where WillingToTryNewSupplier = Yes
  const pipelineValue = PRODUCT_DEMAND
    .filter(row => row.WillingToTryNewSupplier === 'Yes')
    .reduce((sum, row) => sum + (row.ExpectedTrialOrderQuantity * row.CurrentPurchasePrice), 0);

  return {
    contactedCount,
    responseRate,
    highInterestRate,
    quoteRequestRate,
    sampleRequestRate,
    trialDiscussionRate,
    pipelineValue
  };
}
