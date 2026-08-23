from datetime import datetime
from typing import List, Optional

from pydantic import (
    BaseModel,
    Field,
    field_validator,
)


# ============================================================
# CORE ECOSYSTEM MODELS
# ============================================================

class Ragpicker(BaseModel):
    id: str
    name: str
    phone: str
    region: str
    tier: str
    reliability_score: float
    total_collected_kg: float = 0
    total_transactions: int = 0


class ScrapHub(BaseModel):
    id: str
    name: str
    city: str
    state: str
    capacity_kg_per_day: float
    total_plastic_processed_kg: float = 0
    total_transactions: int = 0
    verified: bool = True


class PlasticBatch(BaseModel):
    id: str
    hub_id: str
    ragpicker_id: str
    category: str
    weight_kg: float
    status: str

    contamination_percentage: Optional[float] = None
    integrity_score: Optional[float] = None
    ai_classification: Optional[str] = None
    ai_reasoning: Optional[str] = None

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    audited_at: Optional[datetime] = None
    purchased_by: Optional[str] = None
    purchased_at: Optional[datetime] = None


class BatchTransaction(BaseModel):
    id: str
    batch_id: str
    hub_id: str
    ragpicker_id: str
    category: str
    weight_kg: float
    spot_cash_amount: float
    transaction_status: str

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    audited_at: Optional[datetime] = None


class EPRCredit(BaseModel):
    id: str
    batch_id: str
    hub_id: str
    plastic_category: str
    weight_kg: float
    credit_value: float
    status: str

    purchased_by: Optional[str] = None
    purchased_at: Optional[datetime] = None


class CorporateBrand(BaseModel):
    id: str
    company_name: str
    industry: str
    headquarters: str
    annual_plastic_target_tons: float
    credits_purchased_tons: float = 0
    compliance_percentage: float = 0
    total_spent: float = 0
    compliance_status: str = "Non-Compliant"


# ============================================================
# API REQUEST MODELS
# ============================================================

class CreateTransactionRequest(BaseModel):
    hub_id: str = Field(
        min_length=1,
        max_length=100,
    )

    ragpicker_id: str = Field(
        min_length=1,
        max_length=100,
    )

    category: str

    weight_kg: float = Field(
        gt=0,
        le=100000,
    )

    spot_cash_amount: float = Field(
        ge=0,
        le=100000000,
    )

    @field_validator("category")
    @classmethod
    def validate_category(
        cls,
        value: str,
    ):
        allowed_categories = {
            "Category 1 - Rigid",
            "Category 2 - Flexible",
            "Category 3 - Multi-Layered",
        }

        if value not in allowed_categories:
            raise ValueError(
                "Invalid plastic category."
            )

        return value


class AuditBatchRequest(BaseModel):
    description: str = Field(
        default="",
        max_length=2000,
    )


# ============================================================
# AI RESPONSE MODELS
# ============================================================

class BatchAuditResult(BaseModel):
    plastic_category: str

    contamination_percentage: float = Field(
        ge=0,
        le=100,
    )

    integrity_score: float = Field(
        ge=0,
        le=100,
    )

    authenticity: str

    confidence_score: float = Field(
        ge=0,
        le=100,
    )

    reasoning: str = Field(
        min_length=5,
        max_length=3000,
    )

    recommended_action: str

    @field_validator("plastic_category")
    @classmethod
    def validate_ai_category(
        cls,
        value: str,
    ):
        allowed = {
            "Category 1 - Rigid",
            "Category 2 - Flexible",
            "Category 3 - Multi-Layered",
        }

        if value not in allowed:
            raise ValueError(
                "AI returned an invalid plastic category."
            )

        return value

    @field_validator("recommended_action")
    @classmethod
    def validate_recommended_action(
        cls,
        value: str,
    ):
        allowed = {
            "Approve",
            "Approve with Review",
            "Reject",
        }

        if value not in allowed:
            raise ValueError(
                "AI returned an invalid recommended action."
            )

        return value


class ESGInsightRequest(BaseModel):
    company_name: str = Field(
        min_length=1,
        max_length=200,
    )

    industry: str = Field(
        min_length=1,
        max_length=200,
    )

    annual_target_tons: float = Field(
        gt=0,
        le=10000000,
    )

    credits_purchased_tons: float = Field(
        ge=0,
        le=10000000,
    )

    available_market_credits_tons: float = Field(
        ge=0,
        le=10000000,
    )

    preferred_regions: Optional[
        List[str]
    ] = None


class ESGInsight(BaseModel):
    compliance_percentage: float = Field(
        ge=0,
        le=100,
    )

    remaining_target_tons: float = Field(
        ge=0,
    )

    risk_level: str

    executive_summary: str = Field(
        min_length=5,
        max_length=3000,
    )

    sourcing_recommendations: List[str]

    regional_recommendations: List[str]

    action_plan: List[str]

    estimated_completion_timeline: str

    @field_validator("risk_level")
    @classmethod
    def validate_risk_level(
        cls,
        value: str,
    ):
        allowed = {
            "Low",
            "Medium",
            "High",
            "Critical",
        }

        if value not in allowed:
            raise ValueError(
                "AI returned an invalid risk level."
            )

        return value


# ============================================================
# METRICS MODELS
# ============================================================

class HubMetrics(BaseModel):
    total_batches: int
    total_plastic_kg: float
    verified_batches: int
    rejected_batches: int
    pending_batches: int
    total_epr_credits: int
    available_epr_credits: int
    average_integrity_score: float


class AuditorMetrics(BaseModel):
    total_plastic_recovered_kg: float
    total_plastic_recovered_tons: float
    total_hubs: int
    verified_hubs: int
    total_ragpickers: int
    total_transactions: int
    verified_transactions: int
    total_epr_credits: int
    purchased_epr_credits: int
    fraud_alerts: int
    ledger_integrity_percentage: float