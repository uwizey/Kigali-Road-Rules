const backendURL = "http://127.0.0.1:5000";
const TOKEN_KEY = "authToken";

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function autoLogout(storage = "localStorage") {
  clearAuthToken(storage);
  window.location.href = "../auth/login.html";
}

export function setAuthToken(token, storage = "localStorage") {
  if (storage === "localStorage") localStorage.setItem(TOKEN_KEY, token);
  else if (storage === "sessionStorage")
    sessionStorage.setItem(TOKEN_KEY, token);
  else window._authToken = token;
}

export function getAuthToken(storage = "localStorage") {
  if (storage === "localStorage") return localStorage.getItem(TOKEN_KEY);
  else if (storage === "sessionStorage")
    return sessionStorage.getItem(TOKEN_KEY);
  else return window._authToken || null;
}

export function clearAuthToken(storage = "localStorage") {
  if (storage === "localStorage") localStorage.removeItem(TOKEN_KEY);
  else if (storage === "sessionStorage") sessionStorage.removeItem(TOKEN_KEY);
  else window._authToken = null;
}

// ─── Safe user-facing messages (keyed by HTTP status) ────────────────────────
// Nothing from the raw backend response leaks past this map.

const SAFE_MESSAGES = {
  200: "Request successful.",
  201: "Resource created successfully.",
  204: "Action completed.",
  400: "Something looks off with that request. Please check your input.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to do that.",
  404: "The requested resource could not be found.",
  405: "This action is not allowed.",
  408: "The request timed out. Please try again.",
  409: "A conflict occurred. The resource may already exist.",
  413: "The file or data you're sending is too large.",
  422: "Please review your input something couldn't be processed.",
  429: "Too many requests. Please slow down and try again shortly.",
  500: "Something went wrong on our end. Please try again later.",
  502: "We received an unexpected response. Please try again.",
  503: "Service is temporarily unavailable. Please try again shortly.",
  504: "The server took too long to respond. Please try again.",
};

const SAFE_DEFAULT = "An unexpected error occurred. Please try again.";

function safeMessage(status) {
  return SAFE_MESSAGES[status] || SAFE_DEFAULT;
}

// ─── 403 Forbidden — structured action map ────────────────────────────────────
// Keys match the exact `message` string your Flask backend sends for known gates.
// The userMessage here is pre-written copy YOU control — never raw backend text.

const FORBIDDEN_ACTIONS = {
  "Your subscription has expired": {
    userMessage:
      "Your subscription plan expired. Renew now to keep practicing!",
    action: "RENEW_SUBSCRIPTION",
  },
  "No topic quizzes remaining": {
    userMessage:
      "You've reached your limit for topic-specific quizzes. Upgrade to Unlimited for more!",
    action: "UPGRADE_PLAN",
  },
  "Access denied: Email not verified": {
    userMessage: "Please verify your email address to unlock this quiz topic.",
    action: "VERIFY_EMAIL",
  },
};

function handleForbidden(data, rawForLog) {
  // Read the backend reason only to look it up in our safe map — never expose it raw
  const backendReason = data?.message || data?.error || data?.detail || null;
  const matched = backendReason ? FORBIDDEN_ACTIONS[backendReason] : null;

  _devLog("warn", "403 backend reason (dev only):", backendReason, rawForLog);

  if (matched) {
    return {
      success: false,
      status: 403,
      type: "FORBIDDEN",
      action: matched.action,
      userMessage: matched.userMessage, // ← our copy, not the backend string
    };
  }

  return {
    success: false,
    status: 403,
    type: "FORBIDDEN",
    action: "GENERIC_FORBIDDEN",
    userMessage: SAFE_MESSAGES[403], // ← always the safe fallback
  };
}

// ─── Network / CORS error classifier ─────────────────────────────────────────

const NETWORK_SAFE_MESSAGES = {
  NETWORK_ERROR: "Unable to reach the server. Please check your connection.",
  CORS_ERROR:
    "A network issue occurred. Please contact support if this persists.",
  TIMEOUT_ERROR:
    "The request timed out. Please check your connection and try again.",
  ABORTED: "The request was cancelled.",
  UNKNOWN_ERROR: SAFE_DEFAULT,
};

function classifyNetworkError(error) {
  const msg = error.message?.toLowerCase() ?? "";

  let type;
  if (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed")
  )
    type = "NETWORK_ERROR";
  else if (msg.includes("cors")) type = "CORS_ERROR";
  else if (msg.includes("timeout") || msg.includes("timed out"))
    type = "TIMEOUT_ERROR";
  else if (msg.includes("aborted") || msg.includes("abort")) type = "ABORTED";
  else type = "UNKNOWN_ERROR";

  _devLog("error", `Network error [${type}] (dev only):`, error.message);

  return {
    type,
    userMessage: NETWORK_SAFE_MESSAGES[type],
  };
}

// ─── Response parser ──────────────────────────────────────────────────────────
// Parses the raw fetch Response. Raw backend data is kept internal and only
// used for dev logging — it never flows into userMessage.

async function parseResponse(response) {
  const contentType = response.headers.get("content-type");
  let raw = null;

  try {
    if (contentType?.includes("application/json")) raw = await response.json();
    else if (contentType?.includes("text/")) raw = await response.text();
    else raw = await response.blob();
  } catch {
    raw = null;
  }

  return raw;
}

async function buildResult(response, storage) {
  const raw = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      _devLog("warn", "401 — auto-logging out. Raw:", raw);
      autoLogout(storage);
      // Return anyway so callers don't break; the redirect will follow
      return { success: false, status: 401, userMessage: SAFE_MESSAGES[401] };
    }

    if (response.status === 403) {
      return handleForbidden(raw, raw);
    }

    // All other errors — log the raw detail for devs, send safe copy to UI
    _devLog("warn", `HTTP ${response.status} (dev only):`, raw);

    return {
      success: false,
      status: response.status,
      userMessage: safeMessage(response.status),
    };
  }

  // 2xx — data is safe to pass through; message comes from our map
  return {
    success: true,
    status: response.status,
    userMessage:
      SAFE_MESSAGES[response.status] || "Request completed successfully.",
    data: raw,
  };
}

// ─── Dev-only logger (zero output in production) ──────────────────────────────

function _devLog(level, ...args) {
  if (window.__DEV__) console[level]("[crud.js]", ...args);
}

// ─── Public CRUD functions ────────────────────────────────────────────────────

export async function FetchData(
  endpoint,
  requiresAuth = true,
  storage = "localStorage",
) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (requiresAuth) {
      const token = getAuthToken(storage);
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${backendURL}${endpoint}`, {
      method: "GET",
      headers,
    });
    return await buildResult(response, storage);
  } catch (error) {
    const { type, userMessage } = classifyNetworkError(error);
    return { success: false, status: null, type, userMessage };
  }
}

export async function PostData(
  endpoint,
  payload,
  requiresAuth = false,
  storage = "localStorage",
) {
  try {
    const headers = new Headers();
    if (!(payload instanceof FormData))
      headers.append("Content-Type", "application/json");
    if (requiresAuth) {
      const token = getAuthToken(storage);
      if (token) headers.append("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${backendURL}${endpoint}`, {
      method: "POST",
      headers,
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    return await buildResult(response, storage);
  } catch (error) {
    const { type, userMessage } = classifyNetworkError(error);
    return { success: false, status: null, type, userMessage };
  }
}

export async function UpdateData(
  endpoint,
  payload,
  requiresAuth = true,
  storage = "localStorage",
) {
  try {
    const headers = {};
    if (!(payload instanceof FormData))
      headers["Content-Type"] = "application/json";
    if (requiresAuth) {
      const token = getAuthToken(storage);
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${backendURL}${endpoint}`, {
      method: "PUT",
      headers,
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    return await buildResult(response, storage);
  } catch (error) {
    const { type, userMessage } = classifyNetworkError(error);
    return { success: false, status: null, type, userMessage };
  }
}

export async function DeleteData(
  endpoint,
  payload,
  requiresAuth = true,
  storage = "localStorage",
) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (requiresAuth) {
      const token = getAuthToken(storage);
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${backendURL}${endpoint}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify(payload),
    });
    return await buildResult(response, storage);
  } catch (error) {
    const { type, userMessage } = classifyNetworkError(error);
    return { success: false, status: null, type, userMessage };
  }
}
