/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pharmacy {
  PharmacyID: string;
  PharmacyName: string;
  Location: string;
  PharmacyType: string;
  NumberOfBranches: number;
  EstimatedCustomerVolume: number;
  PrimaryContactName: string;
  PrimaryContactRole: string;
  Status: string;
  DateAdded: string;
}

export interface ProductDemand {
  DemandID: string;
  PharmacyID: string;
  ProductName: string;
  TherapeuticCategory: string;
  BrandOrGeneric: 'Brand' | 'Generic';
  EstimatedMonthlyDemand: number;
  StockOutFrequency: 'Never' | 'Occasional' | 'Monthly' | 'Frequent';
  CurrentPurchasePrice: number;
  WillingToTryNewSupplier: 'Yes' | 'No' | 'Maybe';
  ExpectedTrialOrderQuantity: number;
  SurveyDate: string;
}

export interface Engagement {
  EngagementID: string;
  PharmacyID: string;
  RepresentativeID: string;
  ContactDate: string;
  ContactType: string;
  InterestLevel: 'High' | 'Medium' | 'Low';
  QuoteRequested: 'Yes' | 'No';
  SampleRequested: 'Yes' | 'No';
  TrialOrderDiscussed: 'Yes' | 'No';
  Outcome: string;
  FollowUpDate?: string;
  Notes: string;
}

export interface SurveyRepresentative {
  RepresentativeID: string;
  RepresentativeName: string;
  Region: string;
  Phone: string;
}

export interface OpportunityMetrics {
  productName: string;
  category: string;
  type: 'Brand' | 'Generic';
  demandIntensity: number; // raw sum
  pharmacyReachCount: number; // count of distinct pharmacies
  stockoutSignalCount: number; // count of monthly or frequent stockout
  switchingReadinessCount: number; // count of yes
  trialOrderSignalSum: number; // sum of expected trial quantity
  
  // Normalised components (0-1)
  normDemandIntensity: number;
  normPharmacyReach: number;
  normStockoutSignal: number;
  normSwitchingReadiness: number;
  normTrialOrderSignal: number;
  
  opportunityScore: number; // 0-100
  classification: 'HIGH PRIORITY' | 'MEDIUM' | 'MONITOR' | 'LOW POTENTIAL';
}
