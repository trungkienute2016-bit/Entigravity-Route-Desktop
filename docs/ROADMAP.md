# Roadmap

## M0 — Establish a safe source baseline
- [ ] Import the reviewed OmniRoute source baseline and preserve upstream notices.
- [ ] Pin the exact source release and dependency lockfile.
- [ ] Confirm Windows and Node/Electron build prerequisites.
- [ ] Record baseline package size, startup time, and idle RAM.

## M1 — Isolate Antigravity
- [ ] Keep Antigravity OAuth, callback/state checks, token refresh, and project discovery.
- [ ] Keep the Antigravity executor, model aliases, streaming helpers, and retry/error behavior.
- [ ] Keep OpenAI-compatible routes and request/response translation.
- [ ] Remove unrelated provider adapters and settings only after dependency analysis.
- [ ] Ensure credentials and local databases are excluded from version control.

## M2 — Desktop and API contract
- [ ] Minimal Windows UI: connect account, status, API key, local endpoint, start/stop.
- [ ] Verify OpenAI-compatible non-streaming and streaming behavior.
- [ ] Verify tool/function calling and cancellation.
- [ ] Verify model listing and errors for unsupported models.
- [ ] Test image/file input where the upstream path supports it.

## M3 — Integration and release
- [ ] Configure and test DSH Desktop.
- [ ] Configure and test Hermes on Windows.
- [ ] Add Windows packaging and clean-install smoke tests.
- [ ] Compare build/installed size and RAM to the baseline.
- [ ] Publish a clear limitation and troubleshooting guide.

## Release gate

No binary should be labelled production-ready until OAuth, non-streaming, SSE streaming, tool calling, API-key enforcement, secret redaction, and clean Windows launch have passed repeatable tests.
