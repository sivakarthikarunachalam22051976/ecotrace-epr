import {
  useEffect,
  useState,
} from "react";

import {
  getHubs,
  getRagpickers,
  createTransaction,
  auditBatch,
} from "../api";

import type {
  BatchAuditResult,
  Ragpicker,
  ScrapHub,
} from "../types";

export default function HubPortal() {
  const [hubs, setHubs] =
    useState<ScrapHub[]>([]);

  const [ragpickers, setRagpickers] =
    useState<Ragpicker[]>([]);

  const [hubId, setHubId] =
    useState("");

  const [ragpickerId, setRagpickerId] =
    useState("");

  const [category, setCategory] =
    useState("Category 1 - Rigid");

  const [weight, setWeight] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<BatchAuditResult | null>(null);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      /*
       * Load both ecosystem datasets.
       */
      const [hubData, ragpickerData] =
        await Promise.all([
          getHubs(),
          getRagpickers(),
        ]);

      /*
       * APIs sometimes return:
       *
       * []
       *
       * or:
       *
       * { hubs: [] }
       *
       * Handle both safely.
       */

      const safeHubs: ScrapHub[] =
        Array.isArray(hubData)
          ? hubData
          : Array.isArray(
              (hubData as any)?.hubs
            )
          ? (hubData as any).hubs
          : [];

      const safeRagpickers: Ragpicker[] =
        Array.isArray(ragpickerData)
          ? ragpickerData
          : Array.isArray(
              (ragpickerData as any)?.ragpickers
            )
          ? (ragpickerData as any).ragpickers
          : [];

      setHubs(safeHubs);
      setRagpickers(safeRagpickers);

      /*
       * Automatically select the first
       * available hub.
       */

      if (safeHubs.length > 0) {
        setHubId(safeHubs[0].id);
      }

      /*
       * Automatically select the first
       * available ragpicker.
       */

      if (safeRagpickers.length > 0) {
        setRagpickerId(
          safeRagpickers[0].id
        );
      }
    } catch (error) {
      console.error(
        "Failed to load ecosystem data:",
        error
      );

      setMessage(
        "Unable to load ecosystem data."
      );
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setResult(null);
    setMessage("");

    /*
     * Basic validation.
     */

    if (
      !hubId ||
      !ragpickerId ||
      !weight
    ) {
      setMessage(
        "Please complete all required fields."
      );

      return;
    }

    const weightKg =
      Number(weight);

    if (
      !Number.isFinite(weightKg) ||
      weightKg <= 0
    ) {
      setMessage(
        "Please enter a valid weight."
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * STEP 1
       * Create collection transaction.
       */

      await createTransaction({
        hub_id: hubId,
        ragpicker_id: ragpickerId,
        category,
        weight_kg: weightKg,
        spot_cash_amount:
          weightKg * 25,
      });

      /*
       * STEP 2
       * Run AI batch audit.
       */

      const audit =
        await auditBatch({
          description:
            description.trim() ||
            `${category} plastic waste batch`,
          weight_kg: weightKg,
          category,
        });

      /*
       * STEP 3
       * Display AI result.
       */

      setResult(audit);

      setMessage(
        "Batch logged and AI audit completed successfully."
      );

      /*
       * Clear form after successful
       * submission.
       */

      setWeight("");
      setDescription("");
    } catch (error) {
      console.error(
        "Transaction/audit error:",
        error
      );

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Transaction could not be processed."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <p className="text-sm font-medium text-emerald-400">
          COLLECTION HUB PORTAL
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Smart Plastic Ledger
        </h1>

        <p className="mt-2 text-slate-400">
          Record collection transactions
          and verify batches instantly
          using AI.
        </p>
      </div>

      {/* MAIN GRID */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* TRANSACTION FORM */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >

          <h2 className="text-xl font-semibold">
            Log New Plastic Batch
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Record a collection before running
            the automated integrity audit.
          </p>

          <div className="mt-5 space-y-4">

            {/* HUB */}

            <select
              value={hubId}
              onChange={(event) =>
                setHubId(
                  event.target.value
                )
              }
              className="w-full rounded-lg bg-slate-800 p-3 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {hubs.length === 0 && (
                <option value="">
                  Loading collection hubs...
                </option>
              )}

              {hubs.map((hub) => (
                <option
                  key={hub.id}
                  value={hub.id}
                >
                  {hub.name} — {hub.city}
                </option>
              ))}
            </select>

            {/* RAGPICKER */}

            <select
              value={ragpickerId}
              onChange={(event) =>
                setRagpickerId(
                  event.target.value
                )
              }
              className="w-full rounded-lg bg-slate-800 p-3 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {ragpickers.length === 0 && (
                <option value="">
                  Loading ragpickers...
                </option>
              )}

              {ragpickers.map(
                (ragpicker) => (
                  <option
                    key={ragpicker.id}
                    value={ragpicker.id}
                  >
                    {ragpicker.name}
                  </option>
                )
              )}
            </select>

            {/* CATEGORY */}

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              className="w-full rounded-lg bg-slate-800 p-3 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>
                Category 1 - Rigid
              </option>

              <option>
                Category 2 - Flexible
              </option>

              <option>
                Category 3 - Multi-Layered
              </option>
            </select>

            {/* WEIGHT */}

            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Weight in kilograms"
              value={weight}
              onChange={(event) =>
                setWeight(
                  event.target.value
                )
              }
              className="w-full rounded-lg bg-slate-800 p-3 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* DESCRIPTION */}

            <textarea
              placeholder="Describe the batch for AI audit..."
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              className="min-h-28 w-full rounded-lg bg-slate-800 p-3 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={
                loading ||
                hubs.length === 0 ||
                ragpickers.length === 0
              }
              className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Running AI Audit..."
                : "Log & Run AI Smart Audit"}
            </button>

          </div>
        </form>

        {/* AI REPORT */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-semibold">
            AI Batch Integrity Report
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Gemini-powered classification and
            integrity assessment.
          </p>

          {/* EMPTY STATE */}

          {!result && (
            <div className="mt-10 rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
              Submit a batch to generate
              an AI integrity report.
            </div>
          )}

          {/* RESULT */}

          {result && (
            <div className="mt-6 space-y-4">

              {/* METRICS */}

              <div className="grid grid-cols-2 gap-3">

                <Metric
                  label="Integrity Score"
                  value={`${result.integrity_score}%`}
                />

                <Metric
                  label="Contamination"
                  value={`${result.contamination_percentage}%`}
                />

                <Metric
                  label="Confidence"
                  value={`${result.confidence_score}%`}
                />

                <Metric
                  label="Decision"
                  value={
                    result.recommended_action
                  }
                />

              </div>

              {/* CLASSIFICATION */}

              <div className="rounded-xl bg-slate-800 p-4">

                <p className="text-sm text-slate-400">
                  AI Classification
                </p>

                <p className="mt-1 font-semibold text-emerald-400">
                  {result.plastic_category}
                </p>

              </div>

              {/* AUTHENTICITY */}

              <div className="rounded-xl bg-slate-800 p-4">

                <p className="text-sm text-slate-400">
                  Authenticity
                </p>

                <p className="mt-1 font-semibold">
                  {result.authenticity}
                </p>

              </div>

              {/* REASONING */}

              <div className="rounded-xl bg-slate-800 p-4">

                <p className="text-sm text-slate-400">
                  AI Reasoning
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {result.reasoning}
                </p>

              </div>

            </div>
          )}

          {/* MESSAGE */}

          {message && (
            <p className="mt-4 text-sm text-emerald-400">
              {message}
            </p>
          )}

        </div>

      </div>
    </div>
  );
}

/* METRIC COMPONENT */

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-4">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold">
        {value}
      </p>

    </div>
  );
}