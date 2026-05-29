# Security Vulnerability Report - KRR Backend

**Generated:** 2026-05-27  
**Status:** High Risk - Immediate fixes required before production deployment

---

## Executive Summary

The KRR backend contains **10 security vulnerabilities** across authentication, authorization, configuration, and data handling. **3 critical** vulnerabilities could allow unauthorized access to user data and system compromise. **7 high/medium** issues reduce defense-in-depth.

---

## Vulnerability Details

### 🔴 CRITICAL

#### 1. Missing Authorization on User Management Endpoints
- **Location:** `backend/core/routes/auth.py:305, 319`
- **Issue:** DELETE and PUT endpoints for users lack `@jwt_required()` decorator
- **Impact:** Unauthenticated attackers can delete/modify any user account
- **Code:**
  ```python
  @auth_bp.route("/user/<int:user_id>", methods=["DELETE"])
  def delete_user(user_id):  # ❌ Missing @jwt_required()
  
  @auth_bp.route("/user/<int:user_id>", methods=["PUT"])
  def update_user(user_id):  # ❌ Missing @jwt_required()
  ```
- **Fix:** Add `@jwt_required()` and `@role_required(["admin"])` decorators; verify admin can't modify other admins

#### 2. Hardcoded Secret Keys with Weak Defaults
- **Location:** `backend/core/config.py:9, 19`
- **Issue:** `SECRET_KEY` and `JWT_SECRET_KEY` have default values instead of requiring env vars
- **Impact:** If .env file is missing, app uses publicly known keys; JWT tokens can be forged
- **Code:**
  ```python
  SECRET_KEY = os.getenv("SECRET_KEY", "Kigali-Road-Rules")  # ❌ Weak default
  JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "kkr-tokens-key")  # ❌ Weak default
  ```
- **Fix:** Remove defaults; raise error if env vars not set

#### 3. Debug Mode Enabled in Production Code
- **Location:** `backend/app.py:9`
- **Issue:** `app.run(debug=True)` exposes Flask debugger and full stack traces
- **Impact:** Attackers can inspect code, variables, and system state through debugger
- **Code:**
  ```python
  app.run(debug=True)  # ❌ NEVER in production
  ```
- **Fix:** Set debug mode from env var only; default to False

---

### 🟠 HIGH

#### 4. In-Memory Rate Limiting (No Persistence)
- **Location:** `backend/core/utils/decorators.py:96, 124-125`
- **Issue:** Rate limit buckets stored in Python dict; lost on server restart
- **Impact:** Rate limiting provides no protection across restarts; multi-instance deployments bypass limits entirely
- **Code:**
  ```python
  buckets = {}  # ❌ Resets on restart, not shared across instances
  ```
- **Fix:** Use Redis or database-backed rate limiting

#### 5. In-Memory JWT Blacklist (No Persistence)
- **Location:** `backend/core/__init__.py:19`
- **Issue:** Logged-out JWT tokens stored in `set()`; lost on restart
- **Impact:** Users logging out can reuse old tokens after server reboot
- **Code:**
  ```python
  jwt_blacklist = set()  # ❌ No persistence
  ```
- **Fix:** Use Redis or database-backed token blacklist

#### 6. Hardcoded CORS Configuration
- **Location:** `backend/core/__init__.py:13`
- **Issue:** CORS origins hardcoded; doesn't scale to production domains
- **Impact:** Configuration drift; code must be modified for each environment
- **Code:**
  ```python
  CORS(abstract_app, supports_credentials=True, origins=["http://localhost:3000"])
  ```
- **Fix:** Load allowed origins from env var

---

### 🟡 MEDIUM

#### 7. Unvalidated User Input Logged to Database
- **Location:** `backend/core/utils/decorators.py:176`
- **Issue:** Full request JSON (including query params) logged without sanitization
- **Impact:** Malicious JSON payloads stored in analytics; could cause XSS if analytics UI doesn't escape
- **Code:**
  ```python
  "json": request.get_json(silent=True),  # ❌ Raw user input
  ```
- **Fix:** Sanitize/limit logged JSON; never log sensitive fields

#### 8. No Password Complexity Requirements
- **Location:** `backend/core/routes/auth.py:40, 237-238, 362`
- **Issue:** Passwords accepted with no validation (length, complexity, etc.)
- **Impact:** Users can set weak passwords like "a"; weak passwords easily cracked
- **Code:**
  ```python
  password = payload.get("password")  # ❌ No validation
  ```
- **Fix:** Enforce minimum 8 characters, require mixed case/numbers/symbols

#### 9. Information Disclosure in Error Messages
- **Location:** `backend/core/routes/auth.py:370, 383`
- **Issue:** Admin endpoints return specific user IDs in error messages
- **Impact:** Attackers can enumerate valid user IDs
- **Code:**
  ```python
  return jsonify({"status": False, "message": f"User with ID {user_id} not found"}), 404
  ```
- **Fix:** Use generic error: "User not found" (don't echo IDs back)

#### 10. Insufficient CORS Error Handling
- **Location:** `backend/core/__init__.py:13`
- **Issue:** CORS enabled with `supports_credentials=True` but only localhost trusted
- **Impact:** If origins expanded without careful review, could enable CSRF/credential theft
- **Risk:** Configuration debt—likely to be misconfigured in expansion

---

## Risk Prioritization

| Priority | Fixes | Effort |
|----------|-------|--------|
| **Critical (Deploy blocker)** | #1, #2, #3 | ~2 hours |
| **High (Pre-production)** | #4, #5, #6 | ~3 hours (requires Redis or DB setup) |
| **Medium (Best practice)** | #7, #8, #9, #10 | ~1 hour |

---

## Recommended Action Plan

1. **Immediate:** Fix critical vulnerabilities (#1–#3)
2. **Before staging:** Implement persistence for rate limiting & JWT blacklist (#4–#5)
3. **Before production:** Add input validation & error handling (#7–#10)

---

## Testing Recommendations

- [ ] Test unauthorized access to `/user/<id>` DELETE and PUT endpoints
- [ ] Verify debug mode is disabled in non-dev environments
- [ ] Test rate limiting persistence across server restart
- [ ] Verify JWT tokens expire/blacklist on logout
- [ ] Test password validation enforcement
- [ ] Confirm error messages don't leak user IDs
