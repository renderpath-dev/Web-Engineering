# Node.js 第 17 章速查表

## Release gate checklist

| 字段 | 要回答的问题 | final-production-release-lab 例子 |
| --- | --- | --- |
| trigger | 谁启动检查 | npm run release:check |
| owner file | 规则归谁维护 | src/release/gate-model.ts |
| command | 怎样复现 | npm run workflow:check |
| artifact | 证据在哪里 | release/release-manifest.generated.json |
| failure mode | 错误怎样识别 | missing required evidence -> hold |

## Local Gates Versus CI Gates

| gate | 能证明 | 不能证明 |
| --- | --- | --- |
| local typecheck/test | 当前机器能执行项目命令 | GitHub runner 已运行 |
| local workflow audit | ci.yml 结构满足本地规则 | GitHub Actions runtime PASS |
| Docker static check | Dockerfile 字段满足策略 | Docker daemon build 成功 |
| Kubernetes static check | manifest 字段满足策略 | cluster admitted and ran Pod |

## GitHub trust boundary

| 层级 | 含义 | 审查重点 |
| --- | --- | --- |
| event | 触发来源 | pull_request vs pull_request_target |
| workflow | YAML 自动化定义 | permissions、jobs |
| job | runner 上的一组 steps | job permissions |
| step | 最小执行单元 | run 或 uses |
| runner | 执行环境 | shell、token、filesystem |
| action | 被 uses 调用的代码 | full SHA pinning |

## Workflow Permissions Checklist

- root permissions 显式声明。
- quality job 默认 contents: read。
- 没有 write-all。
- job-level write permission 必须有发布理由。
- GITHUB_TOKEN 权限变化要进入 review。

## pull_request Versus pull_request_target

| event | 适合场景 | 风险 |
| --- | --- | --- |
| pull_request | 验证 PR 代码 | secret/permission 通常受限 |
| pull_request_target | 处理 base repo metadata | checkout/run head code 会放大风险 |

## Secrets, Variables, Masking

| 类型 | 用途 | 边界 |
| --- | --- | --- |
| variable | 普通环境配置 | 可记录但不应含 credential |
| secret | 认证能力 | 不进 logs、artifacts、build args、examples |
| masking | 日志显示保护 | 不是 secret 流向控制 |

## Action Pinning And Third-Party Actions

- uses 引用是代码执行。
- tag 是 mutable ref。
- full 40-character commit SHA 固定执行对象。
- 注释可以保留 human-readable tag。
- pinning 不等于 action 逻辑已经安全。

## Script Injection Unsafe/Safe Patterns

| pattern | 结果 |
| --- | --- |
| run uses github.event.pull_request.body | untrusted text enters shell |
| run fixed npm script | command is reviewable |
| pass data to a reviewed program | parser owns input boundary |
| direct echo of secret | log leakage risk |

## npm install vs npm ci

| command | 适用阶段 | lockfile 行为 |
| --- | --- | --- |
| npm install | 开发期添加或更新依赖 | 可以更新 package-lock.json |
| npm ci | CI 和 release validation | 按 package-lock.json 重建依赖， mismatch should fail |

## package-lock Review

- package-lock.json 是 dependency tree evidence。
- review transitive dependency changes。
- review integrity、resolved、hasInstallScript。
- 不要把 lockfile diff 当作无意义噪音。

## npm audit And audit-level

- npm audit 是 vulnerability gate signal。
- audit-level 决定退出码阈值。
- high gate 不代表 medium/low 无需理解。
- audit 输出不等于完整 application security proof。

## Why npm audit fix Is Not Automatic

- fix 会改变 dependency graph。
- 新 lockfile 需要 review。
- 新版本可能改变 runtime behavior。
- 修复后必须重新 typecheck、build、test、audit。

## SBOM As Inventory Evidence

- npm sbom --sbom-format=cyclonedx --json 生成 inventory。
- SBOM 回答包含什么。
- SBOM 不修漏洞。
- release manifest 应记录 sbomPath 与 sbomStatus。

## Dependency Review Boundary

- .github/dependency-review-config.yml 是静态配置。
- GitHub dependency review 是否实际运行取决于远程仓库功能和 workflow。
- 本地文件不能声称 GitHub Code Security 已启用。

## Node Permission Model

- Node 默认信任执行代码。
- --permission 在进程启动时建立限制。
- process.permission.has 查询当前权限。
- TypeScript 不授予或拒绝 OS resource permission。
- 这是 defense-in-depth，不是完整 sandbox。

## Express API Security Release Checklist

- Helmet headers enabled。
- CORS origin configured。
- rate limit enabled。
- express.json body limit enabled。
- request id added。
- Zod validates external body。
- error middleware returns public problem details without stack。
- trust proxy boundary is explicit。

## Docker hardening checklist

- multi-stage Dockerfile。
- npm ci in dependency stage。
- build stage emits JavaScript。
- npm prune --omit=dev before runtime。
- runtime USER is non-root。
- .dockerignore excludes node_modules、dist、coverage、.env、.git。
- HEALTHCHECK is present。
- CMD runs dist/src/api/server.js。

## Docker Build Secret Risk Paths

| path | risk |
| --- | --- |
| ARG | may appear in build metadata |
| ENV | may persist in image/runtime environment |
| layer | may preserve file content |
| log | may expose values to CI logs |
| history/provenance | may record build inputs |

## Kubernetes hardening checklist

- runAsNonRoot: true。
- runAsUser/runAsGroup when useful。
- allowPrivilegeEscalation: false。
- readOnlyRootFilesystem: true。
- capabilities.drop includes ALL。
- seccompProfile.type: RuntimeDefault。
- resources.requests and resources.limits。
- livenessProbe and readinessProbe。

## Secret Scanning And Placeholder Policy

- .env is excluded。
- .env.example uses placeholders only。
- k8s/secret.example.yaml uses placeholders only。
- scanner skips node_modules、dist、coverage、package-lock。
- findings return file, line, kind; not raw value。

## Release Manifest Required Fields

- releaseId。
- createdAt。
- sourceRef。
- packageLockHash。
- dockerfileHash。
- workflowHash。
- k8sManifestHash。
- sbomPath or sbomStatus。
- audit/test/build/smoke/security statuses。
- releaseDecision。
- rollbackPlanPath。
- limitations。

## Promote / hold / rollback

| condition | decision | reason |
| --- | --- | --- |
| all required pre-release gates pass | promote | evidence supports release |
| missing required evidence | hold | unknown is unresolved |
| failed pre-release critical gate | hold | do not promote unsafe artifact |
| failed post-release smoke gate | rollback | current artifact may affect users |
| failed post-release critical security gate | rollback | restore known-good artifact |

## Portfolio Proof Claim Boundary

| 可说 | 不可说 |
| --- | --- |
| local production-release readiness lab | real production deployment |
| static GitHub workflow audit | GitHub Actions run passed |
| Docker hardening static check | image pushed and scanned |
| Kubernetes security manifest review | cluster rollout succeeded |
| local API smoke | NGINX production traffic passed |

## Official documentation map

- https://nodejs.org/api/permissions.html
- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- https://docs.github.com/en/actions/reference/security/secure-use
- https://docs.npmjs.com/cli/v11/commands/npm-ci
- https://docs.npmjs.com/cli/v11/commands/npm-audit
- https://docs.npmjs.com/cli/v11/commands/npm-sbom
- https://docs.docker.com/reference/dockerfile/
- https://docs.docker.com/build/building/secrets/
- https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
- https://expressjs.com/en/advanced/best-practice-security/
- https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
