# Node.js 第 17 章面试题

## 1. release pipeline as evidence

**问题**

请解释 release pipeline as evidence 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

release pipeline 应该解释输入、owner file、command、artifact、gate 和 failure semantics。final-production-release-lab 的 owner 是 src/release/gate-model.ts，命令是 npm run release:check。对比普通命令列表，它不会因为 build/test 两个命令成功就忽略 audit、secret scan 或 workflow security。常见错误是只保存成功日志，不记录失败后 hold 还是 rollback。

**追问方向**

继续追问时，围绕 release pipeline as evidence 指向具体 owner file、command 或 artifact。

## 2. local gates versus CI gates

**问题**

请解释 local gates versus CI gates 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

local gate 证明当前 Windows workspace 可以运行命令；CI gate 证明 GitHub runner 能从仓库状态重建同一结果。npm run workflow:check 只能证明 .github/workflows/ci.yml 通过本地静态检查，不能声明 GitHub Actions runtime 已通过。面试时要明确执行环境、runner、token 和 artifact 都不同。

**追问方向**

继续追问时，围绕 local gates versus CI gates 指向具体 owner file、command 或 artifact。

## 3. GitHub Actions event/workflow/job/step/runner/action

**问题**

请解释 GitHub Actions event/workflow/job/step/runner/action 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

event 决定触发来源，workflow 是 YAML 定义，job 被调度到 runner，step 执行 run shell 或 uses action。owner file 是 .github/workflows/ci.yml，静态审查命令是 npm run workflow:check。信任从 event payload 进入 runner shell 的路径，就是 script injection 和 token risk 的分析路径。

**追问方向**

继续追问时，围绕 GitHub Actions event/workflow/job/step/runner/action 指向具体 owner file、command 或 artifact。

## 4. GITHUB_TOKEN permissions

**问题**

请解释 GITHUB_TOKEN permissions 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

GITHUB_TOKEN 是 GitHub 自动给 workflow 的认证能力，permissions 字段决定它能做什么。final-production-release-lab 只做质量检查，所以 root 和 job 都使用 contents: read。错误答案是说 token 默认无害；正确答案要说明权限越大，run step 或 action 被滥用时后果越大。

**追问方向**

继续追问时，围绕 GITHUB_TOKEN permissions 指向具体 owner file、command 或 artifact。

## 5. workflow least privilege

**问题**

请解释 workflow least privilege 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

least privilege 是先给 workflow 最小默认权限，再在确有发布动作的 job 中局部扩大。src/security/workflow-policy.ts 拒绝 write-all 和任意 write permission。对比真实 deploy job，quality job 不需要 packages: write、deployments: write 或 contents: write。

**追问方向**

继续追问时，围绕 workflow least privilege 指向具体 owner file、command 或 artifact。

## 6. pull_request versus pull_request_target

**问题**

请解释 pull_request versus pull_request_target 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

pull_request_target 的风险来自 base repository context，不是名字本身。若在该上下文 checkout 并运行 fork 的 head code，就可能把不可信代码放到更高权限 runner 中。final ci.yml 不使用 pull_request_target，workflow-policy.ts 会把它当成结构错误。

**追问方向**

继续追问时，围绕 pull_request versus pull_request_target 指向具体 owner file、command 或 artifact。

## 7. secrets and variables

**问题**

请解释 secrets and variables 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

variables 适合普通配置，secrets 代表认证能力。GitHub secrets 应只在最窄 step 中使用，不能进入 logs、artifacts、Docker build args 或 example manifests。本项目通过 .env.example、k8s/secret.example.yaml 和 npm run secret:check 展示 placeholder-only 边界。

**追问方向**

继续追问时，围绕 secrets and variables 指向具体 owner file、command 或 artifact。

## 8. secret masking limits

**问题**

请解释 secret masking limits 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

masking 是日志显示层保护，不是 secret 流向控制。secret 如果被写入 release artifact、image layer 或 API response，masking 不能撤回泄漏。security.integration.test.ts 验证 scan-secret endpoint 只返回 finding metadata，不回显 token。

**追问方向**

继续追问时，围绕 secret masking limits 指向具体 owner file、command 或 artifact。

## 9. action pinning

**问题**

请解释 action pinning 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

uses 引用会执行 action 代码。mutable tag 如 v4 可能移动，full 40-character commit SHA 固定执行对象。ci.yml 中 actions/checkout 使用 11bd71901bbe5b1630ceea73d27597364c9af683，workflow-policy.ts 用正则验证每个 uses。

**追问方向**

继续追问时，围绕 action pinning 指向具体 owner file、command 或 artifact。

## 10. third-party action risk

**问题**

请解释 third-party action risk 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

third-party action risk 是供应链代码执行风险：workflow 引用的 action 可以读 workspace、使用 token、影响后续 steps。pinning 只能固定版本，不证明逻辑无漏洞。面试中要同时提 allowlist、review、periodic update 和 least privilege。

**追问方向**

继续追问时，围绕 third-party action risk 指向具体 owner file、command 或 artifact。

## 11. script injection

**问题**

请解释 script injection 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

run step 是 shell。PR title、body、github.head_ref、issue body 或 comment body 如果直接进入 run，就可能改变命令。src/security/workflow-policy.ts 扫描这些 context fragments。安全模式是运行固定 npm scripts，或让受审查程序解析输入。

**追问方向**

继续追问时，围绕 script injection 指向具体 owner file、command 或 artifact。

## 12. npm install versus npm ci

**问题**

请解释 npm install versus npm ci 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

npm install 适合开发期添加或更新依赖，可能改 package-lock.json；npm ci 适合 CI，从 lockfile 重建 node_modules，并在 package.json 与 lockfile 不匹配时失败。Dockerfile 和 README 都使用 npm ci 作为自动化边界。

**追问方向**

继续追问时，围绕 npm install versus npm ci 指向具体 owner file、command 或 artifact。

## 13. package-lock

**问题**

请解释 package-lock 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

package-lock.json 是 dependency tree evidence，记录解析结果、integrity、transitive dependencies 和 install script metadata。src/security/dependency-policy.ts 要求 lockfile 存在。常见错误是把 lockfile diff 当噪音，而不是供应链 review 对象。

**追问方向**

继续追问时，围绕 package-lock 指向具体 owner file、command 或 artifact。

## 14. no latest dependencies

**问题**

请解释 no latest dependencies 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

latest 是可变标签，不是可复现版本。package.json 和 package-lock.json 中出现 latest 会让下一次 install 得到不同依赖树。dependency-policy.ts 递归扫描 dependencies、devDependencies 和 lockfile，发现 latest 就失败。

**追问方向**

继续追问时，围绕 no latest dependencies 指向具体 owner file、command 或 artifact。

## 15. npm audit

**问题**

请解释 npm audit 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

npm audit 根据 dependency tree 和 registry advisory data 生成 vulnerability gate signal。它能告诉你是否命中已知漏洞阈值，但不能证明业务授权、secret handling 或 runtime hardening。发布时应把它作为一个 gate，而不是全部安全结论。

**追问方向**

继续追问时，围绕 npm audit 指向具体 owner file、command 或 artifact。

## 16. audit-level

**问题**

请解释 audit-level 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

audit-level 决定 npm audit 的阻断阈值。本章使用 npm audit --audit-level=high，把 high 及以上作为发布门禁。它不是说 medium/low 不重要，而是把自动阻断和人工风险评估分层处理。

**追问方向**

继续追问时，围绕 audit-level 指向具体 owner file、command 或 artifact。

## 17. npm audit fix risk

**问题**

请解释 npm audit fix risk 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

npm audit fix 会改变依赖图，通常会更新 package-lock.json。它是 remediation action，不是 diagnostic command。正确流程是先看 audit report，再 review change，再重新 typecheck、build、test、audit。

**追问方向**

继续追问时，围绕 npm audit fix risk 指向具体 owner file、command 或 artifact。

## 18. npm sbom

**问题**

请解释 npm sbom 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

npm sbom --sbom-format=cyclonedx --json 生成 SBOM inventory。scripts/generate-sbom.ts 写 release/sbom.cdx.json。SBOM 说明包含哪些 components，不说明漏洞已修复；缺少 SBOM 时 release manifest 应保持保守状态。

**追问方向**

继续追问时，围绕 npm sbom 指向具体 owner file、command 或 artifact。

## 19. package provenance and signatures

**问题**

请解释 package provenance and signatures 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

provenance 和 signatures 是来源与完整性证据，回答 package 从哪里构建、是否被篡改这类问题。它们不能替代 npm audit、lockfile review 或 runtime tests。本章把它们作为 future/ evidence boundary，不实现真实 publish。

**追问方向**

继续追问时，围绕 package provenance and signatures 指向具体 owner file、command 或 artifact。

## 20. dependency review

**问题**

请解释 dependency review 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

.github/dependency-review-config.yml 是静态配置，GitHub dependency review 是否执行取决于远程仓库功能和 workflow。面试中要说清本地文件不是 GitHub Code Security 已启用的证明。

**追问方向**

继续追问时，围绕 dependency review 指向具体 owner file、command 或 artifact。

## 21. Node Permission Model

**问题**

请解释 Node Permission Model 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

Node 默认信任运行的代码；--permission 在进程启动时限制部分资源；process.permission.has 查询当前权限。src/security/node-permission-demo.ts 展示查询边界。TypeScript 不授予 OS 权限，Permission Model 也不是完整 sandbox。

**追问方向**

继续追问时，围绕 Node Permission Model 指向具体 owner file、command 或 artifact。

## 22. Express security headers

**问题**

请解释 Express security headers 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

Helmet 通过 middleware 设置安全相关 HTTP headers。src/api/app.ts 在 routes 前注册 helmet。正确答案要说明 headers 是浏览器/客户端交互边界，不等于认证、授权或输入验证。

**追问方向**

继续追问时，围绕 Express security headers 指向具体 owner file、command 或 artifact。

## 23. CORS and rate limit

**问题**

请解释 CORS and rate limit 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

CORS 控制哪些 origin 可从浏览器读取响应，rate limit 限制请求频率。src/api/app.ts 使用 cors 和 express-rate-limit。常见错误是把 CORS 当认证，或者在 trust proxy 未确认时让 rate limit 依赖错误客户端 IP。

**追问方向**

继续追问时，围绕 CORS and rate limit 指向具体 owner file、command 或 artifact。

## 24. Docker non-root runtime

**问题**

请解释 Docker non-root runtime 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

Dockerfile 的 USER appuser 让 Node 进程不以 root 默认运行。它降低容器内权限，但不能单独证明安全；还要看 base image、copied files、capabilities、read-only filesystem 和 orchestrator policy。

**追问方向**

继续追问时，围绕 Docker non-root runtime 指向具体 owner file、command 或 artifact。

## 25. .dockerignore

**问题**

请解释 .dockerignore 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

.dockerignore 控制 build context，决定哪些本地文件发送给 builder。final project 排除 node_modules、dist、coverage、.env、.git。常见错误是只依赖 Dockerfile 不 COPY .env，却忘了 build context 已经包含它。

**追问方向**

继续追问时，围绕 .dockerignore 指向具体 owner file、command 或 artifact。

## 26. Docker build secrets

**问题**

请解释 Docker build secrets 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

Docker build args 和 ENV 可能进入 metadata、history、logs 或 image environment。Docker build secrets 是单独机制，适合构建时短暂提供敏感值。本项目 Dockerfile 不使用 secret ARG/ENV，npm run docker:check 会拒绝这些模式。

**追问方向**

继续追问时，围绕 Docker build secrets 指向具体 owner file、command 或 artifact。

## 27. Kubernetes securityContext

**问题**

请解释 Kubernetes securityContext 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

securityContext 是 Pod/Container runtime security intent。k8s/deployment.yaml 设置 runAsNonRoot、allowPrivilegeEscalation false、readOnlyRootFilesystem true、drop ALL 和 RuntimeDefault。npm run k8s:security:check 做静态验证，不证明 cluster 已运行。

**追问方向**

继续追问时，围绕 Kubernetes securityContext 指向具体 owner file、command 或 artifact。

## 28. runAsNonRoot

**问题**

请解释 runAsNonRoot 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

runAsNonRoot 要求容器不能以 root 运行；runAsUser/runAsGroup 可指定 UID/GID。它与 Dockerfile USER 互相支持。常见错误是只在 Dockerfile 设 USER，却在 Kubernetes 中没有平台级运行约束。

**追问方向**

继续追问时，围绕 runAsNonRoot 指向具体 owner file、command 或 artifact。

## 29. readOnlyRootFilesystem

**问题**

请解释 readOnlyRootFilesystem 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

readOnlyRootFilesystem: true 限制容器根文件系统写入。本项目 Compose 用 read_only: true，Kubernetes manifest 也声明该字段。它要求应用把临时写入放到受控 tmpfs 或 volume。

**追问方向**

继续追问时，围绕 readOnlyRootFilesystem 指向具体 owner file、command 或 artifact。

## 30. capabilities drop

**问题**

请解释 capabilities drop 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

Linux capabilities 把 root 权限拆成更细粒度能力。capabilities.drop: ALL 是默认收紧策略，再按需要添加。final project 不需要额外 capabilities，所以 k8s check 要求 drop 包含 ALL。

**追问方向**

继续追问时，围绕 capabilities drop 指向具体 owner file、command 或 artifact。

## 31. seccompProfile

**问题**

请解释 seccompProfile 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

seccompProfile.type: RuntimeDefault 使用容器运行时默认 syscall filter。它不是应用层授权，但能缩小内核 syscall 面。kubernetes-policy.ts 检查 container 或 pod securityContext 中是否声明 RuntimeDefault。

**追问方向**

继续追问时，围绕 seccompProfile 指向具体 owner file、command 或 artifact。

## 32. release manifest

**问题**

请解释 release manifest 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

release manifest 记录 hashes、SBOM path、audit/test/build/smoke/security statuses、releaseDecision 和 rollbackPlanPath。src/release/release-manifest.ts 生成它。重点是它索引证据，不亲自替所有 gate 运行命令。

**追问方向**

继续追问时，围绕 release manifest 指向具体 owner file、command 或 artifact。

## 33. rollback decision

**问题**

请解释 rollback decision 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

rollback 是 post-release 恢复动作，不是所有失败的统称。src/release/rollback-decision.ts 在 post-release critical failure 或 smoke failure 时返回 rollback；pre-release failure 通常 hold。

**追问方向**

继续追问时，围绕 rollback decision 指向具体 owner file、command 或 artifact。

## 34. portfolio evidence

**问题**

请解释 portfolio evidence 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

portfolio evidence 把 claim 连到 file 和 command。release/portfolio-evidence.md 明确 local production-release readiness lab，而非 real production deployment。npm run portfolio:check 检查 README 是否保留这个边界。

**追问方向**

继续追问时，围绕 portfolio evidence 指向具体 owner file、command 或 artifact。

## 35. final-production-release-lab architecture

**问题**

请解释 final-production-release-lab architecture 在 Chapter 17 production release 中的机制、证据边界和常见错误。

**回答**

架构分为 API 层、release 层、security policy 层、platform aggregation、scripts、Docker/Compose、Kubernetes 和 release docs。scripts/release-check.ts 聚合静态 gates；API routes 暴露 release/security state；NGINX smoke 需要 Docker runtime 真实可用。

**追问方向**

继续追问时，围绕 final-production-release-lab architecture 指向具体 owner file、command 或 artifact。
