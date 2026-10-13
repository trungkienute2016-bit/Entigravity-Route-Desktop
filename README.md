# Entigravity Route Desktop

A Windows-focused, Google Antigravity-only local API gateway based on the MIT-licensed [OmniRoute](https://github.com/diegosouzapw/OmniRoute) project.

> **Build status:** the repository contains the build profile and an automated Windows build workflow. Do not treat a release as usable until the workflow succeeds and OAuth, streaming, tool calling, and client compatibility are verified.

## Goal

Keep the working Antigravity and Antigravity CLI (`agy`) integration, while narrowing provider registries to those two surfaces. The goal is a smaller and easier-to-maintain Windows app; actual installer size and RAM reductions must be measured rather than assumed.

## Windows build

1. Open [Actions → Build Windows Antigravity-only app](https://github.com/trungkienute2016-bit/Entigravity-Route-Desktop/actions/workflows/build-windows.yml).
2. Choose **Run workflow** or wait for a push to `main` that touches build/docs files.
3. Open the completed run and download artifact `Entigravity-Route-Desktop-Windows`.

The workflow checks out OmniRoute at the pinned commit `7f3cbb046b3706bf0bbc047b7eaa0cbada8d9e50`, applies `scripts/prune-antigravity.mjs`, installs dependencies, and attempts a Windows Electron build. If upstream layout changes, the patcher is designed to fail rather than guess.

## Intended integration

The app is intended to expose an OpenAI-compatible local endpoint so DSH Desktop and Hermes on Windows can connect with a Base URL and a locally configured API key. That API key is separate from the Google OAuth credential.

The release must pass these checks before it is described as ready:

- Google OAuth callback, token refresh, re-login, and error handling.
- Non-streaming and SSE streaming chat requests.
- Tool/function calls and results.
- Correct model listing and quota/rate-limit errors.
- API-key enforcement and secret redaction in logs.
- Image/file input where the upstream API path supports it.
- Clean Windows launch and persistence.
- DSH Desktop and Hermes connection tests.

## Source references

- [Antigravity executor](https://github.com/diegosouzapw/OmniRoute/blob/7f3cbb046b3706bf0bbc047b7eaa0cbada8d9e50/open-sse/executors/antigravity.ts)
- [Antigravity OAuth provider](https://github.com/diegosouzapw/OmniRoute/blob/7f3cbb046b3706bf0bbc047b7eaa0cbada8d9e50/src/lib/oauth/providers/antigravity.ts)
- [Antigravity onboarding notes](https://github.com/diegosouzapw/OmniRoute/blob/7f3cbb046b3706bf0bbc047b7eaa0cbada8d9e50/docs/guides/ANTIGRAVITY-ONBOARDING.md)

## Security and scope

- This is an independent project and is not an official Google product.
- It does not add anti-detection or identity-spoofing behavior. Provider pruning is for scope and maintainability, not a guarantee against upstream enforcement.
- Keep OAuth tokens, API keys, user data, and local databases out of source control.
- Preserve applicable upstream copyright/license notices in redistributed source and binaries.
- Google Antigravity availability, model access, quotas, OAuth behavior, and applicable terms can change independently of this project.

## License

See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
