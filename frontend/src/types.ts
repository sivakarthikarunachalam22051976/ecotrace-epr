export type Role =
  | "hub"
  | "corporate"
  | "auditor";

export interface CorporateBrand {
  id: string;
  company_name: string;
  industry: string;
  headquarters: string;
  annual_plastic_target_tons: number;
  credits_purchased_tons: number;
  compliance_percentage: number;
  total_spent: number;
  compliance_status: string;
}

export interface Ragpicker {
  id: string;
  name: string;
  phone: string;
  region: string;
  tier: string;
  reliability_score: number;
  total_collected_kg: number;
  total_transactions: number;
}

export interface PlasticBatch {
  id: string;
  hub_id: string;
  ragpicker_id: string;
  category: string;
  weight_kg: number;
  contamination_percentage?: number;
  integrity_score?: number;
  status: string;
  ai_classification?: string;
  ai_reasoning?: string;
  created_at: string;
  audited_at?: string;
  purchased_by?: string;
  purchased_at?: string;
}

export interface BatchTransaction {
  id: string;
  batch_id: string;
  hub_id: string;
  ragpicker_id: string;
  category: string;
  weight_kg: number;
  spot_cash_amount: number;
  transaction_status: string;
  created_at: string;
  audited_at?: string;
}

export interface EPRCredit {
  id: string;
  batch_id: string;
  hub_id: string;
  plastic_category: string;
  weight_kg: number;
  credit_value: number;
  status: string;
  purchased_by?: string | null;
  purchased_at?: string | null;
  created_at: string;
}

export interface CorporateBrand {
  id: string;
  company_name: string;
  industry: string;
  headquarters: string;
  annual_plastic_target_tons: number;
  credits_purchased_tons: number;
  compliance_percentage: number;
  total_spent: number;
  compliance_status: string;
}

export interface HubMetrics {
  total_batches: number;
  total_plastic_kg: number;
  verified_batches: number;
  rejected_batches: number;
  pending_batches: number;
  total_epr_credits: number;
  available_epr_credits: number;
  average_integrity_score: number;
}

export interface AuditorMetrics {
  total_plastic_recovered_kg: number;
  total_plastic_recovered_tons: number;
  total_hubs: number;
  verified_hubs: number;
  total_ragpickers: number;
  total_transactions: number;
  verified_transactions: number;
  total_epr_credits: number;
  purchased_epr_credits: number;
  fraud_alerts: number;
  ledger_integrity_percentage: number;
}

export interface BatchAuditResult {
  plastic_category: string;
  contamination_percentage: number;
  integrity_score: number;
  authenticity: string;
  confidence_score: number;
  reasoning: string;
  recommended_action: string;
}

export interface ESGInsight {
  compliance_percentage: number;
  remaining_target_tons: number;
  risk_level: string;
  executive_summary: string;
  sourcing_recommendations: string[];
  regional_recommendations: string[];
  action_plan: string[];
  estimated_completion_timeline: string;
}

export interface DashboardData {
  hub_metrics: HubMetrics;
  auditor_metrics: AuditorMetrics;
  corporates: CorporateBrand[];
  recent_transactions: BatchTransaction[];
  available_credits: EPRCredit[];
}