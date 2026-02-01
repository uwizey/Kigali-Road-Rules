const backendURL = "http://127.0.0.1:5000";

const TOKEN_KEY = "authToken";

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

// === PostData Function ===
export async function PostData(
  endpoint,
  payload,
  requiresAuth = false,
  storage = "localStorage",
) {
    try {
      const headers = {};
    if (!(payload instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (requiresAuth) {
      const token = getAuthToken(storage);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${backendURL}${endpoint}`, {
      method: "POST",
      headers,
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else if (contentType?.includes("text/")) {
      data = await response.text();
    } else {
      data = await response.blob();
    }

    if (!response.ok) {
      // Return error in a structured way
      return { status: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error:", error);
    return { status: false, error: error.message };
  }
}

export async function FetchData(endpoint,requiresAuth = true,storage = "localStorage") {
  try {
    const headers = { "Content-Type": "application/json" };
    if (requiresAuth) {
        const token = getAuthToken(storage);

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      }

    const response = await fetch(`${backendURL}${endpoint}`, {
      method: "GET",
      headers,
    });
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else if (contentType?.includes("text/")) {
      data = await response.text();
    } else {
      data = await response.blob();
    }
    if (!response.ok) {
      return { success: false, status: response.status, error: data };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
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
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${backendURL}${endpoint}`, {
      method: "PUT",
      headers,
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else if (contentType?.includes("text/")) {
      data = await response.text();
    } else {
      data = await response.blob();
    }

    if (!response.ok) {
      return { success: false, status: response.status, error: data };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
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
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${backendURL}${endpoint}`, {
      method: "DELETE",
        headers,
      body:JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else if (contentType?.includes("text/")) {
      data = await response.text();
    } else {
      data = await response.blob();
    }

    if (!response.ok) {
      return { success: false, status: response.status, error: data };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
}

