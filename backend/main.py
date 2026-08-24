import os

from dotenv import load_dotenv

from fastapi import (
    FastAPI,
    HTTPException,
)

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from ai.intelligence import (
    audit_batch,
    generate_esg_insight,
)

from mock_db import db

from schemas import (
    AuditBatchRequest,
    CreateTransactionRequest,
    ESGInsightRequest,
)

load_dotenv()


# ============================================================
# CONFIGURATION
# ============================================================

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
)

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ecotrace-epr.vercel.app",
]

if not allowed_origins:
    allowed_origins = [
        "http://localhost:5173"
    ]


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="EcoTrace-EPR API",
    description=(
        "Plastic Waste Traceability and Extended "
        "Producer Responsibility Credit Platform"
    ),
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://ecotrace-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "project": "EcoTrace-EPR",
        "status": "online",
        "message": "EcoTrace-EPR backend is running",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ecotrace-epr-backend",
        "database": "mock-database-loaded",
        "environment": (
            os.getenv("ENVIRONMENT", "development")
        ),
    }


# ============================================================
# HUBS
# ============================================================

@app.get("/api/hubs")
def get_hubs():
    hubs = list(db.hubs.values())

    return {
        "count": len(hubs),
        "hubs": hubs,
    }


# ============================================================
# RAGPICKERS
# ============================================================

@app.get("/api/ragpickers")
def get_ragpickers():
    ragpickers = list(
        db.ragpickers.values()
    )

    return {
        "count": len(ragpickers),
        "ragpickers": ragpickers,
    }


# ============================================================
# BATCHES
# ============================================================

@app.get("/api/batches")
def get_batches():
    batches = list(
        db.batches.values()
    )

    return {
        "count": len(batches),
        "batches": batches,
    }


# ============================================================
# TRANSACTIONS
# ============================================================

@app.get("/api/transactions")
def get_transactions():
    transactions = (
        db.recent_transactions(100)
    )

    return {
        "count": len(transactions),
        "transactions": transactions,
    }


# ============================================================
# EPR CREDITS
# ============================================================

@app.get("/api/credits")
def get_credits():
    credits = list(
        db.credits.values()
    )

    return {
        "count": len(credits),
        "credits": credits,
    }


# ============================================================
# AVAILABLE EPR CREDITS
# ============================================================

@app.get("/api/credits/available")
def get_available_credits():
    credits = db.available_credits(
        limit=100
    )

    return {
        "count": len(credits),
        "credits": credits,
    }


# ============================================================
# CORPORATES
# ============================================================

@app.get("/api/corporates")
def get_corporates():
    corporates = list(
        db.corporates.values()
    )

    return {
        "count": len(corporates),
        "corporates": corporates,
    }


# ============================================================
# HUB METRICS
# ============================================================

@app.get("/api/metrics/hub")
def get_hub_metrics():
    return db.hub_metrics()


# ============================================================
# GOVERNMENT AUDITOR METRICS
# ============================================================

@app.get("/api/metrics/auditor")
def get_auditor_metrics():
    return db.auditor_metrics()


# ============================================================
# DASHBOARD
# ============================================================

@app.get("/api/dashboard")
def get_dashboard():
    return {
        "hub_metrics": db.hub_metrics(),
        "auditor_metrics": (
            db.auditor_metrics()
        ),
        "corporates": list(
            db.corporates.values()
        ),
        "recent_transactions": (
            db.recent_transactions(10)
        ),
        "available_credits": (
            db.available_credits(10)
        ),
    }


# ============================================================
# CREATE TRANSACTION
# ============================================================

@app.post("/api/transactions")
def create_transaction(
    data: CreateTransactionRequest,
):
    try:
        batch, transaction = (
            db.add_transaction(
                hub_id=data.hub_id,
                ragpicker_id=data.ragpicker_id,
                category=data.category,
                weight_kg=data.weight_kg,
                spot_cash_amount=(
                    data.spot_cash_amount
                ),
            )
        )

        return {
            "message": (
                "Transaction created successfully"
            ),
            "batch": batch,
            "transaction": transaction,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# RUN AI BATCH AUDIT
# ============================================================

@app.post(
    "/api/batches/{batch_id}/audit"
)
def run_batch_audit(
    batch_id: str,
    data: AuditBatchRequest,
):
    if batch_id not in db.batches:
        raise HTTPException(
            status_code=404,
            detail="Batch not found",
        )

    batch = db.batches[batch_id]

    description = data.description.strip()

    if not description:
        description = (
            f"Plastic waste batch containing "
            f"{batch.category}. Submitted from "
            f"an EcoTrace-EPR collection hub."
        )

    audit_result = audit_batch(
        description=description,
        weight_kg=batch.weight_kg,
        category=batch.category,
    )

    try:
        updated_batch = db.apply_audit(
            batch_id=batch_id,
            audit_result=audit_result,
        )

        generated_credit = next(
            (
                credit
                for credit in db.credits.values()
                if credit.batch_id == batch_id
            ),
            None,
        )

        return {
            "message": (
                "AI audit completed successfully"
            ),
            "audit_result": audit_result,
            "batch": updated_batch,
            "credit": generated_credit,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# PURCHASE EPR CREDIT
# ============================================================

@app.post(
    "/api/corporates/"
    "{corporate_id}/credits/"
    "{credit_id}/purchase"
)
def purchase_epr_credit(
    corporate_id: str,
    credit_id: str,
):
    try:
        credit, corporate = (
            db.purchase_credit(
                corporate_id=corporate_id,
                credit_id=credit_id,
            )
        )

        return {
            "message": (
                "EPR credit purchased successfully"
            ),
            "credit": credit,
            "corporate": corporate,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# CORPORATE AI INSIGHT
# ============================================================

@app.post(
    "/api/corporates/"
    "{corporate_id}/insights"
)
def get_corporate_insights(
    corporate_id: str,
):
    if corporate_id not in db.corporates:
        raise HTTPException(
            status_code=404,
            detail="Corporate not found",
        )

    corporate = db.corporates[
        corporate_id
    ]

    available_credits_tons = (
        sum(
            credit.weight_kg
            for credit
            in db.credits.values()
            if credit.status == "Available"
        )
        / 1000
    )

    request = ESGInsightRequest(
        company_name=(
            corporate.company_name
        ),
        industry=corporate.industry,
        annual_target_tons=(
            corporate
            .annual_plastic_target_tons
        ),
        credits_purchased_tons=(
            corporate
            .credits_purchased_tons
        ),
        available_market_credits_tons=(
            round(
                available_credits_tons,
                2,
            )
        ),
        preferred_regions=[
            "Karnataka",
            "Tamil Nadu",
            "Telangana",
        ],
    )

    insight = generate_esg_insight(
        request
    )

    return insight