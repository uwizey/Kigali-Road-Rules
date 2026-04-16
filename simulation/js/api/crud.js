const backendURL = "http://127.0.0.1:5000";

const TOKEN_KEY = "authToken";
function autoLogout(storage = "localStorage") {
  clearAuthToken(storage); // remove token
  window.location.href = "../auth/login.html"; // redirect to login page
}

export function setAuthToken(token, storage = "localStorage") {
  if (storage === "localStorage") {
    localStorage.setItem(TOKEN_KEY, token);
  } else if (storage === "sessionStorage") {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    // fallback: memory
    window._authToken = token;
  }
}

export function getAuthToken(storage = "localStorage") {
  if (storage === "localStorage") {
    return localStorage.getItem(TOKEN_KEY);
  } else if (storage === "sessionStorage") {
    return sessionStorage.getItem(TOKEN_KEY);
  } else {
    return window._authToken || null;
  }
}

// Clear token
export function clearAuthToken(storage = "localStorage") {
  if (storage === "localStorage") {
    localStorage.removeItem(TOKEN_KEY);
  } else if (storage === "sessionStorage") {
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    window._authToken = null;
  }
}

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  let data;

  try {
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else if (contentType?.includes("text/")) {
      data = await response.text();
    } else {
      data = await response.blob();
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      autoLogout();
    }

    if (response.status === 403) {
      return handleForbidden(data); // Using your existing 403 logic
    }

    // Extract backend message or use status map
    const backendMessage = data?.message || data?.error || null;
    const userMessage =
      backendMessage ||
      STATUS_MESSAGES[response.status] ||
      `Error ${response.status}`;

    return {
      success: false,
      status: response.status,
      userMessage,
      error: data,
    };
  }

  return {
    success: true,
    status: response.status,
    userMessage: data?.message || STATUS_MESSAGES[response.status] || "Success",
    data,
  };
}
// === PostData Function ===
// === Fixed PostData Function in crud.js ===

// ─── Status Code Message Map ────────────────────────────────────────────────
const STATUS_MESSAGES = {
  // 2xx
  200: "Request successful.",
  201: "Resource created successfully.",
  204: "No content returned.",

  // 4xx Client Errors
  400: "The request was invalid. Please check your input and try again.",
  401: "You are not authenticated. Please log in and try again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource could not be found.",
  405: "This action is not allowed.",
  408: "The request timed out. Please try again.",
  409: "A conflict occurred. The resource may already exist.",
  413: "The data you are sending is too large.",
  422: "The submitted data could not be processed. Please review and correct it.",
  429: "Too many requests. Please slow down and try again shortly.",

  // 5xx Server Errors
  500: "A server error occurred. Please try again later.",
  502: "The server received an invalid response. Please try again.",
  503: "The service is temporarily unavailable. Please try again later.",
  504: "The server took too long to respond. Please try again.",
};

// ─── 403 Forbidden Message Map ──────────────────────────────────────────────
const FORBIDDEN_MESSAGES = {
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

// ─── Network / CORS Error Classifier ────────────────────────────────────────
function classifyNetworkError(error) {
  const msg = error.message?.toLowerCase() ?? "";

  if (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed")
  ) {
    return {
      type: "NETWORK_ERROR",
      userMessage:
        "Unable to reach the server. This may be a network issue or a CORS misconfiguration. Please check your connection or contact support.",
    };
  }

  if (msg.includes("cors")) {
    return {
      type: "CORS_ERROR",
      userMessage:
        "A cross-origin request was blocked. Please contact support if this continues.",
    };
  }

  if (msg.includes("timeout") || msg.includes("timed out")) {
    return {
      type: "TIMEOUT_ERROR",
      userMessage:
        "The request timed out. Please check your connection and try again.",
    };
  }

  if (msg.includes("aborted") || msg.includes("abort")) {
    return {
      type: "ABORTED",
      userMessage: "The request was cancelled.",
    };
  }

  return {
    type: "UNKNOWN_ERROR",
    userMessage: "An unexpected error occurred. Please try again.",
  };
}

// ─── 403 Handler ────────────────────────────────────────────────────────────
function handleForbidden(data) {
  // Extract the specific reason from backend (message, error, or detail)
  const backendMessage = data?.message || data?.error || data?.detail || null;

  // Try to find a friendly mapping
  const matched = FORBIDDEN_MESSAGES[backendMessage];

  if (matched) {
    return {
      success: false,
      status: 403,
      type: "FORBIDDEN",
      action: matched.action,
      userMessage: matched.userMessage,
      error: data,
    };
  }

  // Fallback for unknown 403 reasons
  return {
    success: false,
    status: 403,
    type: "FORBIDDEN",
    action: "GENERIC_FORBIDDEN",
    userMessage:
      backendMessage ||
      "You don't have permission to access this resource. Please check your subscription status.",
    error: data,
  };
}

// ─── Main FetchData Function ─────────────────────────────────────────────────
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
    console.log("Raw response:", response);
    // ── Parse response body ──
    const contentType = response.headers.get("content-type");
    let data;
    try {
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else if (contentType?.includes("text/")) {
        data = await response.text();
      } else {
        data = await response.blob();
      }
    } catch {
      data = null; // Body parsing failed — body might be empty (e.g. 204)
    }

    // ── Handle error responses ──
    if (!response.ok) {
      if (response.status === 401) {
        autoLogout(storage);
      }

      if (response.status === 403) {
        return handleForbidden(data); // ← Dedicated 403 logic
      }

      // All other errors — prefer backend message, fall back to map
      const backendMessage =
        typeof data === "object" && data !== null
          ? (data.message ?? data.error ?? null)
          : typeof data === "string"
            ? data
            : null;

      const userMessage =
        backendMessage ||
        STATUS_MESSAGES[response.status] ||
        `Unexpected error (${response.status}).`;

      return {
        success: false,
        status: response.status,
        userMessage,
        error: data,
      };
    }

    // ── Success ──
    const userMessage =
      (typeof data === "object" && data?.message) ||
      STATUS_MESSAGES[response.status] ||
      "Request completed successfully.";

    return {
      success: true,
      status: response.status,
      userMessage,
      data,
    };
  } catch (error) {
    // ── Network / CORS / timeout errors land here ──
    console.error("FetchData error:", error);

    const { type, userMessage } = classifyNetworkError(error);

    return {
      success: false,
      status: null,
      type,
      userMessage,
      error: error.message,
    };
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
    if (!(payload instanceof FormData)) {
      headers.append("Content-Type", "application/json");
    }

    if (requiresAuth) {
      const token = getAuthToken(storage);
      if (token) headers.append("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${backendURL}${endpoint}`, {
      method: "POST",
      headers,
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });

    return await handleResponse(response);
  } catch (error) {
    const { type, userMessage } = classifyNetworkError(error);
    return {
      success: false,
      status: null,
      type,
      userMessage,
      error: error.message,
    };
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
    if (!(payload instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (requiresAuth) {
      const token = getAuthToken(storage);
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${backendURL}${endpoint}`, {
      method: "PUT",
      headers,
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });

    return await handleResponse(response);
  } catch (error) {
    const { type, userMessage } = classifyNetworkError(error);
    return {
      success: false,
      status: null,
      type,
      userMessage,
      error: error.message,
    };
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

    return await handleResponse(response);
  } catch (error) {
    const { type, userMessage } = classifyNetworkError(error);
    return {
      success: false,
      status: null,
      type,
      userMessage,
      error: error.message,
    };
  }
}