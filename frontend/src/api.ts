const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    }
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      text ||
        `Request failed with status ${response.status}`
    );
  }

  return response.json();
}

/* =====================================================
   HUBS
===================================================== */

export async function getHubs() {
  const data = await request<any>("/api/hubs");

  // Backend may return either:
  // [ ... ]
  // or { hubs: [ ... ] }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.hubs)) {
    return data.hubs;
  }

  return [];
}

/* =====================================================
   RAGPICKERS
===================================================== */

export async function getRagpickers() {
  const data = await request<any>(
    "/api/ragpickers"
  );

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.ragpickers)) {
    return data.ragpickers;
  }

  return [];
}

/* =====================================================
   CORPORATES
===================================================== */

export async function getCorporates() {
  const data = await request<any>(
    "/api/corporates"
  );

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.corporates)) {
    return data.corporates;
  }

  return [];
}

/* =====================================================
   DASHBOARD
===================================================== */

export async function getDashboard() {
  return request<any>("/api/dashboard");
}

/* =====================================================
   CREATE TRANSACTION
===================================================== */

export async function createTransaction(
  payload: {
    hub_id: string;
    ragpicker_id: string;
    category: string;
    weight_kg: number;
    spot_cash_amount: number;
  }
) {
  return request<any>(
    "/api/transactions",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/* =====================================================
   AI BATCH AUDIT
===================================================== */

export async function auditBatch(
  payload: {
    description: string;
    weight_kg: number;
    category?: string;
  }
) {
  return request<any>(
    "/api/audit-batch",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/* =====================================================
   PURCHASE CREDIT
===================================================== */

export async function purchaseCredit(
  corporate_id: string,
  credit_id: string
) {
  return request<any>(
    "/api/credits/purchase",
    {
      method: "POST",
      body: JSON.stringify({
        corporate_id,
        credit_id,
      }),
    }
  );
}

/* =====================================================
   ESG INSIGHT
===================================================== */

export async function generateESGInsight(
  payload: {
    company_name: string;
    industry: string;
    annual_target_tons: number;
    credits_purchased_tons: number;
    available_market_credits_tons: number;
    preferred_regions?: string[];
  }
) {
  return request<any>(
    "/api/esg-insight",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/* =====================================================
   GENERIC API OBJECT
===================================================== */

export const api = {
  getHubs,
  getRagpickers,
  getCorporates,
  getDashboard,
  createTransaction,
  auditBatch,
  purchaseCredit,
  generateESGInsight,
};