# Rollback Plan

## Trigger

Rollback is required when post-release smoke checks fail, a critical security gate fails after deployment, or runtime evidence shows that the promoted artifact is unsafe.

## Decision Inputs

- Smoke result.
- Health endpoint result.
- SLO continuity signal.
- Security check result.
- Manual release owner decision.

## Local Procedure

1. Stop the current Compose runtime.
2. Restore the previous known-good image or local artifact.
3. Start the previous artifact.
4. Run the smoke check through NGINX on http://localhost:8080.
5. Record the rollback evidence in the release manifest.

## Boundary

This file models rollback evidence. It does not execute a real cloud or cluster rollback.
