# Portfolio Evidence

## Claim Boundary

This project can be described as a local production-release readiness lab. It should not be described as a real production deployment.

## Evidence Map

| Claim | Evidence | Verification |
| --- | --- | --- |
| Reproducible dependency install | package-lock.json and npm ci | npm run dependency:check |
| CI/CD workflow security awareness | .github/workflows/ci.yml | npm run workflow:check |
| Secret handling discipline | .env.example and k8s/secret.example.yaml | npm run secret:check |
| API security release review | src/api and src/modules/security | npm test |
| Docker hardening | Dockerfile and .dockerignore | npm run docker:check |
| Kubernetes hardening | k8s/deployment.yaml | npm run k8s:security:check |
| Release decision model | src/release/gate-model.ts | npm run release:check |
| Portfolio claim discipline | release/portfolio-evidence.md | npm run portfolio:check |
