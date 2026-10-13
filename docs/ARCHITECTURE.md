# Architecture and minimization plan

## Target shape

```text
Windows Desktop Shell
  ├─ OAuth / account status UI
  ├─ local settings (API key, bind address, startup behavior)
  └─ lifecycle controls
          │
          ▼
Antigravity Runtime
  ├─ OAuth callback + token refresh
  ├─ Antigravity executor and project discovery
  ├─ model aliases / model catalog
  ├─ OpenAI request translation
  ├─ SSE streaming + cancellation
  ├─ tool/function-call translation
  └─ bounded retries + redacted diagnostics
          │
          ▼
Google Antigravity endpoints
```

DSH Desktop and Hermes should connect to the local gateway using an OpenAI-compatible base URL and a user-configured API key. The API key protects the local gateway; it is not the Google OAuth token.

## Pruning rules

Do not remove modules by string search alone. Trace imports and runtime registration from the Antigravity executor, OAuth provider, model catalog, OpenAI-compatible API routes, and desktop launcher. Remove unrelated provider implementations, provider-only settings, UI surfaces, and dependencies only when they are not shared by those paths.

Retain generic pieces required by the target path: HTTP server, authentication, streaming transport, request/response translators, cancellation, error mapping, logging/redaction, settings persistence, and desktop packaging.

## Must-pass tests

- OAuth success, cancellation, callback state validation, token refresh failure, and re-login.
- Non-streaming text request.
- Streaming SSE request, client disconnect, and cancellation.
- Tool/function call request and result mapping.
- Image input and file input, if the upstream Antigravity API and translator support them.
- Unknown model, quota/rate limit, upstream 4xx/5xx, timeout, and malformed response.
- API key enforcement and redaction of credentials in logs.
- DSH Desktop and Hermes configuration using local base URL + API key.
- Windows clean install, launch, restart, uninstall, and persistence behavior.

## Size/performance measurements

Record a baseline before and after pruning under the same Node/Electron versions and build mode:

- Downloaded installer bytes and installed directory size.
- Cold startup to ready state.
- Idle RAM after a fixed warm-up period.
- RAM and CPU during one streaming request.
- Number of runtime provider modules and packaged files.

Do not treat deleting provider UI alone as proof that runtime memory or bundle size decreased.
