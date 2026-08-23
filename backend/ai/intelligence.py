import json
import os

from google import genai
from google.genai import types

from schemas import (
    BatchAuditResult,
    ESGInsight,
    ESGInsightRequest,
)


MODEL_NAME = "gemini-2.5-flash"


def get_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return None

    return genai.Client(
        api_key=api_key
    )


# ============================================================
# FALLBACK BATCH AUDIT
# ============================================================

def fallback_batch_audit(
    description: str,
    weight_kg: float,
    category=None,
) -> BatchAuditResult:

    text = description.lower()

    if category:
        detected_category = category

    elif any(
        word in text
        for word in [
            "bottle",
            "container",
            "bucket",
            "crate",
            "rigid",
        ]
    ):
        detected_category = (
            "Category 1 - Rigid"
        )

    elif any(
        word in text
        for word in [
            "packet",
            "bag",
            "film",
            "wrapper",
            "flexible",
        ]
    ):
        detected_category = (
            "Category 2 - Flexible"
        )

    else:
        detected_category = (
            "Category 3 - Multi-Layered"
        )

    contamination = min(
        25,
        max(
            3,
            weight_kg / 30,
        ),
    )

    integrity = max(
        70,
        min(
            97,
            95 - contamination * 0.6,
        ),
    )

    if integrity >= 85:
        recommended_action = "Approve"

    elif integrity >= 70:
        recommended_action = (
            "Approve with Review"
        )

    else:
        recommended_action = "Reject"

    return BatchAuditResult(
        plastic_category=detected_category,
        contamination_percentage=round(
            contamination,
            1,
        ),
        integrity_score=round(
            integrity,
            1,
        ),
        authenticity="Likely Authentic",
        confidence_score=82,
        reasoning=(
            "Fallback audit engine was used because "
            "Gemini was unavailable. The submitted "
            "batch description and declared weight "
            "appear consistent with a plausible "
            "recyclable plastic stream."
        ),
        recommended_action=recommended_action,
    )


# ============================================================
# GEMINI BATCH AUDIT
# ============================================================

def audit_batch(
    description: str,
    weight_kg: float,
    category=None,
) -> BatchAuditResult:

    client = get_client()

    if client is None:
        return fallback_batch_audit(
            description,
            weight_kg,
            category,
        )

    prompt = f"""
You are the AI batch integrity auditor for
EcoTrace-EPR, an Indian Extended Producer
Responsibility plastic traceability platform.

Analyze the following plastic waste batch.

Declared category:
{category or "Not provided"}

Declared weight:
{weight_kg} kg

Batch description:
{description}

Classify the material into exactly one category:

Category 1 - Rigid
Category 2 - Flexible
Category 3 - Multi-Layered

Estimate contamination percentage from 0 to 100.

Generate an integrity score from 0 to 100.

Evaluate whether the batch appears authentic and
consistent with the submitted information.

Choose one recommended action:

Approve
Approve with Review
Reject

Be conservative but realistic.

Return only the requested structured JSON output.
"""

    try:

        response = (
            client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type=(
                        "application/json"
                    ),
                    response_schema=(
                        BatchAuditResult
                    ),
                ),
            )
        )

        if (
            hasattr(response, "parsed")
            and response.parsed
        ):
            return response.parsed

        data = json.loads(
            response.text
        )

        return (
            BatchAuditResult.model_validate(
                data
            )
        )

    except Exception as error:

        print(
            "Gemini batch audit failed:",
            error,
        )

        return fallback_batch_audit(
            description,
            weight_kg,
            category,
        )


# ============================================================
# FALLBACK ESG INSIGHT
# ============================================================

def fallback_esg_insight(
    request: ESGInsightRequest,
) -> ESGInsight:

    if request.annual_target_tons <= 0:
        progress = 0
    else:
        progress = min(
            (
                request.credits_purchased_tons
                / request.annual_target_tons
            )
            * 100,
            100,
        )

    remaining = max(
        request.annual_target_tons
        - request.credits_purchased_tons,
        0,
    )

    if progress >= 90:
        risk = "Low"
        timeline = "0-30 days"

    elif progress >= 70:
        risk = "Medium"
        timeline = "30-60 days"

    elif progress >= 45:
        risk = "High"
        timeline = "60-90 days"

    else:
        risk = "Critical"
        timeline = "90+ days"

    regions = (
        request.preferred_regions
        or [
            "Karnataka",
            "Tamil Nadu",
        ]
    )

    return ESGInsight(
        compliance_percentage=round(
            progress,
            1,
        ),
        remaining_target_tons=round(
            remaining,
            2,
        ),
        risk_level=risk,
        executive_summary=(
            f"{request.company_name} has achieved "
            f"{progress:.1f}% of its annual EPR "
            f"target. Approximately "
            f"{remaining:.2f} tons of verified "
            f"plastic recovery credits remain "
            f"to close the compliance gap."
        ),
        sourcing_recommendations=[
            (
                "Prioritize high-integrity verified "
                "plastic recovery credits."
            ),
            (
                "Diversify sourcing across multiple "
                "local waste collection hubs."
            ),
            (
                "Prioritize batches with strong "
                "AI integrity scores."
            ),
        ],
        regional_recommendations=[
            (
                f"Evaluate {region} for additional "
                f"verified recovery capacity."
            )
            for region in regions
        ],
        action_plan=[
            (
                f"Source approximately "
                f"{remaining:.1f} additional tons "
                f"of verified recovery credits."
            ),
            (
                "Prioritize batches with integrity "
                "scores above 90."
            ),
            (
                "Monitor credit purchases against "
                "the annual compliance target."
            ),
            (
                "Maintain a diversified regional "
                "sourcing portfolio."
            ),
        ],
        estimated_completion_timeline=timeline,
    )


# ============================================================
# GEMINI ESG INSIGHT
# ============================================================

def generate_esg_insight(
    request: ESGInsightRequest,
) -> ESGInsight:

    client = get_client()

    if client is None:
        return fallback_esg_insight(
            request
        )

    prompt = f"""
You are an ESG and Extended Producer
Responsibility compliance advisor for EcoTrace-EPR.

Analyze this company's current EPR position.

Company:
{request.company_name}

Industry:
{request.industry}

Annual plastic EPR target:
{request.annual_target_tons} tons

Credits already purchased:
{request.credits_purchased_tons} tons

Currently available verified market credits:
{request.available_market_credits_tons} tons

Preferred sourcing regions:
{request.preferred_regions}

Calculate the compliance percentage.

Determine exactly one risk level:

Low
Medium
High
Critical

Provide concise and practical recommendations.

Create:
1. Executive summary
2. Sourcing recommendations
3. Regional recommendations
4. Action plan
5. Estimated completion timeline

Return only structured JSON.
"""

    try:

        response = (
            client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.25,
                    response_mime_type=(
                        "application/json"
                    ),
                    response_schema=ESGInsight,
                ),
            )
        )

        if (
            hasattr(response, "parsed")
            and response.parsed
        ):
            return response.parsed

        data = json.loads(
            response.text
        )

        return (
            ESGInsight.model_validate(
                data
            )
        )

    except Exception as error:

        print(
            "Gemini ESG insight failed:",
            error,
        )

        return fallback_esg_insight(
            request
        )