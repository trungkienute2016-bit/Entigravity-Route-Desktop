# Antigravity Route Desktop

A Windows-focused, Google Antigravity-only API gateway derived from the MIT-licensed [OmniRoute](https://github.com/diegosouzapw/OmniRoute) project.

> **Status: initial scaffold only.** This repository does not yet contain a working desktop build or a verified Antigravity runtime. OAuth, streaming, tool calling, image/file handling, and DSH Desktop/Hermes compatibility must be implemented or ported and tested before a release is claimed.

## Goal

Keep the proven Antigravity integration from OmniRoute while removing unrelated providers and optional features. The target is a smaller and easier-to-maintain Windows app, not a promise of a specific EXE/RAM reduction before benchmarking.

## Intended first release

- Google Antigravity OAuth and token refresh, using the supported upstream flow.
- Local OpenAI-compatible API endpoint with configurable API key.
- Streaming responses and tool/function calling.
- Model discovery/aliases for Antigravity models.
- Basic account status, errors, quota/rate-limit feedback, and local logs with secrets redacted.
- Windows desktop packaging.
- Tested setup steps for DSH Desktop and Hermes.

Image/file support is a release gate: it must be tested end-to-end and must not be described as supported until verified.

## Upstream

Initial source review is based on OmniRoute `release/v3.8.51`. Relevant entry points include:

- [Antigravity executor](https://github.com/diegosouzapw/OmniRoute/blob/release/v3.8.51/open-sse/executors/antigravity.ts)
- [Antigravity OAuth provider](https://github.com/diegosouzapw/OmniRoute/blob/release/v3.8.51/src/lib/oauth/providers/antigravity.ts)
- [Antigravity onboarding guide](https://github.com/diegosouzapw/OmniRoute/blob/release/v3.8.51/docs/guides/ANTIGRAVITY-ONBOARDING.md)

This is not an official Google product. Antigravity access, model availability, quotas, and OAuth behavior are governed by Google and can change independently of this project.

## Development principles

1. Preserve applicable upstream copyright and MIT license notices.
2. Keep upstream changes isolated and documented; do not blindly delete files based only on provider names.
3. Remove a module only after checking the dependency/import graph and tests.
4. Never commit OAuth tokens, API keys, user data, or local credential stores.
5. Benchmark installer size, installed size, startup time, and idle RAM against the same upstream build before claiming improvements.
6. Verify upstream terms and account rules before distributing binaries or automating account use.

## Current next steps

- Map Antigravity OAuth, token refresh, executor, model aliases, OpenAI request translation, streaming, and desktop packaging dependencies.
- Separate the minimum Antigravity runtime from provider-specific UI and adapters.
- Add unit/contract tests for OAuth callbacks, non-streaming, SSE streaming, tool calls, errors, and cancellation.
- Build and smoke-test on Windows, then validate configuration in DSH Desktop and Hermes.

## License

This project is intended to retain the upstream MIT license. See [LICENSE](LICENSE) and the upstream repository for copyright notices that must remain with reused code.