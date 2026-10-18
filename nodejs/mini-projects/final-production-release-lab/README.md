# final-production-release-lab

This mini project demonstrates a local Node.js production release boundary. It turns release work into evidence: dependency installation, type checking, build output, tests, static workflow checks, secret checks, Docker hardening checks, Kubernetes security checks, SBOM generation, a release manifest, a rollback plan, and a smoke test through NGINX.

This is not a real cloud deployment. It does not push an image, deploy to a managed Kubernetes cluster, configure branch protection, enable GitHub Code Security, or create real secrets. The workflow and manifests are static learning artifacts that can be audited locally.

## Windows PowerShell

Install dependencies:

    npm install

Run local checks:

    npm run typecheck
    npm run build
    npm test -- --test-concurrency=1
    npm run workflow:check
    npm run dependency:check
    npm run secret:check
    npm run docker:check
    npm run k8s:security:check
    npm run release:check
    npm run permission:check
    npm run portfolio:check
    npm run sbom:generate
    npm run release:manifest

Run through Docker Compose:

    docker compose config
    docker compose build --no-cache --progress=plain api
    docker compose up -d api nginx
    npm run smoke
    docker compose down

## macOS and Linux

The same commands are used:

    npm install
    npm run typecheck
    npm run build
    npm test -- --test-concurrency=1
    npm run workflow:check
    npm run dependency:check
    npm run secret:check
    npm run docker:check
    npm run k8s:security:check
    npm run release:check
    npm run permission:check
    npm run portfolio:check
    npm run sbom:generate
    npm run release:manifest
    docker compose config
    docker compose build --no-cache --progress=plain api
    docker compose up -d api nginx
    npm run smoke
    docker compose down

## Release Pipeline Model

Development can use npm install because developers intentionally change dependencies. CI should use npm ci because it installs exactly from package-lock.json and fails when the lockfile does not match package.json.

The release decision is based on evidence, not confidence. Missing evidence is UNKNOWN and keeps the release on hold. A failed critical security gate or failed post-release smoke gate can require rollback.

## Security Model

The API uses Helmet, configured CORS, a rate limit, a JSON body limit, request IDs, runtime validation, and safe public error responses. Stack traces are not returned by public responses.

The secret scanner checks committed project files for obvious token-like values and rejects committed .env files. The scanner never prints matching values.

The Node Permission Model demo shows that Node normally trusts code it runs. Permission flags can restrict selected runtime resources, but they are defense-in-depth and not a complete sandbox.

## Docker And Kubernetes

The Dockerfile uses multi-stage builds, npm ci, built JavaScript at runtime, a non-root user, .dockerignore boundaries, and HEALTHCHECK. Build arguments and environment variables are not used for secrets.

The Kubernetes manifests are static learning artifacts. The Deployment uses non-root execution, dropped capabilities, a read-only root filesystem, RuntimeDefault seccomp, probes, and resource requests and limits.

## Portfolio Evidence

Use the README, release manifest, rollback plan, tests, scripts, Dockerfile, Compose file, Kubernetes manifests, and API endpoints as portfolio evidence. Do not claim real production deployment unless a real deployment URL, image digest, cluster command, and monitoring evidence exist.

## Known Limitations

No real GitHub workflow run is performed locally. No GitHub Code Security feature is enabled by these files. No image is pushed to a registry. No cloud environment, OIDC trust, Vault, Helm, Terraform, service mesh, SAST platform, DAST platform, or incident tool integration is included.
