import random
import uuid
from datetime import datetime, timedelta
from threading import Lock
from typing import Dict, List

from schemas import (
    AuditorMetrics,
    BatchTransaction,
    CorporateBrand,
    EPRCredit,
    HubMetrics,
    PlasticBatch,
    Ragpicker,
    ScrapHub,
)


class MockDatabase:
    def __init__(self):
        self.lock = Lock()

        self.ragpickers: Dict[str, Ragpicker] = {}
        self.hubs: Dict[str, ScrapHub] = {}
        self.batches: Dict[str, PlasticBatch] = {}
        self.transactions: Dict[str, BatchTransaction] = {}
        self.credits: Dict[str, EPRCredit] = {}
        self.corporates: Dict[str, CorporateBrand] = {}

        self._seed()

    def _id(self, prefix: str) -> str:
        return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

    def _seed(self):
        random.seed(42)

        regions = [
            ("Bengaluru", "Karnataka"),
            ("Mysuru", "Karnataka"),
            ("Hubballi", "Karnataka"),
            ("Mangaluru", "Karnataka"),
            ("Chennai", "Tamil Nadu"),
            ("Hyderabad", "Telangana"),
        ]

        names = [
            "Ramesh Kumar",
            "Suresh Babu",
            "Manjunath",
            "Ravi",
            "Shankar",
            "Mahesh",
            "Kiran",
            "Prakash",
            "Anil",
            "Naveen",
            "Sanjay",
            "Mohan",
            "Ganesh",
            "Vijay",
            "Arun",
        ]

        # --------------------------------------------------
        # RAGPICKERS
        # --------------------------------------------------

        for i in range(45):
            city, state = random.choice(regions)

            rag_id = self._id("RAG")

            self.ragpickers[rag_id] = Ragpicker(
                id=rag_id,
                name=f"{random.choice(names)} {i + 1}",
                phone=f"+91 98{random.randint(10000000, 99999999)}",
                region=state,
                tier=random.choice(
                    ["Tier 1", "Tier 2", "Tier 3"]
                ),
                reliability_score=round(
                    random.uniform(72, 98), 1
                ),
            )

        # --------------------------------------------------
        # SCRAP HUBS
        # --------------------------------------------------

        for i in range(15):
            city, state = random.choice(regions)

            hub_id = self._id("HUB")

            self.hubs[hub_id] = ScrapHub(
                id=hub_id,
                name=f"Eco Scrap Hub {i + 1}",
                owner_name=random.choice(names),
                region=state,
                state=state,
                city=city,
                tier=random.choice(
                    ["Tier 1", "Tier 2", "Tier 3"]
                ),
                capacity_kg_per_day=round(
                    random.uniform(500, 3000),
                    2,
                ),
            )

        # --------------------------------------------------
        # CORPORATES
        # --------------------------------------------------

        corporate_data = [
            ("GreenBite Foods", "FMCG", "Mumbai"),
            ("UrbanCare Consumer", "Consumer Goods", "Delhi"),
            ("Nova Beverages", "Beverages", "Bengaluru"),
            ("PureHome Products", "Home Care", "Chennai"),
            ("FreshKart Retail", "Retail", "Hyderabad"),
        ]

        for i, (company, industry, headquarters) in enumerate(
            corporate_data
        ):
            corporate_id = f"CORP-{i + 1:03d}"

            target = random.uniform(800, 2500)

            purchased = random.uniform(
                target * 0.35,
                target * 0.82,
            )

            self.corporates[corporate_id] = CorporateBrand(
                id=corporate_id,
                company_name=company,
                industry=industry,
                headquarters=headquarters,
                annual_plastic_target_tons=round(
                    target, 2
                ),
                credits_purchased_tons=round(
                    purchased, 2
                ),
                compliance_percentage=round(
                    min((purchased / target) * 100, 100),
                    1,
                ),
                total_spent=round(
                    purchased * random.uniform(18, 30),
                    2,
                ),
                compliance_status=(
                    "Compliant"
                    if purchased / target >= 0.9
                    else "Partially Compliant"
                ),
            )

        # --------------------------------------------------
        # HISTORICAL TRANSACTIONS
        # --------------------------------------------------

        categories = [
            "Category 1 - Rigid",
            "Category 2 - Flexible",
            "Category 3 - Multi-Layered",
        ]

        hub_ids = list(self.hubs.keys())
        rag_ids = list(self.ragpickers.keys())

        for i in range(320):
            hub_id = random.choice(hub_ids)
            rag_id = random.choice(rag_ids)
            category = random.choice(categories)

            weight = round(
                random.uniform(8, 240),
                2,
            )

            contamination = round(
                random.uniform(2, 24),
                1,
            )

            integrity = round(
                random.uniform(78, 99),
                1,
            )

            created_at = datetime.utcnow() - timedelta(
                days=random.randint(1, 240),
                hours=random.randint(0, 23),
            )

            batch_id = self._id("BAT")
            transaction_id = self._id("TXN")

            batch = PlasticBatch(
                id=batch_id,
                hub_id=hub_id,
                ragpicker_id=rag_id,
                category=category,
                weight_kg=weight,
                contamination_percentage=contamination,
                integrity_score=integrity,
                status="Verified",
                ai_classification=category,
                ai_reasoning=(
                    "Historical mock transaction passed "
                    "automated integrity validation."
                ),
                created_at=created_at,
                audited_at=created_at + timedelta(
                    minutes=3
                ),
            )

            transaction = BatchTransaction(
                id=transaction_id,
                batch_id=batch_id,
                hub_id=hub_id,
                ragpicker_id=rag_id,
                category=category,
                weight_kg=weight,
                spot_cash_amount=round(
                    weight * random.uniform(16, 32),
                    2,
                ),
                transaction_status="Verified",
                created_at=created_at,
                audited_at=created_at + timedelta(
                    minutes=3
                ),
            )

            self.batches[batch_id] = batch
            self.transactions[transaction_id] = transaction

            # Update ragpicker statistics
            rag = self.ragpickers[rag_id]

            rag.total_collected_kg += weight
            rag.total_transactions += 1

            # Update hub statistics
            hub = self.hubs[hub_id]

            hub.total_plastic_processed_kg += weight
            hub.total_transactions += 1

            # Create EPR credit
            credit_id = self._id("EPR")

            credit_value = weight * random.uniform(
                20,
                34,
            )

            self.credits[credit_id] = EPRCredit(
                id=credit_id,
                batch_id=batch_id,
                hub_id=hub_id,
                plastic_category=category,
                weight_kg=weight,
                credit_value=round(
                    credit_value,
                    2,
                ),
                status="Available",
            )

        # --------------------------------------------------
        # RANDOMLY PURCHASE HISTORICAL CREDITS
        # --------------------------------------------------

        available_credits = list(
            self.credits.values()
        )

        random.shuffle(available_credits)

        corporate_ids = list(
            self.corporates.keys()
        )

        for credit in available_credits[:90]:
            corporate_id = random.choice(
                corporate_ids
            )

            corporate = self.corporates[corporate_id]

            credit.status = "Purchased"
            credit.purchased_by = corporate_id

            # EPRCredit has no created_at field.
            # Use the associated batch creation time instead.
            batch = self.batches[credit.batch_id]

            credit.purchased_at = (
                batch.created_at + timedelta(days=1)
            )

            batch.purchased_by = corporate_id
            batch.purchased_at = credit.purchased_at

            corporate.total_spent += credit.credit_value

        # Recalculate corporate numbers
        self._recalculate_corporates()

    # ======================================================
    # CALCULATIONS
    # ======================================================

    def _recalculate_corporates(self):
        for corporate in self.corporates.values():
            purchased_kg = sum(
                credit.weight_kg
                for credit in self.credits.values()
                if credit.purchased_by == corporate.id
            )

            purchased_tons = purchased_kg / 1000

            corporate.credits_purchased_tons = round(
                purchased_tons,
                2,
            )

            target = corporate.annual_plastic_target_tons

            corporate.compliance_percentage = round(
                min(
                    (purchased_tons / target) * 100,
                    100,
                ),
                1,
            )

            if corporate.compliance_percentage >= 100:
                corporate.compliance_status = "Compliant"

            elif corporate.compliance_percentage >= 75:
                corporate.compliance_status = (
                    "Partially Compliant"
                )

            elif corporate.compliance_percentage >= 50:
                corporate.compliance_status = "At Risk"

            else:
                corporate.compliance_status = (
                    "Non-Compliant"
                )

    # ======================================================
    # METRICS
    # ======================================================

    def hub_metrics(self) -> HubMetrics:
        batches = list(self.batches.values())

        verified = [
            b for b in batches
            if b.status == "Verified"
        ]

        rejected = [
            b for b in batches
            if b.status == "Rejected"
        ]

        pending = [
            b for b in batches
            if b.status == "Pending"
        ]

        avg_integrity = (
            sum(
                b.integrity_score
                for b in verified
            ) / len(verified)
            if verified
            else 0
        )

        return HubMetrics(
            total_batches=len(batches),
            total_plastic_kg=round(
                sum(b.weight_kg for b in batches),
                2,
            ),
            verified_batches=len(verified),
            rejected_batches=len(rejected),
            pending_batches=len(pending),
            total_epr_credits=len(self.credits),
            available_epr_credits=sum(
                1
                for c in self.credits.values()
                if c.status == "Available"
            ),
            average_integrity_score=round(
                avg_integrity,
                1,
            ),
        )

    def auditor_metrics(self) -> AuditorMetrics:
        total_kg = sum(
            b.weight_kg
            for b in self.batches.values()
            if b.status == "Verified"
        )

        verified_transactions = sum(
            1
            for t in self.transactions.values()
            if t.transaction_status
            in ["Verified", "Credit Purchased"]
        )

        fraud_alerts = sum(
            1
            for b in self.batches.values()
            if b.integrity_score < 60
        )

        integrity = (
            verified_transactions
            / len(self.transactions)
            * 100
            if self.transactions
            else 100
        )

        return AuditorMetrics(
            total_plastic_recovered_kg=round(
                total_kg,
                2,
            ),
            total_plastic_recovered_tons=round(
                total_kg / 1000,
                2,
            ),
            total_hubs=len(self.hubs),
            verified_hubs=sum(
                1
                for h in self.hubs.values()
                if h.verified
            ),
            total_ragpickers=len(
                self.ragpickers
            ),
            total_transactions=len(
                self.transactions
            ),
            verified_transactions=verified_transactions,
            total_epr_credits=len(
                self.credits
            ),
            purchased_epr_credits=sum(
                1
                for c in self.credits.values()
                if c.status == "Purchased"
            ),
            fraud_alerts=fraud_alerts,
            ledger_integrity_percentage=round(
                integrity,
                2,
            ),
        )

    # ======================================================
    # NEW TRANSACTION
    # ======================================================

    def add_transaction(
        self,
        hub_id: str,
        ragpicker_id: str,
        category: str,
        weight_kg: float,
        spot_cash_amount: float,
    ):
        with self.lock:
            if hub_id not in self.hubs:
                raise ValueError("Hub not found")

            if ragpicker_id not in self.ragpickers:
                raise ValueError(
                    "Ragpicker not found"
                )

            batch_id = self._id("BAT")
            transaction_id = self._id("TXN")

            batch = PlasticBatch(
                id=batch_id,
                hub_id=hub_id,
                ragpicker_id=ragpicker_id,
                category=category,
                weight_kg=weight_kg,
                status="Pending",
            )

            transaction = BatchTransaction(
                id=transaction_id,
                batch_id=batch_id,
                hub_id=hub_id,
                ragpicker_id=ragpicker_id,
                category=category,
                weight_kg=weight_kg,
                spot_cash_amount=spot_cash_amount,
                transaction_status="Pending Audit",
            )

            self.batches[batch_id] = batch
            self.transactions[transaction_id] = transaction

            self.ragpickers[
                ragpicker_id
            ].total_collected_kg += weight_kg

            self.ragpickers[
                ragpicker_id
            ].total_transactions += 1

            self.hubs[
                hub_id
            ].total_plastic_processed_kg += weight_kg

            self.hubs[
                hub_id
            ].total_transactions += 1

            return batch, transaction

    # ======================================================
    # APPLY AI AUDIT
    # ======================================================

    def apply_audit(
        self,
        batch_id: str,
        audit_result,
    ):
        with self.lock:
            if batch_id not in self.batches:
                raise ValueError(
                    "Batch not found"
                )

            batch = self.batches[batch_id]

            batch.category = (
                audit_result.plastic_category
            )

            batch.contamination_percentage = (
                audit_result.contamination_percentage
            )

            batch.integrity_score = (
                audit_result.integrity_score
            )

            batch.ai_classification = (
                audit_result.plastic_category
            )

            batch.ai_reasoning = (
                audit_result.reasoning
            )

            batch.audited_at = datetime.utcnow()

            if audit_result.recommended_action in [
                "Approve",
                "Approve with Review",
            ]:
                batch.status = "Verified"

            else:
                batch.status = "Rejected"

            for transaction in self.transactions.values():
                if transaction.batch_id == batch_id:
                    transaction.category = batch.category

                    transaction.transaction_status = (
                        "Verified"
                        if batch.status == "Verified"
                        else "Rejected"
                    )

                    transaction.audited_at = (
                        batch.audited_at
                    )

            # Create credit only after verification
            existing_credit = next(
                (
                    c
                    for c in self.credits.values()
                    if c.batch_id == batch_id
                ),
                None,
            )

            if (
                batch.status == "Verified"
                and existing_credit is None
            ):
                credit_id = self._id("EPR")

                credit_value = (
                    batch.weight_kg * 25
                )

                self.credits[credit_id] = EPRCredit(
                    id=credit_id,
                    batch_id=batch.id,
                    hub_id=batch.hub_id,
                    plastic_category=batch.category,
                    weight_kg=batch.weight_kg,
                    credit_value=round(
                        credit_value,
                        2,
                    ),
                    status="Available",
                )

            return batch

    # ======================================================
    # PURCHASE CREDIT
    # ======================================================

    def purchase_credit(
        self,
        corporate_id: str,
        credit_id: str,
    ):
        with self.lock:
            if corporate_id not in self.corporates:
                raise ValueError(
                    "Corporate not found"
                )

            if credit_id not in self.credits:
                raise ValueError(
                    "Credit not found"
                )

            credit = self.credits[credit_id]

            if credit.status != "Available":
                raise ValueError(
                    "Credit is no longer available"
                )

            corporate = self.corporates[
                corporate_id
            ]

            credit.status = "Purchased"
            credit.purchased_by = corporate_id
            credit.purchased_at = datetime.utcnow()

            batch = self.batches[
                credit.batch_id
            ]

            batch.purchased_by = corporate_id
            batch.purchased_at = credit.purchased_at

            self._recalculate_corporates()

            return credit, corporate

    # ======================================================
    # RECENT DATA
    # ======================================================

    def recent_transactions(
        self,
        limit: int = 25,
    ) -> List[BatchTransaction]:
        return sorted(
            self.transactions.values(),
            key=lambda x: x.created_at,
            reverse=True,
        )[:limit]

    def available_credits(
        self,
        limit: int = 30,
    ) -> List[EPRCredit]:
        return [
            c
            for c in self.credits.values()
            if c.status == "Available"
        ][:limit]


db = MockDatabase()