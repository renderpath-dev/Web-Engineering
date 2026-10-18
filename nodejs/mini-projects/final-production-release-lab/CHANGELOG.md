# Changelog

## 1.0.0

### Added

- Local release gate model with promote, hold, and rollback decisions.
- Express API with release and security endpoints.
- Static GitHub Actions workflow and dependency review configuration for local audit.
- npm dependency, secret, workflow, Docker, Kubernetes, release, permission, portfolio, SBOM, and smoke validation scripts.
- Docker Compose path with NGINX on host port 8080.
- Kubernetes securityContext learning manifests.

### Security

- Added Helmet, configured CORS, rate limit, request ID, body limit, and safe error responses.
- Added local secret pattern checks and placeholder-only secret examples.
- Added non-root Docker runtime and Kubernetes hardening checks.

### Limitations

- This release is local-only evidence. It is not a real cloud or cluster deployment.
