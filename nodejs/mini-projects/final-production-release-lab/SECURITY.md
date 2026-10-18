# Security Policy

This project is a local learning lab. It does not accept real production secrets, credentials, customer data, or payment data.

## Reporting

Report security issues through the learning repository review process. Do not include real secrets in reports, logs, screenshots, or generated artifacts.

## Supported Scope

- Local dependency checks.
- Static workflow checks.
- Static Docker hardening checks.
- Static Kubernetes security checks.
- Secret pattern checks for committed files.
- API security middleware checks.

## Out Of Scope

- Cloud IAM.
- Real OIDC trust.
- Registry signing.
- Real Kubernetes admission control.
- Full SAST or DAST coverage.
- SaaS incident response integration.

## Secret Handling

Use .env.example for placeholders only. Do not commit .env files. Kubernetes Secret examples must contain placeholder values only.
