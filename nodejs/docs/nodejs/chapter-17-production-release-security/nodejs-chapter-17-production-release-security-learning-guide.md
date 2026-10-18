# Node.js 第 17 章：生产发布流水线、CI/CD、安全加固、供应链安全、部署证据与作品集验收

<style>
.macos-code-window {
  overflow: hidden;
  border: 1px solid #30363d;
  border-radius: 12px;
  background: #0d1117;
  margin: 16px 0;
}

.macos-code-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.macos-code-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
  flex: 0 0 auto;
}

.macos-code-dot-red {
  background: #ff5f57;
}

.macos-code-dot-yellow {
  background: #ffbd2e;
}

.macos-code-dot-green {
  background: #28c840;
}

.macos-code-title {
  margin-left: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  color: #c9d1d9;
}

.macos-code-titlebar + pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  background: transparent;
  border-radius: 0 0 12px 12px;
}

.macos-code-titlebar + pre code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
}
</style>

## 目录

- [本章代码定位索引](#code-index)
- [0. 章前定位](#section-0)
- [1. 学习目标](#section-1)
- [2. 前置知识](#section-2)
- [3. 环境与运行基线](#section-3)
- [4. 第一性原理](#section-4)
- [5. 技术边界模型](#section-5)
- [6. 底层机制模型](#section-6)
- [7. 核心术语](#section-7)
- [8. 本章实践路线](#section-8)
- [9. 核心教学](#section-9)
- [10. API 与规则索引](#section-10)
- [11. 常见错误对照表](#section-11)
- [12. 调试与验证方法](#section-12)
- [13. 分项练习说明](#section-13)
- [14. 最终迷你项目](#section-14)
- [15. 知识迁移与真实项目场景](#section-15)
- [16. 本章复盘任务](#section-16)
- [17. 最终心智模型](#section-17)
- [18. 官方资料](#section-18)
  - [9.1 Release pipeline 不是“自动跑命令”](#section-9-1)
  - [9.2 Local gates vs CI gates：本地证据与远程证据边界](#section-9-2)
  - [9.3 GitHub Actions mental model：event、workflow、job、step、runner、action](#section-9-3)
  - [9.4 Workflow permissions：GITHUB_TOKEN、least privilege、job permissions](#section-9-4)
  - [9.5 pull_request vs pull_request_target：untrusted code boundary](#section-9-5)
  - [9.6 Secrets and variables：GitHub secrets、environment、masking、no log leakage](#section-9-6)
  - [9.7 npm ci and lockfile discipline：package-lock、deterministic install、no latest](#section-9-7)
  - [9.8 Dependency review and npm audit：vulnerability gate、audit-level、manual review](#section-9-8)
  - [9.9 SBOM and provenance：inventory evidence、audit signatures、release artifact](#section-9-9)
  - [9.10 Action pinning and third-party action risk：mutable tags、SHA pinning、local audit](#section-9-10)
  - [9.11 Script injection boundary：shell interpolation、untrusted context、safe scripts](#section-9-11)
  - [9.12 Node.js Permission Model：runtime restriction、file access、defense-in-depth](#section-9-12)
  - [9.13 Express / API security release review：headers、CORS、rate limit、body limit、safe errors](#section-9-13)
  - [9.14 Docker image hardening：multi-stage、npm ci、non-root、.dockerignore、HEALTHCHECK](#section-9-14)
  - [9.15 Docker build secrets and artifact boundaries：no secrets in args, layers, logs, or images](#section-9-15)
  - [9.16 Kubernetes securityContext：runAsNonRoot、readOnlyRootFilesystem、capabilities、seccomp](#section-9-16)
  - [9.17 Secret scanning and placeholder policy：.env, fake Secret, token pattern checks](#section-9-17)
  - [9.18 Release manifest：hashes、SBOM path、audit result、test result、rollback plan](#section-9-18)
  - [9.19 Changelog, release notes, and migration evidence](#section-9-19)
  - [9.20 Promotion, hold, and rollback decision：SLO gate、security gate、smoke gate](#section-9-20)
  - [9.21 Portfolio proof：README evidence, claims boundary, interview explanation](#section-9-21)
  - [9.22 Chapter integration: final-production-release-lab](#section-9-22)
  - [14.1 项目目标](#section-14-1)
  - [14.2 项目结构责任分组](#section-14-2)
  - [14.3 完整项目代码](#section-14-3)

## 本章代码定位索引

<a id="code-index"></a>

| 学习目标 | 文件或片段 | 可观察证据 |
| --- | --- | --- |
| 发布证据链建模 | practices/17-production-release-security/01-release-pipeline/release-evidence-chain.ts | 字段包含 trigger、ownerFile、command、artifact、releaseGate 和 failureMode |
| 本地门禁与 CI 门禁区分 | practices/17-production-release-security/01-release-pipeline/local-vs-ci-gate.ts | 同一检查在 local machine 与 GitHub runner 上有不同证明范围 |
| GitHub Actions 权限审计 | mini-projects/final-production-release-lab/src/security/workflow-policy.ts | npm run workflow:check 解析 ci.yml 并拒绝 broad write、pull_request_target 和 unpinned uses |
| npm lockfile 与 audit gate | mini-projects/final-production-release-lab/src/security/dependency-policy.ts | npm run dependency:check 验证 required scripts、package-lock 和 no latest |
| secret placeholder 与泄漏扫描 | mini-projects/final-production-release-lab/src/security/secret-scanner.ts | npm run secret:check 输出 finding metadata 而不打印命中值 |
| Express API 发布安全 | mini-projects/final-production-release-lab/src/api/app.ts | npm test 验证安全 middleware、validation 和 no stack trace |
| Docker hardening 静态审计 | mini-projects/final-production-release-lab/src/security/docker-policy.ts | npm run docker:check 检查 multi-stage、npm ci、USER、HEALTHCHECK 和 .dockerignore |
| Kubernetes securityContext 审计 | mini-projects/final-production-release-lab/src/security/kubernetes-policy.ts | npm run k8s:security:check 检查 non-root、read-only root、drop ALL、RuntimeDefault 和 probes |
| release manifest 证据聚合 | mini-projects/final-production-release-lab/src/release/release-manifest.ts | npm run release:manifest 写入 hashes、SBOM path 和 releaseDecision |
| rollback 与作品集主张边界 | mini-projects/final-production-release-lab/release/portfolio-evidence.md | npm run portfolio:check 确认 local-only claim 不被夸大 |

## 0. 章前定位

<a id="section-0"></a>

Chapter 17 是 Node.js 学习路径的 final production-readiness integration。前面章节已经覆盖 HTTP、TypeScript layering、数据库/缓存 readiness、测试、Docker Compose、NGINX、可靠性、API contract、多服务边界和 Chapter 16 的 observability/SLO/Kubernetes。本章只处理安全发布：如何把这些能力变成可复查、可阻断、可回滚、可解释的 release evidence。

## 1. 学习目标

<a id="section-1"></a>

- 能解释 release pipeline 为什么是 evidence chain，而不是 command list。
- 能区分 local gate、CI gate、Docker runtime、Kubernetes manifest 和 production claim。
- 能审查 GitHub Actions event、permissions、GITHUB_TOKEN、secrets、uses 和 run step。
- 能解释 npm ci、package-lock、npm audit、audit-level、SBOM 和 dependency review 的边界。
- 能说明 Express、Node Permission Model、Dockerfile、Kubernetes securityContext 和 secret scanning 的发布安全意义。
- 能用 release manifest、rollback plan 和 portfolio evidence 表达真实可证明的项目能力。

## 2. 前置知识

<a id="section-2"></a>

你需要已经理解 Express request/response lifecycle、TypeScript type checking 与 runtime validation 的差异、npm scripts、package.json、Docker Compose、NGINX 入口、Kubernetes Deployment/Service/Secret/ConfigMap、health endpoints、structured logs、SLO/smoke gate 这些前置概念。本章不会重新教学它们的基础定义，只把它们接入发布安全。

## 3. 环境与运行基线

<a id="section-3"></a>

本地 mini project 使用 Node.js v26.x、npm v11.x、TypeScript、Express 5、Node built-in test runner、Supertest、Docker Compose、NGINX host port 8080、static GitHub Actions workflow 和 static Kubernetes manifests。文档修复阶段不运行 Docker 或 Compose；Docker build/runtime 与 NGINX smoke 只有在 Docker Desktop Linux engine 实际可用并重新执行后才能更新。

## 4. 第一性原理

<a id="section-4"></a>

发布是把一个 artifact 从开发状态推进到用户可能依赖的状态。第一性原理不是“跑了很多命令”，而是每个推进动作都要回答：输入是什么、谁拥有规则、命令怎样复现、产物在哪里、失败如何识别、错误后能否停下或回滚。

## 5. 技术边界模型

<a id="section-5"></a>

Chapter 17 的边界分为 tooling、CI、supply chain、secret、API runtime、Node process、container image、orchestrator manifest、release artifact 和 portfolio claim。每一层都能产生证据，也都有不能证明的内容。最危险的表达错误，是把某一层的证据跨层改名。

## 6. 底层机制模型

<a id="section-6"></a>

本章底层机制是 signal normalization。workflow audit、dependency check、secret scan、Docker policy、Kubernetes policy、test result、smoke result 和 manual review 都会被归一为 release gate input。release gate 不猜测意图，只根据 required、critical、status、evidence 和 phase 决定 promote、hold 或 rollback。

## 7. 核心术语

<a id="section-7"></a>

| 术语 | 机制含义 | 常见误解 |
| --- | --- | --- |
| release gate | 决定 artifact 是否继续推进的检查点 | 命令成功就一定放行 |
| artifact | 可保存、可引用、可复查的输出 | 控制台日志随便贴一下也算 |
| GITHUB_TOKEN | GitHub Actions 自动提供的 workflow token | 默认权限无风险 |
| SBOM | 软件组成清单 | 漏洞修复报告 |
| securityContext | Kubernetes runtime security intent | 集群已经安全运行 |
| release manifest | 证据索引 | 营销页或成功声明 |
| rollback | 已发布后恢复到 known-good artifact | 任意失败都叫 rollback |

## 8. 本章实践路线

<a id="section-8"></a>

先读 practices/17-production-release-security 中的 evidence model，再进入 final-production-release-lab。阅读顺序建议是 release pipeline、GitHub Actions、secrets、npm supply chain、workflow security、Node security、Docker hardening、Kubernetes hardening、release manifest、rollback、portfolio proof。

## 9. 核心教学

<a id="section-9"></a>

<a id="section-9-1"></a>
### 9.1 Release pipeline 不是“自动跑命令”

**结论**

release pipeline 的价值在于留下可复查证据，而不是把本地命令排成队列。真正的发布流水线必须说明输入是什么、输出在哪里、哪个 gate 接收输出、失败时停在哪一步。

**本节解决的问题**

本节处理的误区是把 automation 当成 readiness。没有 owner file、artifact 和 failure semantics 的命令序列，只能证明脚本执行过，不能证明发布物满足安全和可回滚边界。

**技术意义**

在 final-production-release-lab 中，release gate 由 src/release/gate-model.ts 表达，发布策略由 release/release-policy.json 约束。它把 typecheck、build、test、audit、secret-scan、workflow-security、docker-hardening、kubernetes-security、smoke 和 manual-review 归入同一个决策面。

**概念解释**

pipeline 是证据采集路径；gate 是决策点；artifact 是可保存的检查结果；failure semantics 是失败后 promote、hold 或 rollback 的规则。少一个字段，团队就无法复盘发布判断。

**边界**

语法层只说明脚本或 JSON 能被解析；Node 运行时只执行当前进程；TypeScript 不知道发布是否可靠；npm、GitHub Actions、Docker、Kubernetes 各自只证明自己的层。release evidence boundary 要求每个信号都说明证明范围。

**底层机制**

src/release/gate-model.ts 接收 GateSignal 数组，先找 required failure，再找 critical failure，最后处理 missing required evidence。failure mode 是某个 required signal 变成 FAIL 或 UNKNOWN，结果从 promote 改为 hold。

**API / 配置 / 命令规则**

owner file 是 src/release/gate-model.ts；学习命令是 npm run release:check；策略输入来自 release/release-policy.json；输出必须包含 decision、phase、summary 和 signals。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/01-release-pipeline/release-gate-model.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "release gate model",
  trigger: "release validation",
  ownerFile: "release/policy.json",
  trustBoundary: "local artifact versus production claim",
  command: "npm run release:check",
  artifact: "release/policy.json",
  securityRule: "unknown evidence keeps a release on hold",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "unknown evidence keeps a release on hold"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

这个练习文件把 release pipeline 拆成可命名字段。trigger 表示检查由发布验证触发，ownerFile 指向责任文件，command 表示如何复现，artifact 表示证据位置，failureMode 说明哪条规则被破坏。

**运行方式**

进入 mini-projects/final-production-release-lab 后运行 npm run release:check。该命令不会部署服务，只会执行本地静态发布门禁模型。

**预期输出**

预期看到 decision 为 promote 只代表本地静态 release gates 满足；如果某个 required signal 缺失，应得到 hold。

**执行过程**

执行过程是读取策略、运行各类静态检查、构造 GateSignal、调用 evaluateReleaseGate，然后把结果打印为 JSON。

**why the result/error happens**

结果来自 required 和 critical 标志的组合。因为发布风险不能由命令数量抵消，所以一个 critical FAIL 会阻断 promote。

**contrast**

简单的 npm run build && npm test 只给出两个命令的退出码；release gate model 会把这些退出码变成有责任文件和失败语义的发布证据。

**common mistake and violated rule**

常见错误是只收集成功日志，却不记录失败时应该 hold 还是 rollback。违反的规则是每个发布信号都必须有可复现命令和明确决策语义。

**real-project relationship**

真实项目会把同样模型接到 protected branch、artifact registry、deployment approval 和 runtime smoke。本章保持 local-only，是为了先学会证据结构。

**current learning-path relationship**

它承接 Chapter 16 的 SLO 和 smoke 思路，但不重讲 SLO 计算；这里关心的是这些信号怎样进入最终发布判断。

**final memory model**

记住：流水线不是命令列表，而是 input、owner、artifact、gate、failure semantics 的证据关系。

<a id="section-9-2"></a>
### 9.2 Local gates vs CI gates：本地证据与远程证据边界

**结论**

本地 gate 证明当前机器上的依赖、环境变量、Node/npm 版本和文件状态可以通过检查；CI gate 证明仓库状态能在远程 runner 上复现。两者都重要，但证明范围不同。

**本节解决的问题**

本节解决“我本地过了，能不能说 CI 过了”的问题。答案是不能，除非 GitHub Actions workflow 在远程 runner 上真实完成并留下 run 记录。

**技术意义**

Chapter 17 的 workflow 文件可以被本地 static audit 检查，但 .github/workflows/ci.yml 没有在 GitHub 执行时，workflow runtime execution 仍然只能标记为未验证。

**概念解释**

local gate 面向 developer workstation；CI gate 面向 clean runner。CI runner 会重新 checkout、安装依赖、运行脚本，它暴露的是 lockfile、platform、路径大小写和脚本依赖的可复现性。

**边界**

PowerShell 下的本地输出不能证明 ubuntu-latest runner 的 shell、filesystem、network 和 token 权限。反过来，CI 通过也不能证明本机 Docker Desktop 或 NGINX 已经工作。

**底层机制**

local-vs-ci-gate.ts 把 same command 放在不同 environment field 下解释。failure mode 是 evidenceLocation 被错误引用，例如把 local terminal output 写成 .github Actions run。

**API / 配置 / 命令规则**

owner file 是 practices/17-production-release-security/01-release-pipeline/local-vs-ci-gate.ts；关联配置是 .github/workflows/ci.yml；验证命令是 npm run workflow:check，远程运行需要 GitHub Actions run。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/01-release-pipeline/local-vs-ci-gate.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "local versus ci gate",
  trigger: "release validation",
  ownerFile: ".github/workflows/ci.yml",
  trustBoundary: "local artifact versus production claim",
  command: "npm run workflow:check",
  artifact: ".github/workflows/ci.yml",
  securityRule: "local success does not prove remote runner success",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "local success does not prove remote runner success"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

片段中的 trustBoundary 字段说明相同 command 在不同执行环境中产生不同证据。observableOutput 需要记录是 local terminal 还是 remote workflow log。

**运行方式**

本地可运行 npm run workflow:check 验证 workflow 结构；不能用它替代 GitHub Actions runtime run。

**预期输出**

本地 static audit 可以返回结构化通过信号；远程 runner 结果只有在 GitHub 执行后才存在。

**执行过程**

先固定本地文件状态，再检查 workflow 语法和权限；如果要得到 CI 证据，则由 GitHub event 触发 runner 重新执行。

**why the result/error happens**

本地 PASS 和 CI PASS 分离，是因为它们拥有不同的 process、filesystem、shell、token 和 network boundary。

**contrast**

本地 npm ci 成功证明 lockfile 在当前机器上可安装；CI npm ci 成功证明仓库里的 lockfile 可被 runner 重建。

**common mistake and violated rule**

常见错误是在 README 中写 CI 已通过，但只有本地输出。违反的规则是证据声明必须指向实际产生该证据的执行环境。

**real-project relationship**

真实项目需要同时保留 developer preflight 和 remote required check，避免把个人机器状态当成团队可复现状态。

**current learning-path relationship**

它连接 Chapter 10 的本地测试习惯和 Chapter 17 的 CI/CD 门禁。

**final memory model**

记住：local PASS 是 workstation evidence，CI PASS 是 runner evidence，二者不能互相改名。

<a id="section-9-3"></a>
### 9.3 GitHub Actions mental model：event、workflow、job、step、runner、action

**结论**

GitHub Actions 的执行链是 event 触发 workflow，workflow 分配 job，job 在 runner 上执行 step，step 要么运行 shell，要么调用 action。安全分析必须跟着这条链走。

**本节解决的问题**

本节解决“workflow 文件里每个层级到底负责什么”的问题。只有看清层级，才能解释 token 权限、secret 暴露、脚本注入和 action pinning 为什么发生在不同位置。

**技术意义**

.github/workflows/ci.yml 的 owner 不是某个单独命令，而是整个 event-to-runner 执行模型。workflow-policy.ts 解析它，是为了确认结构没有越过学习项目的安全边界。

**概念解释**

event 是触发源；workflow 是 YAML 配置；job 是 runner 上的一组步骤；step 是最小执行单元；run 是 shell；uses 是 action 引用；runner 是执行环境。

**边界**

event 带来外部输入，workflow 定义权限和拓扑，runner 执行代码，action 引入外部代码，shell 会解释字符串。TypeScript 不参与这些 YAML runtime 行为。

**底层机制**

workflow-event-model.ts 以 ownerFile 指向 .github/workflows/ci.yml。failure mode 是把不可信 event data 直接送进 run，或让 uses 指向未固定的外部代码。

**API / 配置 / 命令规则**

owner file 是 .github/workflows/ci.yml；本地检查入口是 src/security/workflow-policy.ts；命令是 npm run workflow:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/02-github-actions/workflow-event-model.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "workflow event model",
  trigger: "release validation",
  ownerFile: ".github/workflows/ci.yml",
  trustBoundary: "local artifact versus production claim",
  command: "npm run workflow:check",
  artifact: ".github/workflows/ci.yml",
  securityRule: "event choice changes trust boundary",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "event choice changes trust boundary"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

片段把 event、workflow、job、step、runner 和 action 放在 evidence 字段里。每一层都改变可执行对象和可接触资源。

**运行方式**

运行 npm run workflow:check，它会解析 YAML 并遍历 jobs 和 steps。

**预期输出**

预期结构检查通过时 issues 为空；若出现 pull_request_target、write-all 或未固定 uses，issues 会指出位置。

**执行过程**

YAML 被 yaml parser 转成对象；检查器读取 on、permissions、jobs、steps.run 和 steps.uses；最后输出 WorkflowPolicyResult。

**why the result/error happens**

错误来自把 YAML 当作静态说明书。事实上 runner 会执行 shell 和 action，所以配置字段就是代码执行边界。

**contrast**

npm script 只在当前进程环境运行；GitHub workflow 由 event 触发，并带有 token、secret 和 runner context。

**common mistake and violated rule**

常见错误是只看 steps 名称，不看 event 和 permission。违反的规则是执行权限必须从触发源一直追到 runner。

**real-project relationship**

真实项目的 workflow review 通常和 code review 同级，因为它决定哪些外部输入能触发哪些代码。

**current learning-path relationship**

它把 Chapter 10 的 npm scripts 延伸到远程自动化环境。

**final memory model**

记住：event 决定入口，workflow 决定结构，job 选择 runner，step 执行代码，action 也是代码。

<a id="section-9-4"></a>
### 9.4 Workflow permissions：GITHUB_TOKEN、least privilege、job permissions

**结论**

GITHUB_TOKEN 是 workflow 的自动认证能力，不是背景噪音。最小权限的基线是显式声明 root permissions，并让 job 只拿它确实需要的权限。

**本节解决的问题**

本节解决“为什么 contents: read 是学习项目的安全基线”。final-production-release-lab 不发布、不打 tag、不写 issue，因此 root 和 job 级别都不需要 write 权限。

**技术意义**

workflow-policy.ts 会拒绝 write-all 和任意 write permission。这样静态 workflow 即使被复制到真实仓库，也不会默认拿到超过质量检查所需的权限。

**概念解释**

workflow-level permissions 是默认权限面；job-level permissions 可以覆盖某个 job 的权限。GITHUB_TOKEN 的权限越大，脚本注入或 action 风险的后果越重。

**边界**

permissions 是 GitHub runner 的认证边界，不是 Node 进程里的类型或环境变量。Node 代码无法用 TypeScript 检查 YAML token scope。

**底层机制**

workflow-permissions-model.ts 指向 ci.yml 的 permissions 字段。failure mode 是 root permissions 缺失、write-all、或 job permissions 包含 contents: write 这类未授权扩大。

**API / 配置 / 命令规则**

owner file 是 .github/workflows/ci.yml；规则实现在 src/security/workflow-policy.ts；命令是 npm run workflow:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/02-github-actions/workflow-permissions-model.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "workflow permissions model",
  trigger: "release validation",
  ownerFile: ".github/workflows/ci.yml",
  trustBoundary: "local artifact versus production claim",
  command: "npm run workflow:check",
  artifact: ".github/workflows/ci.yml",
  securityRule: "token scope must be explicit",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "token scope must be explicit"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

示例的 ownerFile 让你定位权限声明，而 securityRule 说明为什么 least privilege 是 release gate 的输入。

**运行方式**

运行 npm run workflow:check，检查器会读取 workflow.permissions 和每个 job.permissions。

**预期输出**

预期 root permissions 和 job permissions 都只包含 contents: read；任何 write 字符串都会成为 issue。

**执行过程**

YAML 解析后，validatePermissions 逐项扫描 permission value。命中 write 时返回 FAIL。

**why the result/error happens**

权限过宽会放大后续任意 step 的影响，因为 runner 上执行的 shell/action 可以使用同一个 token context。

**contrast**

只读 workflow 可以 checkout 和运行检查；写权限 workflow 可能改仓库状态，风险等级完全不同。

**common mistake and violated rule**

常见错误是从模板复制 permissions: write-all。违反的规则是默认拒绝，按 job 需要最小授权。

**real-project relationship**

真实项目中，发布 job 可能需要 packages: write 或 deployments: write，但质量检查 job 不应继承这些权限。

**current learning-path relationship**

它承接 Chapter 17 的 workflow model，并为 9.10 和 9.11 的 action/script 风险提供权限背景。

**final memory model**

记住：先限制 GITHUB_TOKEN，再讨论 step；否则任何脚本问题都会变成写权限问题。

<a id="section-9-5"></a>
### 9.5 pull_request vs pull_request_target：untrusted code boundary

**结论**

pull_request 和 pull_request_target 的差异不是名字危险，而是执行上下文不同。pull_request_target 在 base repository context 中运行，错误的 checkout/run 组合可能让不可信代码接近更高权限。

**本节解决的问题**

本节解决“为什么不能只说 pull_request_target 危险”。真正要分析的是 event context、checked-out code、token permission 和 secret availability 如何组合。

**技术意义**

final-production-release-lab 的 ci.yml 只使用 pull_request、push 和 workflow_dispatch，不使用 pull_request_target。workflow-policy.ts 把出现 pull_request_target 视为结构失败。

**概念解释**

pull_request 面向 PR 代码验证；pull_request_target 面向目标仓库上下文，常用于需要处理 PR metadata 的维护任务。风险来自在目标上下文中执行了 fork 提交的代码。

**边界**

base repository context、head repository code、runner token、secret access 是四个边界。TypeScript 和 Node 测试无法替你判断这些 GitHub event 权限关系。

**底层机制**

pull-request-target-risk.ts 的 failureMode 指向 privileged target events。检查器读取 workflow.on，发现 pull_request_target 就拒绝本章学习 workflow。

**API / 配置 / 命令规则**

owner file 是 .github/workflows/ci.yml；检查函数是 evaluateWorkflowPolicy；命令是 npm run workflow:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/02-github-actions/pull-request-target-risk.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "pull request target risk",
  trigger: "release validation",
  ownerFile: ".github/workflows/ci.yml",
  trustBoundary: "local artifact versus production claim",
  command: "npm run workflow:check",
  artifact: ".github/workflows/ci.yml",
  securityRule: "privileged target events are unsafe for untrusted code",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "privileged target events are unsafe for untrusted code"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

片段强调 trustBoundary 字段。它不是阻止所有 PR 自动化，而是阻止把不可信代码放到高权限上下文执行。

**运行方式**

运行 npm run workflow:check；如果 ci.yml 出现 pull_request_target，issues 会报告该事件不允许。

**预期输出**

预期 workflow event list 中没有 pull_request_target，pull_request 只做质量检查。

**执行过程**

YAML parser 将 on 字段转成对象；检查器检查键名；命中目标事件后返回 FAIL。

**why the result/error happens**

错误发生是因为事件上下文决定 token 和 secret 行为，而 checkout/run 决定实际执行哪份代码。

**contrast**

只在 pull_request 下运行 npm test 是验证不可信代码；在 pull_request_target 下 checkout head 并运行脚本可能执行攻击者提交。

**common mistake and violated rule**

常见错误是为了解决 secret 不可用而切到 pull_request_target。违反的规则是不能用高权限事件执行未信任代码。

**real-project relationship**

真实仓库如果必须用 pull_request_target，通常只处理标签、评论等元数据，并避免 checkout head 代码或运行 PR 脚本。

**current learning-path relationship**

它连接 9.3 的 event model 和 9.6 的 secret boundary。

**final memory model**

记住：先问 workflow 运行在哪个 repository context，再问 runner 执行哪份 code。

<a id="section-9-6"></a>
### 9.6 Secrets and variables：GitHub secrets、environment、masking、no log leakage

**结论**

secret 和 variable 的区别在于泄漏后果。变量描述环境，secret 代表认证能力；masking 可以降低日志暴露，但不能允许 secret 流入不该出现的文件或命令参数。

**本节解决的问题**

本节解决“为什么 masking 不等于安全”。如果 secret 被写进 artifact、image layer、build arg、example manifest 或错误响应，日志遮罩并不能撤回已经扩散的值。

**技术意义**

final-production-release-lab 通过 .env.example 和 k8s/secret.example.yaml 保持 placeholder-only，并用 secret-scanner.ts 扫描 committed files。

**概念解释**

GitHub secrets 是 workflow 注入的敏感值；variables 是普通配置；masking 是日志显示层保护；secret scanning 是提交物检查。它们属于不同控制点。

**边界**

GitHub masking 作用在日志输出；Node 代码仍可能把值写入 JSON、response、file 或 child process argv。Docker 和 Kubernetes 又会形成自己的 artifact 和 manifest 边界。

**底层机制**

secret-value-classifier.ts 训练 token-like value 分类。failure mode 是 scanTextForSecrets 返回 finding，或 auditProjectSecrets 发现 committed .env。

**API / 配置 / 命令规则**

owner file 是 src/security/secret-scanner.ts；命令是 npm run secret:check；API endpoint POST /v1/security/scan-secret 只返回 finding metadata。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/03-secrets/secret-value-classifier.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "secret value classifier",
  trigger: "release validation",
  ownerFile: "src/security/secret-scanner.ts",
  trustBoundary: "local artifact versus production claim",
  command: "npm run secret:check",
  artifact: "src/security/secret-scanner.ts",
  securityRule: "token-like values must not be committed",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "token-like values must not be committed"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

练习中的 securityRule 对应 placeholder-only。代码不会打印 secret value，只输出 filePath、line 和 kind。

**运行方式**

运行 npm run secret:check。HTTP 层也可通过测试验证 scan-secret endpoint 不回显 token 文本。

**预期输出**

预期 findingCount 为 0；如果命中 token-like pattern，应只看到 kind 和 line，不看到原始值。

**执行过程**

扫描器遍历安全文件列表，跳过 node_modules、dist、coverage、package-lock，逐行匹配 token prefix、private key pattern 和 sensitive assignment。

**why the result/error happens**

结果取决于值是否像真实 secret 且不是 placeholder。placeholder、example、invalid、test 等词用于降低示例文件误报。

**contrast**

.env.example 可以保存 DATABASE_URL placeholder；.env 文件或真实 token 不应进入提交物。

**common mistake and violated rule**

常见错误是把 masking 当成允许打印 secret 的理由。违反的规则是 secret 不应进入输出通道。

**real-project relationship**

真实项目还会结合 GitHub secret scanning、push protection、cloud secret manager 和 runtime secret mount。

**current learning-path relationship**

它延续 Chapter 16 的 log redaction，但关注发布前 committed artifact。

**final memory model**

记住：masking 是最后一道显示层保护，不是 secret 流向设计。

<a id="section-9-7"></a>
### 9.7 npm ci and lockfile discipline：package-lock、deterministic install、no latest

**结论**

npm install 用于开发期修改依赖图；npm ci 用于自动化环境从 package-lock.json 重建依赖图。CI 的职责是复现证据，不是悄悄改写证据。

**本节解决的问题**

本节解决 npm install 与 npm ci 的精确边界。package-lock.json 描述已解析的依赖树，CI 如果更新它，就破坏了 review 过的发布输入。

**技术意义**

dependency-policy.ts 会检查 package-lock.json 是否存在、required scripts 是否存在、package.json 和 lockfile 中是否出现 latest。Dockerfile 也使用 npm ci，让镜像构建复用同一 lockfile。

**概念解释**

package-lock 是 dependency tree evidence；deterministic install 是从锁定树重建 node_modules；latest 是可变标签，不是可复现版本。

**边界**

npm 决定依赖解析和安装；TypeScript 只在依赖装好后检查类型；Node 运行时只执行已安装包。CI shell 不应该修改 package.json 或 package-lock.json。

**底层机制**

npm-ci-lockfile-model.ts 指向 package-lock.json 和 npm ci。failure mode 是 lockfile 缺失、package.json 与 lockfile 不匹配、或 dependency version 写成 latest。

**API / 配置 / 命令规则**

owner files 是 package.json、package-lock.json 和 src/security/dependency-policy.ts；命令是 npm ci 与 npm run dependency:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/04-npm-supply-chain/npm-ci-lockfile-model.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "npm ci lockfile model",
  trigger: "release validation",
  ownerFile: "package-lock.json",
  trustBoundary: "local artifact versus production claim",
  command: "npm run dependency:check",
  artifact: "package-lock.json",
  securityRule: "ci installs from the lockfile",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "ci installs from the lockfile"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

练习字段 artifact 指向 package-lock.json。这个文件不是安装产物垃圾，而是下一次自动化安装的输入。

**运行方式**

在 mini project 中运行 npm ci。它会移除现有 node_modules 并按 lockfile 安装依赖。

**预期输出**

预期 npm ci 退出码为 0；若 package.json 与 package-lock.json 不一致，应失败而不是更新 lockfile。

**执行过程**

npm 读取 package.json 和 package-lock.json，构建 ideal tree，清理 node_modules，再按 lockfile 下载和链接 packages。

**why the result/error happens**

npm ci 不改写依赖证据，是因为自动化环境需要验证仓库中已经 review 的 lockfile。

**contrast**

npm install express 会改变 package.json 或 package-lock.json；npm ci 应该只复现已有依赖图。

**common mistake and violated rule**

常见错误是在 CI 中使用 npm install。违反的规则是 release gate 不应在验证时改变 dependency evidence。

**real-project relationship**

真实项目会把 lockfile diff 当成供应链 review 对象，特别关注 transitive dependency、integrity 和 install scripts。

**current learning-path relationship**

它连接 Chapter 10 的测试命令和 Chapter 17 的供应链发布门禁。

**final memory model**

记住：开发改依赖用 npm install，CI 复现依赖用 npm ci，lockfile diff 要 review。

<a id="section-9-8"></a>
### 9.8 Dependency review and npm audit：vulnerability gate、audit-level、manual review

**结论**

npm audit 是漏洞门禁信号，不是完整安全证明。audit-level 决定哪个严重级别会阻断命令，而 npm audit fix 会改变依赖图，必须进入 review。

**本节解决的问题**

本节解决“为什么 audit 结果和 fix 动作要分开”。发现漏洞是证据，修改依赖树是变更，两者不能合并成无脑自动步骤。

**技术意义**

dependency-policy.ts 记录 auditCommand 为 npm audit --audit-level=high。GitHub dependency review config 是远程仓库边界，本地文件只能说明配置存在，不能声称 GitHub 已启用该功能。

**概念解释**

vulnerability gate 是根据 advisories 阻断发布；audit-level 是阻断阈值；dependency review 是 PR 层面对依赖 diff 的审查。

**边界**

npm audit 依据 registry audit data；GitHub dependency review 依赖 GitHub repository feature；本地脚本不能替代远程 code security enforcement。

**底层机制**

audit-level-policy.ts 把 audit 命令作为 release gate evidence。failure mode 是高严重漏洞命中、audit 命令失败、或 lockfile change 未被人工解释。

**API / 配置 / 命令规则**

owner file 是 src/security/dependency-policy.ts；命令是 npm audit --audit-level=high；远程配置是 .github/dependency-review-config.yml。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/04-npm-supply-chain/audit-level-policy.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "audit level policy",
  trigger: "release validation",
  ownerFile: "package.json",
  trustBoundary: "local artifact versus production claim",
  command: "npm audit --audit-level=high",
  artifact: "package.json",
  securityRule: "audit is a gate signal",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "audit is a gate signal"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

练习中的 securityRule 提醒 audit 是 gate signal。issues 为空只代表当前检查没有发现满足阈值的问题。

**运行方式**

运行 npm audit --audit-level=high 和 npm run dependency:check。

**预期输出**

预期 audit 输出没有 high 或更高漏洞；dependency check 应显示 auditCommand 字段。

**执行过程**

npm 读取 lockfile dependency tree，向 audit endpoint 提交依赖信息，按严重级别决定退出码。

**why the result/error happens**

npm audit fix 风险在于它会选择更新版本并改写 lockfile，新的依赖树需要重新测试和 review。

**contrast**

audit 是诊断；audit fix 是变更。诊断可以自动跑，变更不能跳过人工判断。

**common mistake and violated rule**

常见错误是在 release pipeline 中自动执行 npm audit fix。违反的规则是发布验证不能静默改变发布输入。

**real-project relationship**

真实项目通常结合 Dependabot、dependency review、lockfile diff、license policy 和手动风险接受记录。

**current learning-path relationship**

它延续 9.7 的 lockfile discipline，并为 9.9 的 SBOM inventory 提供漏洞视角。

**final memory model**

记住：audit gate 可以自动，dependency graph mutation 必须 review。

<a id="section-9-9"></a>
### 9.9 SBOM and provenance：inventory evidence、audit signatures、release artifact

**结论**

SBOM 说明发布物包含哪些 packages；它是 inventory evidence，不是漏洞修复。provenance 和 signature 说明来源或完整性证据，也不能替代 audit、review 和 runtime hardening。

**本节解决的问题**

本节解决“有 SBOM 是否就安全”的误解。SBOM 只是回答包含什么，不回答是否可利用、不回答业务风险、不自动修复漏洞。

**技术意义**

scripts/generate-sbom.ts 调用 npm sbom --sbom-format=cyclonedx --json 并写入 release/sbom.cdx.json。release-manifest.ts 用 sbomPath 和 sbomStatus 记录该证据。

**概念解释**

SBOM 是 dependency inventory；provenance 是构建来源声明；signature verification 是包完整性或来源验证。三者都是证据材料，不是单独的放行理由。

**边界**

npm sbom 输出来自当前 package tree 或 lockfile；它不能证明 Docker image digest、GitHub workflow run 或 Kubernetes rollout。

**底层机制**

sbom-inventory-model.ts 指向 release/sbom.cdx.json。failure mode 是 npm sbom 不支持所需格式、没有输出、或 manifest 中 sbomStatus 仍为 UNKNOWN。

**API / 配置 / 命令规则**

owner files 是 scripts/generate-sbom.ts、release/sbom.cdx.json 和 src/release/release-manifest.ts；命令是 npm run sbom:generate。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/04-npm-supply-chain/sbom-inventory-model.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "sbom inventory model",
  trigger: "release validation",
  ownerFile: "release/sbom.cdx.json",
  trustBoundary: "local artifact versus production claim",
  command: "npm run sbom:generate",
  artifact: "release/sbom.cdx.json",
  securityRule: "sbom is inventory evidence",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "sbom is inventory evidence"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

示例把 artifact 指向 SBOM 文件。release manifest 应记录路径和状态，而不是只在 README 中声称生成过。

**运行方式**

运行 npm run sbom:generate；当前 npm v11 需要显式指定 --sbom-format=cyclonedx。

**预期输出**

预期生成 release/sbom.cdx.json；若 npm CLI 不支持该命令或格式，应记录未验证状态。

**执行过程**

脚本通过当前 npm CLI 生成 CycloneDX JSON，写入 release 目录；manifest 读取文件存在性并给 sbomStatus 赋值。

**why the result/error happens**

缺少 SBOM 会导致 release manifest 的供应链 inventory 不完整，所以不能把供应链证据描述成齐全。

**contrast**

npm audit 告诉你 known vulnerability gate；SBOM 告诉你 inventory；signature/provenance 告诉你来源证据。

**common mistake and violated rule**

常见错误是把 SBOM 当作安全扫描报告。违反的规则是 inventory evidence 不等于 remediation evidence。

**real-project relationship**

真实项目会把 SBOM 附到 release artifact、镜像或 attestation，并结合 registry、scanner 和签名策略。

**current learning-path relationship**

它把 9.7 的 lockfile 和 9.8 的 audit 连接到发布 artifact。

**final memory model**

记住：SBOM 回答 what is inside，不回答 is it safe enough by itself。

<a id="section-9-10"></a>
### 9.10 Action pinning and third-party action risk：mutable tags、SHA pinning、local audit

**结论**

GitHub Actions 的 uses 引用会执行 action 代码。tag 如 v4 是可移动引用，完整 40-character commit SHA 才能把执行对象固定到一个具体提交。

**本节解决的问题**

本节解决“为什么 action pinning 是 workflow security”。如果 action 代码可以在不修改 workflow diff 的情况下变化，CI 运行的代码就不再由当前审查记录固定。

**技术意义**

final-production-release-lab 的 ci.yml 对 actions/checkout 使用完整 SHA，并用注释保留 human-readable tag。workflow-policy.ts 要求每个 uses 都匹配 @[0-9a-f]{40}。

**概念解释**

uses 指向 reusable action；tag 是 Git ref；SHA 是不可变提交标识；third-party action risk 来自远程代码执行、依赖链和维护者权限。

**边界**

pinning 固定 action code identity，但不证明 action 逻辑安全。它只是让 review 与执行对象对齐。

**底层机制**

action-pinning-policy.ts 指向 .github/workflows/ci.yml。failure mode 是 steps[*].uses 缺少 full SHA，检查器返回 uses reference is not pinned。

**API / 配置 / 命令规则**

owner file 是 .github/workflows/ci.yml；检查实现是 src/security/workflow-policy.ts；命令是 npm run workflow:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/05-workflow-security/action-pinning-policy.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "action pinning policy",
  trigger: "release validation",
  ownerFile: ".github/workflows/ci.yml",
  trustBoundary: "local artifact versus production claim",
  command: "npm run workflow:check",
  artifact: ".github/workflows/ci.yml",
  securityRule: "actions are executable code",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "actions are executable code"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

片段中的 securityRule 强调 actions are executable code。读取 uses 行时，要把它当作 import 远程程序，而不是普通字符串。

**运行方式**

运行 npm run workflow:check。它会遍历 workflow 对象中的每个 uses 字段。

**预期输出**

预期 actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 通过；actions/checkout@v4 应失败。

**执行过程**

YAML parser 生成 step 对象；walk 函数访问 uses value；正则检查 @ 后是否为 40 位十六进制字符。

**why the result/error happens**

mutable tag 的问题是 workflow 文件没有变化时，tag 指向的代码仍可能变化。

**contrast**

不用 action 的 run step 仍有 shell 风险；使用 action 时还要审查远程 action code 和 pinning。

**common mistake and violated rule**

常见错误是认为 official action tag 足够固定。违反的规则是安全关键 workflow 应固定可执行引用。

**real-project relationship**

真实项目还会使用 allowlist、dependency review、renovation process 和定期更新 pin。

**current learning-path relationship**

它承接 9.3 的 uses/action 层，并和 9.11 的 shell injection 并列构成 workflow execution 风险。

**final memory model**

记住：uses 是执行远程 action，full SHA 是让执行对象进入 code review 的最小条件。

<a id="section-9-11"></a>
### 9.11 Script injection boundary：shell interpolation、untrusted context、safe scripts

**结论**

run step 是 shell 程序，不是字符串展示区。任何来自 GitHub context 的不可信值进入 shell interpolation，都可能改变命令含义。

**本节解决的问题**

本节解决“为什么 PR 标题也可能是命令输入”。GitHub context 保存 event payload，payload 中的 title、body、branch name 和 comment body 都可能由外部贡献者控制。

**技术意义**

workflow-policy.ts 扫描 run 字段，拒绝 github.event.pull_request.title、body、github.head_ref、issue body、comment body 等片段直接进入 shell。

**概念解释**

script injection 是数据被 shell 当作语法解释。safe pattern 是把不可信数据放入 action input、环境变量后由程序安全解析，或完全避免在 shell 中拼接它。

**边界**

YAML expression expansion 发生在 runner 执行 shell 前；shell 再解释展开后的字符串。Node/TypeScript 源码检查不到这个阶段。

**底层机制**

script-injection-boundary.ts 的 failureMode 指向 untrusted context。检查器在 path ending run 的字符串里查找危险 context fragments。

**API / 配置 / 命令规则**

owner file 是 .github/workflows/ci.yml；检查实现是 evaluateWorkflowPolicy；命令是 npm run workflow:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/05-workflow-security/script-injection-boundary.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "script injection boundary",
  trigger: "release validation",
  ownerFile: ".github/workflows/ci.yml",
  trustBoundary: "local artifact versus production claim",
  command: "npm run workflow:check",
  artifact: ".github/workflows/ci.yml",
  securityRule: "untrusted context must not enter shell directly",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "untrusted context must not enter shell directly"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

示例把 trustBoundary 写成 workflow shell。你要从 event payload 追到 run script，而不是只看命令表面。

**运行方式**

运行 npm run workflow:check。若 run 中包含危险 context fragment，issues 会列出具体片段。

**预期输出**

预期本章 ci.yml 的 run step 只执行固定 npm scripts，不拼接 PR metadata。

**执行过程**

walk 函数遍历 YAML AST 的字符串值；当 key 是 run 时，检查 secrets 和不可信 context。

**why the result/error happens**

错误来自 shell 把字符解释成语法；一个换行、引号或 command substitution 都可能改变执行路径。

**contrast**

npm run test 是固定命令；echo ${{ github.event.pull_request.title }} 是把外部数据交给 shell。

**common mistake and violated rule**

常见错误是在日志里打印 PR body 排查问题。违反的规则是不可信 context 不应直接进入 shell script。

**real-project relationship**

真实 workflow 可以用 JavaScript action、参数文件、safe env handling 或专门转义库处理外部输入。

**current learning-path relationship**

它跟 9.4 的 token scope 联动：权限越大，script injection 后果越严重。

**final memory model**

记住：run 是 shell，GitHub context 是数据，数据不能不经边界处理变成语法。

<a id="section-9-12"></a>
### 9.12 Node.js Permission Model：runtime restriction、file access、defense-in-depth

**结论**

Node 默认信任它执行的代码。Permission Model 通过启动参数限制部分运行时资源访问，process.permission.has 可查询权限状态；它是 defense-in-depth，不是完整 sandbox。

**本节解决的问题**

本节解决“Node 权限是不是 TypeScript 类型”的误解。TypeScript 检查源码形状，不能决定进程是否能读文件、开子进程或访问环境资源。

**技术意义**

node-permission-demo.ts 只读取 process.permission.has 的可用性和 fs.read 状态，不执行危险文件访问。permission-check.ts 在本机 Node 不支持 flags 时应给出未验证状态。

**概念解释**

Permission Model 是 Node 进程启动时的 runtime policy；process.permission.has 是运行中查询；flag 控制的是进程资源边界。

**边界**

TypeScript 编译期无法阻止 OS resource access；Node Permission Model 限制 Node API 层的部分资源；容器、用户、Kubernetes securityContext 仍然是外层隔离。

**底层机制**

脚本通过 ProcessWithPermission 类型安全地访问 process.permission。failure mode 是本机 Node 不支持 --permission，或代码把权限查询当作授权系统。

**API / 配置 / 命令规则**

owner file 是 src/security/node-permission-demo.ts；命令是 npm run permission:check；相关 API 是 process.permission.has。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/security/node-permission-demo.ts</span>
  </div>

```ts
interface PermissionApi {
  has(scope: string, reference?: string): boolean;
}

type ProcessWithPermission = typeof process & {
  permission?: PermissionApi;
};

export interface PermissionDemoResult {
  model: string;
  permissionApiAvailable: boolean;
  fsReadAllowedForEntry: boolean | "UNKNOWN";
  runtimeBoundary: string;
  typeScriptBoundary: string;
}

export function runPermissionDemo(): PermissionDemoResult {
  const permission = (process as ProcessWithPermission).permission;
  return {
    model: "Node executes trusted JavaScript by default.",
    permissionApiAvailable: Boolean(permission),
    fsReadAllowedForEntry: permission ? permission.has("fs.read") : "UNKNOWN",
    runtimeBoundary: "Permission flags can restrict selected runtime resources when Node starts.",
    typeScriptBoundary: "TypeScript types do not grant or deny runtime operating-system permissions."
  };
}

if (import.meta.url === new URL(process.argv[1] ?? "", "file:").href) {
  console.log(JSON.stringify(runPermissionDemo(), null, 2));
}
```
</div>

**逐行解释**

代码先定义 PermissionApi，再在 runPermissionDemo 中读取 process.permission。permissionApiAvailable 与 fsReadAllowedForEntry 是观测字段。

**运行方式**

先运行 npm run build，再运行 npm run permission:check。脚本会执行 dist/src/security/node-permission-demo.js。

**预期输出**

支持 Permission Model 时输出 PASS；不支持相关 flag 时应记录未验证状态，而不是伪造成功。

**执行过程**

permission-check.ts 用子进程启动 Node，并传入 --permission 和编译后的 demo 文件路径。

**why the result/error happens**

结果取决于 Node 版本和启动 flags，因为权限策略在进程启动时建立，运行后不能由 TypeScript 补上。

**contrast**

Zod validation 处理输入数据形状；Permission Model 处理进程资源访问；两者不是同一层。

**common mistake and violated rule**

常见错误是写了 process.permission.has 就认为代码安全。违反的规则是权限查询不等于完整隔离。

**real-project relationship**

真实服务还需要 non-root user、container limits、Kubernetes policy、secret management 和 dependency review。

**current learning-path relationship**

它连接 Chapter 16 的 process/container boundary 与 Chapter 17 的 runtime hardening。

**final memory model**

记住：权限 flag 限制进程资源，TypeScript 只检查类型，二者不能互相替代。

<a id="section-9-13"></a>
### 9.13 Express / API security release review：headers、CORS、rate limit、body limit、safe errors

**结论**

Express 发布前不只看路由是否返回 200，还要检查中间件顺序、headers、CORS、rate limit、body size、request id、runtime validation、safe errors 和 trust proxy。

**本节解决的问题**

本节解决“API 测试过了是否就安全”的问题。功能测试可能只覆盖 happy path，发布检查必须覆盖 public error shape 和外部输入边界。

**技术意义**

app.ts 组合 helmet、cors、express-rate-limit、express.json limit、requestIdMiddleware、routes、notFoundMiddleware 和 errorMiddleware。security.integration.test.ts 验证无 stack trace。

**概念解释**

Helmet 设置安全 headers；CORS 定义跨源入口；rate limit 限制请求频率；body limit 限制 payload 大小；safe error middleware 控制公开错误字段。

**边界**

Express middleware 是 HTTP framework boundary；Zod 是 runtime validation；TypeScript 不验证请求 body；trust proxy 会改变客户端 IP 解释，不能随意打开。

**底层机制**

请求进入 createApp 后按 use 顺序流过 middleware。failure mode 是错误 middleware 返回 stack，或 validation 之前业务代码已读取不可信 body。

**API / 配置 / 命令规则**

owner file 是 src/api/app.ts；错误 owner 是 src/shared/errors/error-middleware.ts；验证入口是 npm test。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/api/app.ts</span>
  </div>

```ts
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "../config/env.js";
import { healthRouter } from "../health/health.routes.js";
import { releaseRouter } from "../modules/release/release.routes.js";
import { securityRouter } from "../modules/security/security.routes.js";
import { errorMiddleware } from "../shared/errors/error-middleware.js";
import { notFoundMiddleware } from "../shared/middleware/not-found.js";
import { requestIdMiddleware } from "../shared/middleware/request-id.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", false);

  app.use(helmet());
  app.use(cors({
    origin: env.API_ORIGIN,
    credentials: false
  }));
  app.use(rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  }));
  app.use(express.json({ limit: "100kb" }));
  app.use(requestIdMiddleware);

  app.use("/v1/health", healthRouter);
  app.use("/v1/release", releaseRouter);
  app.use("/v1/security", securityRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
```
</div>

**逐行解释**

代码先 app.disable x-powered-by，再注册安全 middleware，最后注册 routes 和错误处理。顺序体现了外部请求进入业务前的防线。

**运行方式**

运行 npm test；集成测试会请求 /v1/security/policy、/missing-route 和 /v1/security/scan-secret。

**预期输出**

预期安全策略 endpoint 返回配置摘要，404 响应包含 problem details 而不包含 stack。

**执行过程**

Supertest 构造 HTTP 请求，Express 创建 request/response 对象，中间件设置 headers 和 locals，错误处理生成 public JSON。

**why the result/error happens**

没有 stack trace 是因为 errorMiddleware 只使用 publicMessage 的 detail，并不序列化原始 Error。

**contrast**

开发时 console.error 可以帮助定位；公开 HTTP response 不能暴露内部路径、stack 或 secret。

**common mistake and violated rule**

常见错误是把 trust proxy 打开但没有受控代理。违反的规则是代理边界会影响 rate limit 和客户端身份判断。

**real-project relationship**

真实项目还会加认证、授权、schema coverage、timeout、audit logs 和 upstream proxy policy。

**current learning-path relationship**

它承接 Chapter 03 HTTP lifecycle 和 Chapter 04 runtime validation。

**final memory model**

记住：Express release review 先看 middleware boundary，再看 route handler。

<a id="section-9-14"></a>
### 9.14 Docker image hardening：multi-stage、npm ci、non-root、.dockerignore、HEALTHCHECK

**结论**

Docker hardening 不是 build success。发布镜像要关注 multi-stage、npm ci、dev dependency prune、non-root user、least-copy boundary、.dockerignore、HEALTHCHECK 和 built JavaScript runtime command。

**本节解决的问题**

本节解决“Dockerfile 通过就安全吗”的问题。构建成功只证明指令可执行，不证明镜像内容最小、权限合理或运行入口符合生产模式。

**技术意义**

Dockerfile 使用 dependencies、build、runtime 三阶段；runtime 复制 dist、node_modules 和 release；USER appuser；CMD 执行 dist/src/api/server.js。

**概念解释**

multi-stage 分离安装、构建和运行；npm ci 固定依赖；npm prune --omit=dev 减少 runtime dependency；.dockerignore 控制 build context；HEALTHCHECK 给 orchestrator 一个本地健康信号。

**边界**

Dockerfile 是 image build boundary；Compose runtime 和 Kubernetes runtime 需要额外验证。静态 docker check 不能证明 daemon build 或容器启动成功。

**底层机制**

docker-policy.ts 读取 Dockerfile、.dockerignore 和 compose.yaml。failure mode 是 FROM 少于两次、缺少 npm ci、缺少 USER appuser、出现 secret ARG 或缺少 HEALTHCHECK。

**API / 配置 / 命令规则**

owner files 是 Dockerfile、.dockerignore、compose.yaml 和 src/security/docker-policy.ts；命令是 npm run docker:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/Dockerfile</span>
  </div>

```txt
FROM node:26-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-alpine AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build
RUN npm prune --omit=dev

FROM node:26-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY release ./release
USER appuser
EXPOSE 3050
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:3050/v1/health/ready').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/src/api/server.js"]
```
</div>

**逐行解释**

Dockerfile 的 COPY 边界决定 runtime image 拿到哪些文件。USER 行决定 Node 进程默认身份，CMD 决定是否运行编译后的 JavaScript。

**运行方式**

文档修复不运行 Docker；学习时可先运行 npm run docker:check，再在 Docker daemon 可用时运行 docker compose build。

**预期输出**

静态检查预期 issues 为空；真实 build 结果必须来自 docker compose build 的退出码。

**执行过程**

检查器逐行扫描 Dockerfile，再解析 Compose services，最后检查 .dockerignore 必要项。

**why the result/error happens**

non-root 和 least-copy 降低默认权限与泄漏面，但不能替代漏洞扫描或运行时隔离。

**contrast**

FROM node:26-alpine 后直接 COPY . . 并以 root 运行很方便，但会扩大镜像内容和权限。

**common mistake and violated rule**

常见错误是把 .env 放进 build context。违反的规则是 secret 不应进入 image layer 或 build context。

**real-project relationship**

真实项目还会记录 image digest、scan result、base image update policy 和 registry provenance。

**current learning-path relationship**

它承接 Chapter 11 Docker Compose，并为 9.16 Kubernetes runtime 提供镜像输入。

**final memory model**

记住：Dockerfile 检查的是镜像构建边界，runtime 安全还要看容器和平台。

<a id="section-9-15"></a>
### 9.15 Docker build secrets and artifact boundaries：no secrets in args, layers, logs, or images

**结论**

Docker build secret 和 build arg 是不同机制。ARG/ENV 会进入构建定义、日志、历史或镜像环境风险面；build secrets 是为构建时短暂挂载敏感值设计的单独通道。

**本节解决的问题**

本节解决“为什么 build arg 不能当 secret”。即使值只在 build 阶段使用，它也可能通过 layer history、debug log、cache、provenance 或 artifact 泄漏。

**技术意义**

本章 Dockerfile 不使用任何 secret ARG 或 secret ENV。docker-policy.ts 用正则拒绝包含 SECRET、TOKEN、PASSWORD、KEY 的 ARG/ENV。

**概念解释**

build context 是发送给 builder 的文件集合；layer 是指令结果；history 记录构建指令；provenance 可能记录构建参数；build secret 是临时 secret mount。

**边界**

Docker build 阶段不是 runtime secret management。Kubernetes Secret、GitHub secrets 和 Docker build secrets 都有不同生命周期。

**底层机制**

build-secret-risk-model.ts 指向 Dockerfile。failure mode 是 Dockerfile 出现敏感 ARG 或 ENV，或者 .dockerignore 未排除 .env。

**API / 配置 / 命令规则**

owner files 是 Dockerfile、.dockerignore 和 src/security/docker-policy.ts；命令是 npm run docker:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/17-production-release-security/07-docker-hardening/build-secret-risk-model.ts</span>
  </div>

```ts
export type EvidenceStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ReleaseEvidence {
  topic: string;
  trigger: string;
  ownerFile: string;
  trustBoundary: string;
  command: string;
  artifact: string;
  securityRule: string;
  releaseGate: string;
  observableOutput: string;
  failureMode: string;
}

export const evidence: ReleaseEvidence = {
  topic: "build secret risk model",
  trigger: "release validation",
  ownerFile: "Dockerfile",
  trustBoundary: "local artifact versus production claim",
  command: "npm run docker:check",
  artifact: "Dockerfile",
  securityRule: "build args are not secret storage",
  releaseGate: "UNKNOWN never equals PASS",
  observableOutput: "structured validation result",
  failureMode: "build args are not secret storage"
};

export function decideEvidenceStatus(value: boolean | undefined): EvidenceStatus {
  if (value === true) return "PASS";
  if (value === false) return "FAIL";
  return "UNKNOWN";
}

export function summarizeEvidence(input: ReleaseEvidence): string {
  return [input.topic, input.ownerFile, input.command, input.releaseGate].join(" | ");
}
```
</div>

**逐行解释**

练习让 build secret risk 落到具体 ownerFile。securityRule 表示敏感值不能进入 build args、layers、logs 或 images。

**运行方式**

运行 npm run docker:check；它不需要 Docker daemon，只做静态规则检查。

**预期输出**

预期 Dockerfile 中没有 secret ARG/ENV，.dockerignore 排除 .env 和 .env.*。

**执行过程**

检查器读取文本，匹配 ARG/ENV 敏感关键字，再检查 .dockerignore 条目。

**why the result/error happens**

失败的根因是 build 输入和构建记录会被复制、缓存或展示，敏感值一旦进入就难以证明未泄漏。

**contrast**

API_ORIGIN 这类非敏感配置可以在 Compose environment 中出现；token/password 不应以 ARG 形式进入 Dockerfile。

**common mistake and violated rule**

常见错误是 ARG NPM_TOKEN 后 npm install private package。违反的规则是 secret 要走 build secret 机制或受控 registry auth。

**real-project relationship**

真实项目会把 private registry auth 交给 BuildKit secret、CI secret store 或 registry-specific auth flow。

**current learning-path relationship**

它补足 9.14：hardening 不只看 USER，也要看构建输入是否带 secret。

**final memory model**

记住：build arg 是构建参数，不是 secret store。

<a id="section-9-16"></a>
### 9.16 Kubernetes securityContext：runAsNonRoot、readOnlyRootFilesystem、capabilities、seccomp

**结论**

Kubernetes securityContext 把运行身份、权限提升、文件系统写入、Linux capabilities 和 seccomp profile 写成 manifest 规则。静态 YAML 满足规则不等于集群已经接收并运行。

**本节解决的问题**

本节解决“securityContext 每个字段解决什么”的问题。runAsNonRoot 防止默认 root，readOnlyRootFilesystem 限制写入，drop ALL 移除额外 Linux capabilities，RuntimeDefault 启用默认 seccomp。

**技术意义**

deployment.yaml 同时设置 pod securityContext 和 container securityContext，并包含 resources、livenessProbe、readinessProbe。kubernetes-policy.ts 验证这些字段。

**概念解释**

pod securityContext 可作用于 Pod 级默认；container securityContext 精确到容器。runAsUser/runAsGroup 指定 UID/GID，allowPrivilegeEscalation false 限制提权路径。

**边界**

static validation 只证明 manifest 字段存在；真实安全还依赖 admission controller、runtime、node kernel、image user、volume mount 和 cluster policy。

**底层机制**

kubernetes-policy.ts 解析 YAML documents，找到 Deployment 和 Service。failure mode 是缺 runAsNonRoot、allowPrivilegeEscalation false、readOnlyRootFilesystem true、drop ALL、RuntimeDefault、resources 或 probes。

**API / 配置 / 命令规则**

owner file 是 k8s/deployment.yaml；验证脚本是 src/security/kubernetes-policy.ts；命令是 npm run k8s:security:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/k8s/deployment.yaml</span>
  </div>

```txt
apiVersion: apps/v1
kind: Deployment
metadata:
  name: final-production-release-lab-api
  namespace: final-production-release-lab
  labels:
    app: final-production-release-lab
spec:
  replicas: 2
  selector:
    matchLabels:
      app: final-production-release-lab
  template:
    metadata:
      labels:
        app: final-production-release-lab
    spec:
      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: api
          image: final-production-release-lab:local
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 3050
          envFrom:
            - configMapRef:
                name: final-production-release-lab-config
          securityContext:
            runAsNonRoot: true
            runAsUser: 10001
            runAsGroup: 10001
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
            seccompProfile:
              type: RuntimeDefault
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
          livenessProbe:
            httpGet:
              path: /v1/health/live
              port: http
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /v1/health/ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
```
</div>

**逐行解释**

manifest 的 containers[0].securityContext 是本节核心。resources.requests/limits 提供 DoS 边界，probes 提供运行状态信号。

**运行方式**

运行 npm run k8s:security:check。它不连接真实集群，只解析本地 YAML。

**预期输出**

预期输出 issues 为空；若 Service selector 与 Deployment labels 不一致，应失败。

**执行过程**

脚本读取 k8s/*.yaml，使用 parseAllDocuments 转成对象，然后检查 Deployment container 和 Service selector。

**why the result/error happens**

字段缺失会失败，是因为默认容器权限通常过宽，平台不能从业务代码推断你想要的限制。

**contrast**

Docker USER appuser 是镜像默认身份；Kubernetes runAsNonRoot 是平台运行策略，两者应互相支持。

**common mistake and violated rule**

常见错误是只设置 runAsNonRoot，不处理 writable root filesystem。违反的规则是 runtime hardening 需要多字段组合。

**real-project relationship**

真实项目还会使用 Pod Security Admission、NetworkPolicy、image policy、runtime class 和 cluster-level scanning。

**current learning-path relationship**

它承接 Chapter 16 的 Kubernetes Deployment/probes，但本节专注安全字段，不重讲对象基础。

**final memory model**

记住：securityContext 是 runtime intent，cluster admission/run result 是另一份证据。

<a id="section-9-17"></a>
### 9.17 Secret scanning and placeholder policy：.env, fake Secret, token pattern checks

**结论**

secret scanning 的本地目标是阻止明显 secret 进入提交物，并保持示例文件只有 placeholder。扫描器还要避免把命中的 secret value 再打印到日志里。

**本节解决的问题**

本节解决“.env.example 与 Secret example 怎样安全展示”的问题。示例文件要能教配置形状，但不能携带真实 credential。

**技术意义**

auditProjectSecrets 跳过 node_modules、dist、coverage 和 package-lock，拒绝 .env* 但允许 .env.example。secret.example.yaml 只能出现 placeholder、example、invalid 等值。

**概念解释**

placeholder policy 定义哪些值可出现在文档化配置；token pattern checks 识别常见 credential 形状；skip list 防止扫描依赖或生成目录造成噪音。

**边界**

本地 scanner 只能发现明显模式；GitHub secret scanning 和 push protection 是远程平台能力；二者不能互相替代。

**底层机制**

secret-scanner.ts 的 scanTextForSecrets 逐行匹配 token prefix、private key pattern 和 sensitive assignment。failure mode 是 findings 非空或 committed env file 被发现。

**API / 配置 / 命令规则**

owner files 是 src/security/secret-scanner.ts、.env.example、k8s/secret.example.yaml；命令是 npm run secret:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/security/secret-scanner.ts</span>
  </div>

```ts
export interface SecretFinding {
  filePath: string;
  line: number;
  kind: string;
}

const tokenPrefixes = [
  { kind: "stripe_live_secret", prefix: ["s", "k", "_", "l", "i", "v", "e"].join("") },
  { kind: "github_token", prefix: ["g", "h", "p", "_"].join("") },
  { kind: "slack_bot_token", prefix: ["x", "o", "x", "b", "-"].join("") },
  { kind: "aws_access_key", prefix: ["A", "K", "I", "A"].join("") }
];

const privateKeyPattern = /BEGIN[\s-]+(?:RSA[\s-]+|EC[\s-]+|OPENSSH[\s-]+)?PRIVATE[\s-]+KEY/;
const assignmentPattern = /^\s*([A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN|KEY)|DATABASE_URL)\s*=\s*(.+?)\s*$/i;

export function isPlaceholderValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized.length === 0 ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized.includes("change-me") ||
    normalized.includes("dummy") ||
    normalized.includes("local") ||
    normalized.includes("test") ||
    normalized.includes("invalid");
}

export function scanTextForSecrets(filePath: string, text: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = text.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    let lineHasSpecificFinding = false;
    for (const tokenPrefix of tokenPrefixes) {
      if (line.includes(tokenPrefix.prefix) && !isPlaceholderValue(line)) {
        findings.push({ filePath, line: index + 1, kind: tokenPrefix.kind });
        lineHasSpecificFinding = true;
      }
    }

    if (privateKeyPattern.test(line) && !isPlaceholderValue(line)) {
      findings.push({ filePath, line: index + 1, kind: "private_key" });
      lineHasSpecificFinding = true;
    }

    const assignmentMatch = assignmentPattern.exec(line);
    if (assignmentMatch) {
      const key = assignmentMatch[1] ?? "";
      const value = assignmentMatch[2] ?? "";
      const sensitiveDatabaseUrl = key.toUpperCase() === "DATABASE_URL" && /^\w+:\/\//.test(value);
      const sensitiveNamedValue = key.toUpperCase() !== "DATABASE_URL";
      if (!lineHasSpecificFinding && (sensitiveDatabaseUrl || sensitiveNamedValue) && !isPlaceholderValue(value)) {
        findings.push({ filePath, line: index + 1, kind: key.toLowerCase() });
      }
    }
  }

  return findings;
}
```
</div>

**逐行解释**

代码用 filePath、line、kind 表示命中，而不是返回 value。isPlaceholderValue 用于区分教学占位和高风险真实值。

**运行方式**

运行 npm run secret:check；API 行为由 security.integration.test.ts 验证。

**预期输出**

预期 findingCount 为 0。故意输入 token-like text 时，endpoint 返回 FAIL 但不包含原 token。

**执行过程**

服务遍历项目文件，跳过依赖和输出目录，对每个文本文件执行 scanTextForSecrets。

**why the result/error happens**

不打印 secret value 是为了避免 scanner 自己成为泄漏源。

**contrast**

.env.example 是 schema documentation；.env 是本地 secret storage，不应进入仓库。

**common mistake and violated rule**

常见错误是把 Kubernetes Secret 示例写成真实 base64。违反的规则是 encoded 不等于 encrypted。

**real-project relationship**

真实项目会用 pre-commit、CI secret scan、GitHub push protection 和 secret rotation playbook。

**current learning-path relationship**

它把 9.6 的 GitHub secret boundary 落到本地文件扫描。

**final memory model**

记住：scanner 既要发现 secret，也不能泄漏 secret。

<a id="section-9-18"></a>
### 9.18 Release manifest：hashes、SBOM path、audit result、test result、rollback plan

**结论**

release manifest 是发布证据目录。它记录 package-lock、Dockerfile、workflow、Kubernetes manifests、SBOM path、audit/test/build/smoke/security status、releaseDecision 和 rollbackPlanPath。

**本节解决的问题**

本节解决“为什么 release:check 可以 promote，而 release:manifest 可以 hold”。release:check 运行静态 gate 并消费结果；manifest generator 默认没有亲自运行 build/test/smoke/audit，所以应保守记录 hold。

**技术意义**

release-manifest.ts 使用 hashFile 和 hashFiles 记录文件内容证据。writeReleaseManifest 写 release/release-manifest.generated.json，但默认 status 仍按输入证据计算。

**概念解释**

file hash 固定文件内容；status 记录检查结果；rollbackPlanPath 连接失败处理；limitations 防止把本地 manifest 当成真实部署证明。

**边界**

manifest 是 evidence index，不是 evidence executor。它能记录已有证据，但不能自动证明 GitHub Actions run、Docker daemon build、NGINX smoke 或 Kubernetes rollout。

**底层机制**

generateReleaseManifest 读取本地文件 hash，构造 signals，再调用 evaluateReleaseGate。failure mode 是某个 status 仍为 UNKNOWN，releaseDecision 变成 hold。

**API / 配置 / 命令规则**

owner files 是 src/release/release-manifest.ts、release/release-manifest.example.json、scripts/generate-release-manifest.ts；命令是 npm run release:manifest。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/release/release-manifest.ts</span>
  </div>

```ts
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fromProjectRoot, hashFile, hashFiles, listFilesRecursively } from "./artifact-hash.js";
import { evaluateReleaseGate, type GateStatus } from "./gate-model.js";

export interface ReleaseManifest {
  releaseId: string;
  createdAt: string;
  sourceRef: string;
  packageLockHash: string;
  dockerfileHash: string;
  workflowHash: string;
  k8sManifestHash: string;
  sbomPath: string;
  sbomStatus: GateStatus;
  auditStatus: GateStatus;
  testStatus: GateStatus;
  buildStatus: GateStatus;
  smokeStatus: GateStatus;
  securityCheckStatus: GateStatus;
  releaseDecision: string;
  rollbackPlanPath: string;
  limitations: string[];
}

function fileHashOrUnknown(relativePath: string): string {
  const path = fromProjectRoot(relativePath);
  return existsSync(path) ? hashFile(path) : "UNKNOWN";
}

export function generateReleaseManifest(input: {
  auditStatus?: GateStatus;
  testStatus?: GateStatus;
  buildStatus?: GateStatus;
  smokeStatus?: GateStatus;
  securityCheckStatus?: GateStatus;
  sbomStatus?: GateStatus;
} = {}): ReleaseManifest {
  const auditStatus = input.auditStatus ?? "UNKNOWN";
  const testStatus = input.testStatus ?? "UNKNOWN";
  const buildStatus = input.buildStatus ?? "UNKNOWN";
  const smokeStatus = input.smokeStatus ?? "UNKNOWN";
  const securityCheckStatus = input.securityCheckStatus ?? "UNKNOWN";
  const sbomStatus = input.sbomStatus ?? (existsSync(fromProjectRoot("release", "sbom.cdx.json")) ? "PASS" : "UNKNOWN");
  const k8sFiles = listFilesRecursively(fromProjectRoot("k8s"));
  const evaluation = evaluateReleaseGate({
    phase: "pre-release",
    signals: [
      { name: "audit", status: auditStatus, required: true, critical: true, evidence: "npm audit --audit-level=high" },
      { name: "test", status: testStatus, required: true, critical: false, evidence: "npm test" },
      { name: "build", status: buildStatus, required: true, critical: false, evidence: "npm run build" },
      { name: "smoke", status: smokeStatus, required: true, critical: true, evidence: "npm run smoke" },
      { name: "security-check", status: securityCheckStatus, required: true, critical: true, evidence: "security validation scripts" },
      { name: "sbom", status: sbomStatus, required: true, critical: false, evidence: "npm sbom" }
    ]
  });

  return {
    releaseId: "release-local-" + new Date().toISOString().replace(/[:.]/g, "-"),
    createdAt: new Date().toISOString(),
    sourceRef: process.env.COMMIT_SHA ?? "placeholder-source-ref",
    packageLockHash: fileHashOrUnknown("package-lock.json"),
    dockerfileHash: fileHashOrUnknown("Dockerfile"),
    workflowHash: fileHashOrUnknown(join(".github", "workflows", "ci.yml")),
    k8sManifestHash: k8sFiles.length > 0 ? hashFiles(k8sFiles) : "UNKNOWN",
    sbomPath: "release/sbom.cdx.json",
    sbomStatus,
    auditStatus,
    testStatus,
    buildStatus,
    smokeStatus,
    securityCheckStatus,
    releaseDecision: evaluation.decision,
    rollbackPlanPath: "release/rollback-plan.md",
    limitations: [
      "Local evidence does not prove a real production deployment.",
      "No registry image digest is recorded by this local manifest.",
      "No GitHub Actions runtime result exists until the workflow runs in GitHub."
    ]
  };
}

export function writeReleaseManifest(path = fromProjectRoot("release", "release-manifest.generated.json")): ReleaseManifest {
  const manifest = generateReleaseManifest({
    auditStatus: "UNKNOWN",
    testStatus: "UNKNOWN",
    buildStatus: "UNKNOWN",
    smokeStatus: "UNKNOWN",
    securityCheckStatus: "UNKNOWN"
  });
  writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  return manifest;
}
```
</div>

**逐行解释**

代码中的 packageLockHash、dockerfileHash、workflowHash 和 k8sManifestHash 把发布输入转成内容地址。sbomPath 指向 inventory artifact。

**运行方式**

运行 npm run release:manifest。它会写 release/release-manifest.generated.json。

**预期输出**

预期脚本写入文件成功；若没有传入实际运行过的 gates，releaseDecision 可以保持 hold。

**执行过程**

脚本读取文件、计算 SHA-256、检查 SBOM 文件、构造 status、调用 gate model 并写 JSON。

**why the result/error happens**

hold 的原因不是 manifest 写入失败，而是 generator 没有独立执行所有 runtime gates，不能替它们声明通过。

**contrast**

release:check 是当前 gate evaluation；release:manifest 是证据目录生成。前者可以 promote，后者可以保守 hold。

**common mistake and violated rule**

常见错误是手写 manifest 全部成功。违反的规则是 manifest status 必须来自实际证据来源。

**real-project relationship**

真实项目会把 manifest 连接到 commit SHA、image digest、SBOM、workflow run URL、deployment URL 和 monitoring snapshot。

**current learning-path relationship**

它整合 9.7 到 9.17 的证据，并给 9.20 的 release decision 提供输入。

**final memory model**

记住：manifest 可以索引证据，不能替证据运行。

<a id="section-9-19"></a>
### 9.19 Changelog, release notes, and migration evidence

**结论**

Changelog 和 release notes 负责描述变化，不负责证明变化。它们应区分 user-facing changes、operational changes、security changes、migration notes、known limitations 和 claim boundary。

**本节解决的问题**

本节解决“发布说明能不能写得更好看”的问题。发布说明可以清晰，但不能补造未发生的 deployment、migration 或 security enforcement。

**技术意义**

CHANGELOG.md 把 Added、Security、Limitations 分开。portfolio-check.ts 会检查 README 和 portfolio-evidence 是否明确 local-only boundary。

**概念解释**

user-facing change 影响 API 使用者；operational change 影响部署和运维；security change 影响风险边界；migration evidence 需要命令、数据变更或兼容性说明。

**边界**

Markdown release notes 是沟通材料，不是 test、audit、Docker build 或 Kubernetes rollout 结果。它不能把 UNKNOWN 改写成成功。

**底层机制**

changelog-boundary.ts 指向 CHANGELOG.md。failure mode 是文档中出现没有证据支撑的 production deployment claim。

**API / 配置 / 命令规则**

owner files 是 CHANGELOG.md、README.md 和 release/portfolio-evidence.md；命令是 npm run portfolio:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/CHANGELOG.md</span>
  </div>

````txt
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
````
</div>

**逐行解释**

CHANGELOG 的 Security 段只列出已实现的 headers、secret pattern checks 和 runtime hardening checks，不说启用了云端安全服务。

**运行方式**

运行 npm run portfolio:check 检查 claim boundary。

**预期输出**

预期检查通过，并且 README 明确 This is not a real cloud deployment。

**执行过程**

portfolio-check.ts 读取 release/portfolio-evidence.md 和 README.md，查找 local-only claim phrase。

**why the result/error happens**

错误发生在沟通文本越过证据边界时；发布说明读者会把文字当成项目承诺。

**contrast**

可以写 Added local release gate model；不能写 deployed to production cluster unless cluster evidence exists。

**common mistake and violated rule**

常见错误是把 planned feature 写进 shipped section。违反的规则是 release notes 只记录已交付、已验证或明确限制的内容。

**real-project relationship**

真实项目 release notes 还会引用 migration ticket、DB migration ID、incident risk、rollback note 和 customer-visible change。

**current learning-path relationship**

它把技术证据转成作品集和团队沟通语言。

**final memory model**

记住：release notes 描述证据支持的变化，不替证据背书。

<a id="section-9-20"></a>
### 9.20 Promotion, hold, and rollback decision：SLO gate、security gate、smoke gate

**结论**

promote、hold、rollback 是证据状态，不是情绪判断。missing evidence means hold；failed pre-release critical gate means hold；failed post-release critical gate can mean rollback；UNKNOWN never equals PASS。

**本节解决的问题**

本节解决“什么时候停、什么时候回滚”的问题。发布前失败通常 hold，发布后 smoke 或 critical security failure 影响已发布 artifact 时才进入 rollback。

**技术意义**

rollback-decision.ts 包装 evaluateReleaseGate，把 release phase 纳入判断。release/rollback-plan.md 说明 rollback 需要 previous known-good artifact 和 post-rollback smoke。

**概念解释**

promotion 是放行；hold 是不放行并修复；rollback 是已发布后恢复到已知可用状态。phase 决定同一个 failure 的动作。

**边界**

SLO gate 来自 Chapter 16 的 continuity signal；security gate 来自本章脚本；smoke gate 来自 HTTP endpoint。没有实际运行的 gate 不能被写成 PASS。

**底层机制**

decideRollback 先调用 evaluateReleaseGate。failure mode 是 phase 为 post-release 且 critical failure 或 smoke failure 出现，decision 变为 rollback。

**API / 配置 / 命令规则**

owner files 是 src/release/gate-model.ts、src/release/rollback-decision.ts、release/rollback-plan.md；命令是 npm run release:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/release/rollback-decision.ts</span>
  </div>

```ts
import type { GateSignal, ReleaseDecision, ReleasePhase } from "./gate-model.js";
import { evaluateReleaseGate } from "./gate-model.js";

export interface RollbackDecision {
  decision: ReleaseDecision;
  reason: string;
  requiredEvidence: string[];
}

export function decideRollback(input: { phase: ReleasePhase; signals: GateSignal[] }): RollbackDecision {
  const evaluation = evaluateReleaseGate(input);
  if (evaluation.decision === "rollback") {
    return {
      decision: "rollback",
      reason: evaluation.summary,
      requiredEvidence: ["failed post-release gate", "previous known-good artifact", "smoke result after rollback"]
    };
  }

  if (evaluation.decision === "hold") {
    return {
      decision: "hold",
      reason: evaluation.summary,
      requiredEvidence: ["fixed gate", "rerun validation", "manual release owner review"]
    };
  }

  return {
    decision: "promote",
    reason: evaluation.summary,
    requiredEvidence: ["release manifest", "validation output", "rollback plan"]
  };
}
```
</div>

**逐行解释**

代码把 requiredEvidence 写入结果，提醒 rollback 不只是停止服务，还需要恢复 artifact 和重新验证。

**运行方式**

运行 npm run release:check；单元测试 release-gate.unit.test.ts 和 rollback-decision.unit.test.ts 覆盖 hold 与 rollback。

**预期输出**

预期本地静态 gates 全过时 release:check 输出 promote；缺失证据或失败证据会改变 decision。

**执行过程**

signals 进入 evaluateReleaseGate，函数检查 requiredFailures、criticalFailures 和 missingRequiredEvidence，然后根据 phase 返回 decision。

**why the result/error happens**

post-release smoke failure 触发 rollback，是因为用户路径已经可能受影响；pre-release failure 还没发布，应先 hold。

**contrast**

hold 是阻止新 artifact 推进；rollback 是撤回已经影响运行环境的 artifact。

**common mistake and violated rule**

常见错误是把所有失败都叫 rollback。违反的规则是 rollback 必须有已发布对象和恢复目标。

**real-project relationship**

真实项目会把 decision 连接到 deployment controller、canary analysis、SLO burn、incident owner 和 rollback automation。

**current learning-path relationship**

它把 Chapter 16 的 SLO/smoke continuity 转成最终 release decision。

**final memory model**

记住：pre-release failure blocks promotion，post-release critical failure may require rollback。

<a id="section-9-21"></a>
### 9.21 Portfolio proof：README evidence, claims boundary, interview explanation

**结论**

作品集证明要把每个能力主张连到文件、命令和可观察输出。final-production-release-lab 可以声明 local production-release readiness lab，不能声明真实生产部署。

**本节解决的问题**

本节解决“怎么把项目讲得可信但不过度包装”。可信表达来自证据边界，而不是技术名词堆叠。

**技术意义**

portfolio-evidence.md 用表格把 claim、evidence 和 verification 连接起来。README.md 明确项目不是 real cloud deployment。

**概念解释**

claim boundary 是作品集主张能覆盖的范围；evidence map 是主张到文件与命令的映射；interview explanation 是你能口头解释机制和限制。

**边界**

local README、static workflow、static Kubernetes manifests、Dockerfile 和 tests 只能证明本地工程能力。没有 registry digest、deployment URL、cluster rollout 和 monitoring snapshot，就不能说生产上线。

**底层机制**

portfolio-claim-check.ts 指向 release/portfolio-evidence.md。failure mode 是缺少 local-only phrase 或 README 不声明 deployment boundary。

**API / 配置 / 命令规则**

owner files 是 release/portfolio-evidence.md、README.md 和 src/platform/portfolio-check.ts；命令是 npm run portfolio:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/release/portfolio-evidence.md</span>
  </div>

````txt
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
````
</div>

**逐行解释**

示例表格中的 Verification 列把每个 claim 绑定到 npm run workflow:check 等命令，避免泛泛而谈。

**运行方式**

运行 npm run portfolio:check。

**预期输出**

预期 status 为 PASS，issues 为空；若删除 local-only 声明，应失败。

**执行过程**

检查器读取 Markdown 文本，查找 claim boundary 和 required verification phrase。

**why the result/error happens**

作品集过度声明会失败，因为读者可能按生产项目标准追问 image digest、cluster evidence 和 monitoring data。

**contrast**

可以说 implemented Docker hardening checks；不能说 hardened production cluster unless cluster policy evidence exists。

**common mistake and violated rule**

常见错误是把 static Kubernetes YAML 当作 deployed service。违反的规则是描述必须跟证据层一致。

**real-project relationship**

真实作品集可以补充 live URL、CI run、artifact digest、observability dashboard 和 rollback rehearsal evidence。

**current learning-path relationship**

它把 Chapter 17 的技术门禁转换成面试可解释材料。

**final memory model**

记住：作品集不是少说，而是每句话都能指向证据。

<a id="section-9-22"></a>
### 9.22 Chapter integration: final-production-release-lab

**结论**

final-production-release-lab 把 workflow audit、dependency policy、secret scan、API security、Docker hardening、Kubernetes security、SBOM、release manifest、rollback、API routes、NGINX smoke 和 portfolio evidence 放进同一个学习项目。

**本节解决的问题**

本节解决“最终项目怎样整合前面 21 节”。它不是新概念堆砌，而是把每条 evidence chain 放到可运行的目录里。

**技术意义**

scripts/release-check.ts 调用 evaluateLocalReleaseReadiness；API routes 暴露 release/security endpoints；compose.yaml 用 NGINX 作为默认 host port 8080 entrance。

**概念解释**

integration 不是单个文件，而是命令、source、config、manifest、test 和 documentation 的协作。每个组件有不同 proof boundary。

**边界**

本项目能证明 local static checks 和 direct API smoke；Docker build/runtime、NGINX smoke、GitHub Actions runtime 和 Kubernetes cluster rollout 需要对应环境实际运行。

**底层机制**

release-check.ts 收集 workflow、dependency、secret、docker 和 Kubernetes 静态结果，再调用 evaluateReleaseGate。failure mode 是任一集成检查返回 FAIL。

**API / 配置 / 命令规则**

owner files 包括 package.json scripts、src/platform/release-check.ts、scripts/*.ts、compose.yaml、k8s/*.yaml 和 release/*.md；命令是 npm run release:check。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/release-check.ts</span>
  </div>

```ts
import { evaluateLocalReleaseReadiness } from "../src/platform/release-check.js";

const result = await evaluateLocalReleaseReadiness();
console.log(JSON.stringify(result, null, 2));
process.exit(result.decision === "promote" ? 0 : 1);
```
</div>

**逐行解释**

代码的导入关系展示集成边界：platform 层聚合 security policy，release 层做决策，api 层暴露查询入口。

**运行方式**

运行 npm run release:check；Docker Desktop 可用时再运行 docker compose build/up 和 npm run smoke。

**预期输出**

预期本地静态 release gates 可 promote；Docker/NGINX/Kubernetes runtime claim 只有实际命令成功后才能写入证据。

**执行过程**

脚本依次读取 workflow、dependency、secret、Docker 和 Kubernetes 结果，映射 GateSignal，调用 gate model。

**why the result/error happens**

集成检查能发现单项检查看不到的断裂，例如 README claim、workflow config 和 release manifest 之间不一致。

**contrast**

单独 npm test 只验证 API 和单元逻辑；集成 release check 验证发布证据是否能共同支持决策。

**common mistake and violated rule**

常见错误是把 final project 当成文件清单。违反的规则是最终项目要解释执行流和失败路径。

**real-project relationship**

真实项目会把这套集成连接到 remote CI、registry、deployment environment、runtime observability 和 incident process。

**current learning-path relationship**

它是 Chapter 17 的收束点，并只借用 Chapter 16 的 NGINX/Kubernetes/observability continuity。

**final memory model**

记住：最终项目的价值是把分散门禁变成一条可解释的 release readiness path。

## 10. API 与规则索引

<a id="section-10"></a>

| 范围 | API / 配置 / 命令 | 发布规则 |
| --- | --- | --- |
| Node Permission Model | process.permission.has, --permission | 查询 runtime permission，不替代 sandbox |
| npm install | npm install | 开发期修改依赖图 |
| npm ci | npm ci | CI 从 lockfile 复现依赖图 |
| npm audit | npm audit --audit-level=high | vulnerability gate，不自动改依赖 |
| npm sbom | npm sbom --sbom-format=cyclonedx --json | 生成 inventory evidence |
| GitHub Actions | on, permissions, jobs, steps, uses, run | event 与 runner 决定 trust boundary |
| Express | helmet, cors, rateLimit, express.json, error middleware | public response 不暴露 stack |
| Dockerfile | FROM, COPY, RUN, USER, HEALTHCHECK, CMD | multi-stage、non-root、built JavaScript runtime |
| Kubernetes | securityContext, resources, probes, Secret, ConfigMap | static manifest review，不等于 cluster run |

## 11. 常见错误对照表

<a id="section-11"></a>

| 错误 | 违反的规则 | 识别方式 |
| --- | --- | --- |
| 在 CI 使用 npm install | CI 不应更新 dependency evidence | lockfile 在验证中变化 |
| 盲跑 npm audit fix | 修复动作会改变依赖图 | package-lock diff 缺少 review |
| 使用 actions/checkout@v4 | mutable tag 没固定执行对象 | workflow check 报 uses 未 pin |
| 在 run 中插入 PR body | untrusted context 进入 shell | workflow check 命中危险 context |
| 提交 .env | secret storage 进入仓库 | secret check 报 env file |
| Dockerfile 缺 USER | runtime 默认权限过高 | docker check 报 non-root 缺失 |
| Deployment 缺 seccomp | runtime syscall profile 未声明 | k8s security check 报 RuntimeDefault 缺失 |
| README 声称生产部署 | claim 超出证据边界 | portfolio check 或人工 review 发现无 deployment evidence |

## 12. 调试与验证方法

<a id="section-12"></a>

调试 release pipeline 时，不要先问“哪个命令挂了”，先问“哪个证据字段缺了”。如果 workflow check 失败，打开 .github/workflows/ci.yml 看 event、permissions、run 和 uses。若 dependency check 失败，比较 package.json 与 package-lock.json。若 secret check 失败，只看 finding metadata，不复制原始值。若 Kubernetes check 失败，从 Deployment 的 containers[0].securityContext 开始定位。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npm run workflow:check
npm run dependency:check
npm run secret:check
npm run docker:check
npm run k8s:security:check
npm run release:check
```
</div>

## 13. 分项练习说明

<a id="section-13"></a>

practice files 不要求你背代码，而是训练 evidence field。每个练习都让你回答 trigger、owner file、trust boundary、command、artifact、security rule、release gate、observable output 和 failure mode。练习目标是形成审查习惯：看到一个发布主张，立刻追问它的证据对象。

## 14. 最终迷你项目

<a id="section-14"></a>

final-production-release-lab 把本章机制集成到一个本地项目中，但它不替代前面的 section-by-section teaching。你应该先理解 9.x 的机制，再读项目代码。

<a id="section-14-1"></a>
### 14.1 项目目标

项目目标是建立 local production-release readiness lab：可以本地验证 workflow static policy、dependency policy、secret scan、API security、Docker hardening static policy、Kubernetes security static policy、SBOM generation、release manifest、rollback plan 和 portfolio claim boundary。

<a id="section-14-2"></a>
### 14.2 项目结构责任分组

| responsibility group | owns | validation signal | common mistake prevented |
| --- | --- | --- | --- |
| release pipeline boundary | release/release-policy.json, src/release/gate-model.ts | 输出 decision、phase、summary、signals | 把缺失证据写成放行理由 |
| GitHub Actions workflow | .github/workflows/ci.yml | npm run workflow:check 能解析 event、jobs、steps | 只看 step 名称，不看 runner 和 event context |
| workflow security | src/security/workflow-policy.ts | 拒绝 broad write、pull_request_target、untrusted run interpolation 和 unpinned uses | 把 workflow 当成普通配置 |
| npm supply chain | package.json, package-lock.json, src/security/dependency-policy.ts | npm run dependency:check 与 npm audit --audit-level=high | 在 CI 中更新 dependency evidence |
| secret safety | .env.example, k8s/secret.example.yaml, src/security/secret-scanner.ts | npm run secret:check findingCount 为 0 | 把 placeholder 文件写成 credential 存储 |
| API security | src/api/app.ts, src/shared/errors/error-middleware.ts | security.integration.test.ts 验证 no stack trace | 只测 200 响应，不测 public error shape |
| Node runtime permission boundary | src/security/node-permission-demo.ts, scripts/permission-check.ts | npm run permission:check 查询 process.permission.has | 把 TypeScript 类型当成运行时权限 |
| Docker hardening | Dockerfile, .dockerignore, src/security/docker-policy.ts | npm run docker:check 检查 multi-stage、USER、HEALTHCHECK | build 成功后忽略运行身份和复制边界 |
| Kubernetes hardening | k8s/deployment.yaml, src/security/kubernetes-policy.ts | npm run k8s:security:check 检查 securityContext、resources、probes | 把 Deployment YAML 当成真实集群运行证明 |
| release manifest | release/release-manifest.example.json, src/release/release-manifest.ts | npm run release:manifest 生成 hash 与 status index | 手写成功状态但没有执行证据 |
| rollback decision | release/rollback-plan.md, src/release/rollback-decision.ts | rollback-decision.unit.test.ts 覆盖 post-release failure | 把所有失败都叫 rollback |
| portfolio proof | README.md, release/portfolio-evidence.md, src/platform/portfolio-check.ts | npm run portfolio:check 验证 local-only claim | 把 local readiness 说成 production deployment |
| runtime/deployment | compose.yaml, nginx/nginx.conf, src/api/server.ts | Docker 可用时通过 http://localhost:8080 smoke | 绕过 NGINX 入口直接声明入口层通过 |
| validation scripts | scripts/*.ts | 每个 npm script 有明确 owner 和输出 | 只有规则说明，没有可运行入口 |
| tests | tests/*.test.ts | npm test 覆盖 release、rollback、policy、API 和 security | 只测 happy path，不测安全失败边界 |

<a id="section-14-3"></a>
### 14.3 完整项目代码

#### package.json

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/package.json</span>
  </div>

```json
{
  "name": "final-production-release-lab",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "A local Node.js release pipeline, CI security, supply-chain, and deployment evidence lab.",
  "engines": {
    "node": ">=26.0.0",
    "npm": ">=11.0.0"
  },
  "scripts": {
    "dev": "tsx watch src/api/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/src/api/server.js",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "node --import tsx --test --test-concurrency=1 tests/*.test.ts",
    "smoke": "tsx scripts/smoke-test.ts",
    "workflow:check": "tsx scripts/workflow-check.ts",
    "dependency:check": "tsx scripts/dependency-check.ts",
    "secret:check": "tsx scripts/secret-check.ts",
    "docker:check": "tsx scripts/docker-check.ts",
    "k8s:security:check": "tsx scripts/k8s-security-check.ts",
    "release:check": "tsx scripts/release-check.ts",
    "permission:check": "tsx scripts/permission-check.ts",
    "portfolio:check": "tsx scripts/portfolio-check.ts",
    "sbom:generate": "tsx scripts/generate-sbom.ts",
    "release:manifest": "tsx scripts/generate-release-manifest.ts"
  },
  "dependencies": {
    "cors": "2.8.6",
    "dotenv": "17.4.2",
    "express": "5.2.1",
    "express-rate-limit": "8.6.1",
    "helmet": "8.3.0",
    "pino": "10.3.1",
    "yaml": "2.9.0",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@types/cors": "2.8.19",
    "@types/express": "5.0.6",
    "@types/node": "26.1.2",
    "@types/supertest": "7.2.1",
    "supertest": "7.2.2",
    "tsx": "4.23.1",
    "typescript": "7.0.2"
  }
}
```
</div>

#### package-lock.json

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/package-lock.json</span>
  </div>

```json
{
  "name": "final-production-release-lab",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "final-production-release-lab",
      "version": "1.0.0",
      "dependencies": {
        "cors": "2.8.6",
        "dotenv": "17.4.2",
        "express": "5.2.1",
        "express-rate-limit": "8.6.1",
        "helmet": "8.3.0",
        "pino": "10.3.1",
        "yaml": "2.9.0",
        "zod": "4.4.3"
      },
      "devDependencies": {
        "@types/cors": "2.8.19",
        "@types/express": "5.0.6",
        "@types/node": "26.1.2",
        "@types/supertest": "7.2.1",
        "supertest": "7.2.2",
        "tsx": "4.23.1",
        "typescript": "7.0.2"
      },
      "engines": {
        "node": ">=26.0.0",
        "npm": ">=11.0.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.2.tgz",
      "integrity": "sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.2.tgz",
      "integrity": "sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.2.tgz",
      "integrity": "sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.2.tgz",
      "integrity": "sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.2.tgz",
      "integrity": "sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.2.tgz",
      "integrity": "sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.2.tgz",
      "integrity": "sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.2.tgz",
      "integrity": "sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.2.tgz",
      "integrity": "sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.2.tgz",
      "integrity": "sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.2.tgz",
      "integrity": "sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.2.tgz",
      "integrity": "sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.2.tgz",
      "integrity": "sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.2.tgz",
      "integrity": "sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.2.tgz",
      "integrity": "sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.2.tgz",
      "integrity": "sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.2.tgz",
      "integrity": "sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.2.tgz",
      "integrity": "sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.2.tgz",
      "integrity": "sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.2.tgz",
      "integrity": "sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.2.tgz",
      "integrity": "sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.2.tgz",
      "integrity": "sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.2.tgz",
      "integrity": "sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.2.tgz",
      "integrity": "sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@noble/hashes": {
      "version": "1.8.0",
      "resolved": "https://registry.npmjs.org/@noble/hashes/-/hashes-1.8.0.tgz",
      "integrity": "sha512-jCs9ldd7NwzpgXDIf6P3+NrHh9/sD6CQdxHyjQI+h/6rDNo88ypBxxz45UDuZHz9r3tNz7N/VInSVoVdtXEI4A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^14.21.3 || >=16"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@paralleldrive/cuid2": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/@paralleldrive/cuid2/-/cuid2-2.3.1.tgz",
      "integrity": "sha512-XO7cAxhnTZl0Yggq6jOgjiOHhbgcO4NqFqwSmQpjK3b6TEE6Uj/jfSk6wzYyemh3+I0sHirKSetjQwn5cZktFw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@noble/hashes": "^1.1.5"
      }
    },
    "node_modules/@pinojs/redact": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/@pinojs/redact/-/redact-0.4.0.tgz",
      "integrity": "sha512-k2ENnmBugE/rzQfEcdWHcCY+/FM3VLzH9cYEsbdsoqrvzAKRhUZeRNhAZvB8OitQJ1TBed3yqWtdjzS6wJKBwg==",
      "license": "MIT"
    },
    "node_modules/@types/body-parser": {
      "version": "1.19.6",
      "resolved": "https://registry.npmjs.org/@types/body-parser/-/body-parser-1.19.6.tgz",
      "integrity": "sha512-HLFeCYgz89uk22N5Qg3dvGvsv46B8GLvKKo1zKG4NybA8U2DiEO3w9lqGg29t/tfLRJpJ6iQxnVw4OnB7MoM9g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/connect": "*",
        "@types/node": "*"
      }
    },
    "node_modules/@types/connect": {
      "version": "3.4.38",
      "resolved": "https://registry.npmjs.org/@types/connect/-/connect-3.4.38.tgz",
      "integrity": "sha512-K6uROf1LD88uDQqJCktA4yzL1YYAK6NgfsI0v/mTgyPKWsX1CnJ0XPSDhViejru1GcRkLWb8RlzFYJRqGUbaug==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/cookiejar": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@types/cookiejar/-/cookiejar-2.1.5.tgz",
      "integrity": "sha512-he+DHOWReW0nghN24E1WUqM0efK4kI9oTqDm6XmK8ZPe2djZ90BSNdGnIyCLzCPw7/pogPlGbzI2wHGGmi4O/Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/cors": {
      "version": "2.8.19",
      "resolved": "https://registry.npmjs.org/@types/cors/-/cors-2.8.19.tgz",
      "integrity": "sha512-mFNylyeyqN93lfe/9CSxOGREz8cpzAhH+E93xJ4xWQf62V8sQ/24reV2nyzUWM6H6Xji+GGHpkbLe7pVoUEskg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/express": {
      "version": "5.0.6",
      "resolved": "https://registry.npmjs.org/@types/express/-/express-5.0.6.tgz",
      "integrity": "sha512-sKYVuV7Sv9fbPIt/442koC7+IIwK5olP1KWeD88e/idgoJqDm3JV/YUiPwkoKK92ylff2MGxSz1CSjsXelx0YA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/body-parser": "*",
        "@types/express-serve-static-core": "^5.0.0",
        "@types/serve-static": "^2"
      }
    },
    "node_modules/@types/express-serve-static-core": {
      "version": "5.1.3",
      "resolved": "https://registry.npmjs.org/@types/express-serve-static-core/-/express-serve-static-core-5.1.3.tgz",
      "integrity": "sha512-dPfW8NFiOF4wOHc7+N/QSxlY9cfSsenewGbAz8C8U/MULPd/YZ27LvJUIlzaXie7e6Ove9YunJGgC9tbHD2cKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*",
        "@types/qs": "*",
        "@types/range-parser": "*",
        "@types/send": "*"
      }
    },
    "node_modules/@types/http-errors": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@types/http-errors/-/http-errors-2.0.5.tgz",
      "integrity": "sha512-r8Tayk8HJnX0FztbZN7oVqGccWgw98T/0neJphO91KkmOzug1KkofZURD4UaD5uH8AqcFLfdPErnBod0u71/qg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/methods": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/@types/methods/-/methods-1.1.4.tgz",
      "integrity": "sha512-ymXWVrDiCxTBE3+RIrrP533E70eA+9qu7zdWoHuOmGujkYtzf4HQF96b8nwHLqhuf4ykX61IGRIB38CC6/sImQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/node": {
      "version": "26.1.2",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-26.1.2.tgz",
      "integrity": "sha512-Vu4a5UFA9rIIFJ7rB/Vaafh9lrCQszopTCx6KjFboXTGQbPNasehVR5TEiithSDGyd1DEiUByggTZsg8jukeIg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "undici-types": "~8.3.0"
      }
    },
    "node_modules/@types/qs": {
      "version": "6.15.1",
      "resolved": "https://registry.npmjs.org/@types/qs/-/qs-6.15.1.tgz",
      "integrity": "sha512-GZHUBZR9hckSUhrxmp1nG6NwdpM9fCunJwyThLW1X3AyHgd9IlHb6VANpQQqDr2o/qQp6McZ3y/IA2rVzKzSbw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/range-parser": {
      "version": "1.2.7",
      "resolved": "https://registry.npmjs.org/@types/range-parser/-/range-parser-1.2.7.tgz",
      "integrity": "sha512-hKormJbkJqzQGhziax5PItDUTMAM9uE2XXQmM37dyd4hVM+5aVl7oVxMVUiVQn2oCQFN/LKCZdvSM0pFRqbSmQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/send": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/@types/send/-/send-1.2.1.tgz",
      "integrity": "sha512-arsCikDvlU99zl1g69TcAB3mzZPpxgw0UQnaHeC1Nwb015xp8bknZv5rIfri9xTOcMuaVgvabfIRA7PSZVuZIQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/serve-static": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/@types/serve-static/-/serve-static-2.2.0.tgz",
      "integrity": "sha512-8mam4H1NHLtu7nmtalF7eyBH14QyOASmcxHhSfEoRyr0nP/YdoesEtU+uSRvMe96TW/HPTtkoKqQLl53N7UXMQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/http-errors": "*",
        "@types/node": "*"
      }
    },
    "node_modules/@types/superagent": {
      "version": "8.1.11",
      "resolved": "https://registry.npmjs.org/@types/superagent/-/superagent-8.1.11.tgz",
      "integrity": "sha512-KA7srSW/HENDtOw9DOqaFLgWuMqN9WgjEw62lh9dpvRaZDkhdOkazASd7X7i2eMUYLHa1U37ZttnePsH5zTDHw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/cookiejar": "^2.1.5",
        "@types/methods": "^1.1.4",
        "@types/node": "*",
        "form-data": "^4.0.0"
      }
    },
    "node_modules/@types/supertest": {
      "version": "7.2.1",
      "resolved": "https://registry.npmjs.org/@types/supertest/-/supertest-7.2.1.tgz",
      "integrity": "sha512-4CbBvoYVLHL7+yhbYrZET0vsvuyXTC05aRe7dNQkwMzm56auceoy6Yu3K50uZmwfHna1os3CMSgM/3QVkUtPTw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/methods": "^1.1.4",
        "@types/superagent": "^8.1.0"
      }
    },
    "node_modules/@typescript/typescript-aix-ppc64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-aix-ppc64/-/typescript-aix-ppc64-7.0.2.tgz",
      "integrity": "sha512-MTKKkWB7p/0E9xi1d1tHtZ5PiLkGEMIq88pK2CubZjOsLtYTLqhgIgi6zepFa+9GHZ6h05NMCkQxGKiPXMxXtQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-darwin-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-darwin-arm64/-/typescript-darwin-arm64-7.0.2.tgz",
      "integrity": "sha512-gowzar9MwS/aRWp6f3a4KUqzRjAZjOsmGNCM6LcTgXum+dBfgsBVMN+AgvOCCbguXyick6LJhpBszxMebJ8syA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-darwin-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-darwin-x64/-/typescript-darwin-x64-7.0.2.tgz",
      "integrity": "sha512-SZ9xZInqApNlNGc9s0W1VSsktYSOe9cFqNOIqmN1Gs8SmkjKZYFt017G4VwPxASInODuAdbTW7sXiFUf893RgA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-freebsd-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-freebsd-arm64/-/typescript-freebsd-arm64-7.0.2.tgz",
      "integrity": "sha512-W5NH4y/J0plIIS5b2xvTEkU7JFxyqdMAOgf+Ilhl0vHQXKO5dZoxd+C/jEtq56c4F3wk71RB4BMRQ2XdI+bwYQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-freebsd-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-freebsd-x64/-/typescript-freebsd-x64-7.0.2.tgz",
      "integrity": "sha512-UMGDx5sTpzNw3WiPebH7l90IWfJggEd+egHt/q6p7/Cm3zqoV7VxkGXt+3DxPIw8CcmvAB0j3sVVfbhX+M4Tpw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-arm": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-arm/-/typescript-linux-arm-7.0.2.tgz",
      "integrity": "sha512-gffT3xPz9sR7j/YJExkyPntrI0P2EP9XbOyWzth2/Gs0RstK+90RBcO0ncXoXy/beYll1SXw846Nf2zdnEz0QQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-arm64/-/typescript-linux-arm64-7.0.2.tgz",
      "integrity": "sha512-Qh4eU4/y3yDjnfjjyPYihMj5/ODIlmt+Bzu17OI+fiSRDW57QmU5SiN63exPRNJPKUzcc1INa1NXdrJ+MqHjUQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-loong64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-loong64/-/typescript-linux-loong64-7.0.2.tgz",
      "integrity": "sha512-uEHck9i8hoAzXPiYRib1O7miOnz23SxIeVl6F4LXox+qov1K35jHcEW6VHKvZI+pyvl7fZEP4MCU5LYvIq1GuQ==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-mips64el": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-mips64el/-/typescript-linux-mips64el-7.0.2.tgz",
      "integrity": "sha512-R4KvAMnE43W5Qeqb0Ly56O3mWMWIAgsMyz36DCaycd5nbg/9kzm0liw3JocfRqyJY0KPmzFjbswozXyW0DnIYA==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-ppc64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-ppc64/-/typescript-linux-ppc64-7.0.2.tgz",
      "integrity": "sha512-DORx5b3sd/4S7eayxm4FQv+A7CrkUIGRaHiwI8oiHTAI1fAPWhF4J0vAlkC8biAlHSVVwxMQ3tjZ2/DVbnQiiA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-riscv64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-riscv64/-/typescript-linux-riscv64-7.0.2.tgz",
      "integrity": "sha512-wf0jqEDOjrPRnKwYRyyJDRo11KMbvMFrU+q4zqKyChODBzvlkbhNQfKvLxQCcwTpdDaXSHZTVuh0JoCrKCUMHQ==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-s390x": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-s390x/-/typescript-linux-s390x-7.0.2.tgz",
      "integrity": "sha512-IkwJc3L7yhytWd/ewjyxNDfOmswCm9GWMJT/ue/dU4aZNbwZeYAetq42VyLmsmSjvoX7z74X6ZaYCtzAr0EuGw==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-linux-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-linux-x64/-/typescript-linux-x64-7.0.2.tgz",
      "integrity": "sha512-EYdf2cNg7rgCWJnxCdJ+F3V39O8ihb37eHAu1LK8oAFizgTQbPOK7zHHXbPt8rX24COqODXeI3sIf0fCXG7H/A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-netbsd-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-netbsd-arm64/-/typescript-netbsd-arm64-7.0.2.tgz",
      "integrity": "sha512-+polYF4MF04aPpO5FTkHran9yUQDSXqy5GiSDKpsll5jy3l3+g9QLhpf39T+ePtefhXLOGrLl0QIjkQP6VnelA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-netbsd-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-netbsd-x64/-/typescript-netbsd-x64-7.0.2.tgz",
      "integrity": "sha512-8YIT0EHM/3dq10ZOVF/A7pc/YSMtbcecct4rWtexrnSCHOPcpC2KTLXfTCR6vDpnSiY12heNb1GiN/wu+T/FyA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-openbsd-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-openbsd-arm64/-/typescript-openbsd-arm64-7.0.2.tgz",
      "integrity": "sha512-APT8+ClYnuYm1u9+kgGXoMj2VzWzcymwh2gNSQVySHfkRDGOTVkoWLjCmOQSaO+PoqQ57B0flRp9SA+7GnnkzQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-openbsd-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-openbsd-x64/-/typescript-openbsd-x64-7.0.2.tgz",
      "integrity": "sha512-yX7s+Q0Dln0Dt9tEzZsAjXXR/+ytBM7AlglaqyeMPxQszJ1JhlJdZ6jLA+IzldHtflX81em7lDao1xXu+aRRkg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-sunos-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-sunos-x64/-/typescript-sunos-x64-7.0.2.tgz",
      "integrity": "sha512-dLJDGaLZ1D4HPQn62u1n8mBDkJREwMsAkCdkwd4Ieqw+x3TUyTsqY0YiBCtE6H6OzzgGk3iuZ3vFWRS+E8/d1g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-win32-arm64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-win32-arm64/-/typescript-win32-arm64-7.0.2.tgz",
      "integrity": "sha512-Gyl1Vy6OsWesLzmq+EP0Fb7b4Nid5232AvcA2SFcdYreldpNtYFFofPjnt62y9hQy7VTaZp65ICJjuAQRaVcIQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/@typescript/typescript-win32-x64": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/@typescript/typescript-win32-x64/-/typescript-win32-x64-7.0.2.tgz",
      "integrity": "sha512-0BQ3HkAHHlKLSp1qRvf3SUhGpGsDuhB/jgFw75guyqbxJqEaS0Cw/VFO8i2nHglJUzQCRtMMR/IBAKE3ETMC4g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=16.20.0"
      }
    },
    "node_modules/accepts": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/accepts/-/accepts-2.0.0.tgz",
      "integrity": "sha512-5cvg6CtKwfgdmVqY1WIiXKc3Q1bkRqGLi+2W/6ao+6Y7gu/RCwRuAhGEzh5B4KlszSuTLgZYuqFqo5bImjNKng==",
      "license": "MIT",
      "dependencies": {
        "mime-types": "^3.0.0",
        "negotiator": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/asap": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/asap/-/asap-2.0.6.tgz",
      "integrity": "sha512-BSHWgDSAiKs50o2Re8ppvp3seVHXSRM44cdSsT9FfNEUUZLOGWVCsiWaRPWM1Znn+mqZ1OfVZ3z3DWEzSp7hRA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/asynckit": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",
      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/atomic-sleep": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/atomic-sleep/-/atomic-sleep-1.0.0.tgz",
      "integrity": "sha512-kNOjDqAh7px0XWNI+4QbzoiR/nTkHAWNud2uvnJquD1/x5a7EQZMJT0AczqK0Qn67oY/TTQ1LbUKajZpp3I9tQ==",
      "license": "MIT",
      "engines": {
        "node": ">=8.0.0"
      }
    },
    "node_modules/body-parser": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-2.3.0.tgz",
      "integrity": "sha512-2cGmJupaNgg+QUwVLAucDuWuoMZ6EX9iHDRswZ5lsNYEmwPaRknMPCLZz07yTzVq/83p4o/wzbDZbBrTvGGTIw==",
      "license": "MIT",
      "dependencies": {
        "bytes": "^3.1.2",
        "content-type": "^2.0.0",
        "debug": "^4.4.3",
        "http-errors": "^2.0.1",
        "iconv-lite": "^0.7.2",
        "on-finished": "^2.4.1",
        "qs": "^6.15.2",
        "raw-body": "^3.0.2",
        "type-is": "^2.1.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/body-parser/node_modules/content-type": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-2.1.0.tgz",
      "integrity": "sha512-mj7UPXE0jaqaOsukNZRUEfEi2AcL7C/vwmwcHV0O97eO1E1pxBZuyjlZrx5seTaNBg1U6+o35wpa35Qfcc+7ag==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/bytes": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz",
      "integrity": "sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/combined-stream": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/combined-stream/-/combined-stream-1.0.8.tgz",
      "integrity": "sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "delayed-stream": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/component-emitter": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/component-emitter/-/component-emitter-1.3.1.tgz",
      "integrity": "sha512-T0+barUSQRTUQASh8bx02dl+DhF54GtIDY13Y3m9oWTklKbb3Wv974meRpeZ3lp1JpLVECWWNHC4vaG2XHXouQ==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/content-disposition": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-1.1.0.tgz",
      "integrity": "sha512-5jRCH9Z/+DRP7rkvY83B+yGIGX96OYdJmzngqnw2SBSxqCFPd0w2km3s5iawpGX8krnwSGmF0FW5Nhr0Hfai3g==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/content-type": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-1.0.5.tgz",
      "integrity": "sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cookie": {
      "version": "0.7.2",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-0.7.2.tgz",
      "integrity": "sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cookie-signature": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.2.2.tgz",
      "integrity": "sha512-D76uU73ulSXrD1UXF4KE2TMxVVwhsnCgfAyTg9k8P6KGZjlXKrOLe4dJQKI3Bxi5wjesZoFXJWElNWBjPZMbhg==",
      "license": "MIT",
      "engines": {
        "node": ">=6.6.0"
      }
    },
    "node_modules/cookiejar": {
      "version": "2.1.4",
      "resolved": "https://registry.npmjs.org/cookiejar/-/cookiejar-2.1.4.tgz",
      "integrity": "sha512-LDx6oHrK+PhzLKJU9j5S7/Y3jM/mUHvD/DeI1WQmJn652iPC5Y4TBzC9l+5OMOXlyTTA+SmVUPm0HQUwpD5Jqw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cors": {
      "version": "2.8.6",
      "resolved": "https://registry.npmjs.org/cors/-/cors-2.8.6.tgz",
      "integrity": "sha512-tJtZBBHA6vjIAaF6EnIaq6laBBP9aq/Y3ouVJjEfoHbRBcHBAHYcMh/w8LDrk2PvIMMq8gmopa5D4V8RmbrxGw==",
      "license": "MIT",
      "dependencies": {
        "object-assign": "^4",
        "vary": "^1"
      },
      "engines": {
        "node": ">= 0.10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/delayed-stream": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/delayed-stream/-/delayed-stream-1.0.0.tgz",
      "integrity": "sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/depd": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/dezalgo": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/dezalgo/-/dezalgo-1.0.4.tgz",
      "integrity": "sha512-rXSP0bf+5n0Qonsb+SVVfNfIsimO4HEtmnIpPHY8Q1UCzKlQrDMfdobr8nJOOsRgWCyMRqeSBQzmWUMq7zvVig==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "asap": "^2.0.0",
        "wrappy": "1"
      }
    },
    "node_modules/dotenv": {
      "version": "17.4.2",
      "resolved": "https://registry.npmjs.org/dotenv/-/dotenv-17.4.2.tgz",
      "integrity": "sha512-nI4U3TottKAcAD9LLud4Cb7b2QztQMUEfHbvhTH09bqXTxnSie8WnjPALV/WMCrJZ6UV/qHJ6L03OqO3LcdYZw==",
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://dotenvx.com"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/ee-first": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
      "integrity": "sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==",
      "license": "MIT"
    },
    "node_modules/encodeurl": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
      "integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz",
      "integrity": "sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-set-tostringtag": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/esbuild": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.28.2.tgz",
      "integrity": "sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.28.2",
        "@esbuild/android-arm": "0.28.2",
        "@esbuild/android-arm64": "0.28.2",
        "@esbuild/android-x64": "0.28.2",
        "@esbuild/darwin-arm64": "0.28.2",
        "@esbuild/darwin-x64": "0.28.2",
        "@esbuild/freebsd-arm64": "0.28.2",
        "@esbuild/freebsd-x64": "0.28.2",
        "@esbuild/linux-arm": "0.28.2",
        "@esbuild/linux-arm64": "0.28.2",
        "@esbuild/linux-ia32": "0.28.2",
        "@esbuild/linux-loong64": "0.28.2",
        "@esbuild/linux-mips64el": "0.28.2",
        "@esbuild/linux-ppc64": "0.28.2",
        "@esbuild/linux-riscv64": "0.28.2",
        "@esbuild/linux-s390x": "0.28.2",
        "@esbuild/linux-x64": "0.28.2",
        "@esbuild/netbsd-arm64": "0.28.2",
        "@esbuild/netbsd-x64": "0.28.2",
        "@esbuild/openbsd-arm64": "0.28.2",
        "@esbuild/openbsd-x64": "0.28.2",
        "@esbuild/openharmony-arm64": "0.28.2",
        "@esbuild/sunos-x64": "0.28.2",
        "@esbuild/win32-arm64": "0.28.2",
        "@esbuild/win32-ia32": "0.28.2",
        "@esbuild/win32-x64": "0.28.2"
      }
    },
    "node_modules/escape-html": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
      "integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
      "license": "MIT"
    },
    "node_modules/etag": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
      "integrity": "sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/express": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/express/-/express-5.2.1.tgz",
      "integrity": "sha512-hIS4idWWai69NezIdRt2xFVofaF4j+6INOpJlVOLDO8zXGpUVEVzIYk12UUi2JzjEzWL3IOAxcTubgz9Po0yXw==",
      "license": "MIT",
      "dependencies": {
        "accepts": "^2.0.0",
        "body-parser": "^2.2.1",
        "content-disposition": "^1.0.0",
        "content-type": "^1.0.5",
        "cookie": "^0.7.1",
        "cookie-signature": "^1.2.1",
        "debug": "^4.4.0",
        "depd": "^2.0.0",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "etag": "^1.8.1",
        "finalhandler": "^2.1.0",
        "fresh": "^2.0.0",
        "http-errors": "^2.0.0",
        "merge-descriptors": "^2.0.0",
        "mime-types": "^3.0.0",
        "on-finished": "^2.4.1",
        "once": "^1.4.0",
        "parseurl": "^1.3.3",
        "proxy-addr": "^2.0.7",
        "qs": "^6.14.0",
        "range-parser": "^1.2.1",
        "router": "^2.2.0",
        "send": "^1.1.0",
        "serve-static": "^2.2.0",
        "statuses": "^2.0.1",
        "type-is": "^2.0.1",
        "vary": "^1.1.2"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/express-rate-limit": {
      "version": "8.6.1",
      "resolved": "https://registry.npmjs.org/express-rate-limit/-/express-rate-limit-8.6.1.tgz",
      "integrity": "sha512-0D493aP61w0TJ2A0wy27riRsO7FMQ7FK+KUHOKCSfPvYo0R55aiC6emCVgFUeShH0fq0ICPVzNcgoS+BsbXQCA==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.3",
        "ip-address": "^10.2.0"
      },
      "engines": {
        "node": ">= 16"
      },
      "funding": {
        "url": "https://github.com/sponsors/express-rate-limit"
      },
      "peerDependencies": {
        "express": ">= 4.11"
      }
    },
    "node_modules/fast-safe-stringify": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/fast-safe-stringify/-/fast-safe-stringify-2.1.1.tgz",
      "integrity": "sha512-W+KJc2dmILlPplD/H4K9l9LcAHAfPtP6BY84uVLXQ6Evcz9Lcg33Y2z1IVblT6xdY54PXYVHEv+0Wpq8Io6zkA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/finalhandler": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-2.1.1.tgz",
      "integrity": "sha512-S8KoZgRZN+a5rNwqTxlZZePjT/4cnm0ROV70LedRHZ0p8u9fRID0hJUZQpkKLzro8LfmC8sx23bY6tVNxv8pQA==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.0",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "on-finished": "^2.4.1",
        "parseurl": "^1.3.3",
        "statuses": "^2.0.1"
      },
      "engines": {
        "node": ">= 18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/form-data": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/form-data/-/form-data-4.0.6.tgz",
      "integrity": "sha512-vKatAh4SlVfgbv+YtmhiRjhEMJsYpsG1Y2rMQtR+SVSbytsSD1YGzDIcrAJmdFec88u/+VoGmxnl+80gL1tRCQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "asynckit": "^0.4.0",
        "combined-stream": "^1.0.8",
        "es-set-tostringtag": "^2.1.0",
        "hasown": "^2.0.4",
        "mime-types": "^2.1.35"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/form-data/node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/form-data/node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/formidable": {
      "version": "3.5.4",
      "resolved": "https://registry.npmjs.org/formidable/-/formidable-3.5.4.tgz",
      "integrity": "sha512-YikH+7CUTOtP44ZTnUhR7Ic2UASBPOqmaRkRKxRbywPTe5VxF7RRCck4af9wutiZ/QKM5nME9Bie2fFaPz5Gug==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@paralleldrive/cuid2": "^2.2.2",
        "dezalgo": "^1.0.4",
        "once": "^1.4.0"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "funding": {
        "url": "https://ko-fi.com/tunnckoCore/commissions"
      }
    },
    "node_modules/forwarded": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/forwarded/-/forwarded-0.2.0.tgz",
      "integrity": "sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/fresh": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/fresh/-/fresh-2.0.0.tgz",
      "integrity": "sha512-Rx/WycZ60HOaqLKAi6cHRKKI7zxWbJ31MhntmtwMoaTeF7XFH9hhBp8vITaMidfljRQ6eYWCKkaTK+ykVJHP2A==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz",
      "integrity": "sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/helmet": {
      "version": "8.3.0",
      "resolved": "https://registry.npmjs.org/helmet/-/helmet-8.3.0.tgz",
      "integrity": "sha512-Qgpiaws3Sm30Av8Eah6sjMCZZwjlBu+E68rhpCWBshY1lb09HtLwj5GviX0OyQIn+ulUS0iX0AxN5n3tLZzz1w==",
      "license": "MIT",
      "engines": {
        "node": ">=18.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/EvanHahn"
      }
    },
    "node_modules/http-errors": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.1.tgz",
      "integrity": "sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==",
      "license": "MIT",
      "dependencies": {
        "depd": "~2.0.0",
        "inherits": "~2.0.4",
        "setprototypeof": "~1.2.0",
        "statuses": "~2.0.2",
        "toidentifier": "~1.0.1"
      },
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/iconv-lite": {
      "version": "0.7.3",
      "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.7.3.tgz",
      "integrity": "sha512-IKXpvIzjnC9XTAUbVBcMfGS0EPaIXtW6v+zr+RRp+hqULEpo0owZax6wyRwPOJbWbzjYspQwusTsfVr0ifh4uQ==",
      "license": "MIT",
      "dependencies": {
        "safer-buffer": ">= 2.1.2 < 3.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "license": "ISC"
    },
    "node_modules/ip-address": {
      "version": "10.5.0",
      "resolved": "https://registry.npmjs.org/ip-address/-/ip-address-10.5.0.tgz",
      "integrity": "sha512-R5SnVLJmgYYvf2F2ZgwSBnelz5G4q5AxIC277GDfUaNbrZKNANcBC7RHqYYePlszf4kBolVkJauG0ZjHHFh55g==",
      "license": "MIT",
      "engines": {
        "node": ">= 12"
      }
    },
    "node_modules/ipaddr.js": {
      "version": "1.9.1",
      "resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-1.9.1.tgz",
      "integrity": "sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/is-promise": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/is-promise/-/is-promise-4.0.0.tgz",
      "integrity": "sha512-hvpoI6korhJMnej285dSg6nu1+e6uxs7zG3BYAm5byqDsgJNWwxzM6z6iZiAgQR4TJ30JmBTOwqZUw3WlyH3AQ==",
      "license": "MIT"
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/media-typer": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/media-typer/-/media-typer-1.1.1.tgz",
      "integrity": "sha512-yz3xRaG20c6/BOzvYoDaGtPmGscs7YivItZEEqe6GbwNfHuxu9YNmvnEkMzKldAGY4/80pRcQRZSEnhquk9XuQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/merge-descriptors": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/merge-descriptors/-/merge-descriptors-2.0.0.tgz",
      "integrity": "sha512-Snk314V5ayFLhp3fkUREub6WtjBfPdCPY1Ln8/8munuLuiYhsABgBVWsozAG+MWMbVEvcdcpbi9R7ww22l9Q3g==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/methods": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/methods/-/methods-1.1.2.tgz",
      "integrity": "sha512-iclAHeNqNm68zFtnZ0e+1L2yUIdvzNoauKU4WBA3VvH/vPFieF7qfRlwUZU+DA9P9bPXIS90ulxoUoCH23sV2w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime": {
      "version": "2.6.0",
      "resolved": "https://registry.npmjs.org/mime/-/mime-2.6.0.tgz",
      "integrity": "sha512-USPkMeET31rOMiarsBNIHZKLGgvKc/LrjofAnBlOttf5ajRvqiRA8QsenbcooctK6d6Ts6aqZXBA+XbkKthiQg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "mime": "cli.js"
      },
      "engines": {
        "node": ">=4.0.0"
      }
    },
    "node_modules/mime-db": {
      "version": "1.54.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.54.0.tgz",
      "integrity": "sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-3.0.2.tgz",
      "integrity": "sha512-Lbgzdk0h4juoQ9fCKXW4by0UJqj+nOOrI9MJ1sSj4nI8aI2eo1qmvQEie4VD1glsS250n15LsWsYtCugiStS5A==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "^1.54.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/negotiator": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-1.1.0.tgz",
      "integrity": "sha512-NMPBRMJgiQHjbd8phG3Vebdx4kZ1H121rbl5IkMqeOsahptB9BKo/d7oJ3zTXqTgagn2bWlNSXkh0QUGM31RYg==",
      "license": "MIT",
      "dependencies": {
        "content-type": "^2.1.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/negotiator/node_modules/content-type": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-2.1.0.tgz",
      "integrity": "sha512-mj7UPXE0jaqaOsukNZRUEfEi2AcL7C/vwmwcHV0O97eO1E1pxBZuyjlZrx5seTaNBg1U6+o35wpa35Qfcc+7ag==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-inspect": {
      "version": "1.13.4",
      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/on-exit-leak-free": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/on-exit-leak-free/-/on-exit-leak-free-2.1.2.tgz",
      "integrity": "sha512-0eJJY6hXLGf1udHwfNftBqH+g73EU4B504nZeKpz1sYRKafAghwxEJunB2O7rDZkL4PGfsMVnTXZ2EjibbqcsA==",
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/on-finished": {
      "version": "2.4.1",
      "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.4.1.tgz",
      "integrity": "sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==",
      "license": "MIT",
      "dependencies": {
        "ee-first": "1.1.1"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/once": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
      "integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",
      "license": "ISC",
      "dependencies": {
        "wrappy": "1"
      }
    },
    "node_modules/parseurl": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/parseurl/-/parseurl-1.3.3.tgz",
      "integrity": "sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/path-to-regexp": {
      "version": "8.4.2",
      "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-8.4.2.tgz",
      "integrity": "sha512-qRcuIdP69NPm4qbACK+aDogI5CBDMi1jKe0ry5rSQJz8JVLsC7jV8XpiJjGRLLol3N+R5ihGYcrPLTno6pAdBA==",
      "license": "MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/pino": {
      "version": "10.3.1",
      "resolved": "https://registry.npmjs.org/pino/-/pino-10.3.1.tgz",
      "integrity": "sha512-r34yH/GlQpKZbU1BvFFqOjhISRo1MNx1tWYsYvmj6KIRHSPMT2+yHOEb1SG6NMvRoHRF0a07kCOox/9yakl1vg==",
      "license": "MIT",
      "dependencies": {
        "@pinojs/redact": "^0.4.0",
        "atomic-sleep": "^1.0.0",
        "on-exit-leak-free": "^2.1.0",
        "pino-abstract-transport": "^3.0.0",
        "pino-std-serializers": "^7.0.0",
        "process-warning": "^5.0.0",
        "quick-format-unescaped": "^4.0.3",
        "real-require": "^0.2.0",
        "safe-stable-stringify": "^2.3.1",
        "sonic-boom": "^4.0.1",
        "thread-stream": "^4.0.0"
      },
      "bin": {
        "pino": "bin.js"
      }
    },
    "node_modules/pino-abstract-transport": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/pino-abstract-transport/-/pino-abstract-transport-3.0.0.tgz",
      "integrity": "sha512-wlfUczU+n7Hy/Ha5j9a/gZNy7We5+cXp8YL+X+PG8S0KXxw7n/JXA3c46Y0zQznIJ83URJiwy7Lh56WLokNuxg==",
      "license": "MIT",
      "dependencies": {
        "split2": "^4.0.0"
      }
    },
    "node_modules/pino-std-serializers": {
      "version": "7.1.0",
      "resolved": "https://registry.npmjs.org/pino-std-serializers/-/pino-std-serializers-7.1.0.tgz",
      "integrity": "sha512-BndPH67/JxGExRgiX1dX0w1FvZck5Wa4aal9198SrRhZjH3GxKQUKIBnYJTdj2HDN3UQAS06HlfcSbQj2OHmaw==",
      "license": "MIT"
    },
    "node_modules/process-warning": {
      "version": "5.1.0",
      "resolved": "https://registry.npmjs.org/process-warning/-/process-warning-5.1.0.tgz",
      "integrity": "sha512-jQSaVHsPgtyw60e1rQ/A+/ArPEj/S8pS/vFnyGa/gYFXrKk/6RuDkoqVDQ5NI5MmS01698ltlAk0NoDBNLujRw==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "MIT"
    },
    "node_modules/proxy-addr": {
      "version": "2.0.7",
      "resolved": "https://registry.npmjs.org/proxy-addr/-/proxy-addr-2.0.7.tgz",
      "integrity": "sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==",
      "license": "MIT",
      "dependencies": {
        "forwarded": "0.2.0",
        "ipaddr.js": "1.9.1"
      },
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/qs": {
      "version": "6.15.3",
      "resolved": "https://registry.npmjs.org/qs/-/qs-6.15.3.tgz",
      "integrity": "sha512-O9gl3zCl5h5blw1KGUzQKhA5oUXSl8rwUIM5o0S3nCXMliSvy5Dzx7/DJcI+SwgICv+IneSZwhBh1oSyEHA71A==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "es-define-property": "^1.0.1",
        "side-channel": "^1.1.1"
      },
      "engines": {
        "node": ">=0.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/quick-format-unescaped": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/quick-format-unescaped/-/quick-format-unescaped-4.0.4.tgz",
      "integrity": "sha512-tYC1Q1hgyRuHgloV/YXs2w15unPVh8qfu/qCTfhTYamaw7fyhumKa2yGpdSo87vY32rIclj+4fWYQXUMs9EHvg==",
      "license": "MIT"
    },
    "node_modules/range-parser": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/range-parser/-/range-parser-1.3.0.tgz",
      "integrity": "sha512-hek2mFQpPuI4E1BBKrSto+BU3e3x4xuarsbiwr3+lf7p44juvFMV0XFWQAP3xUyqXA4RrXLIoaSUGbSt056ZMw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/raw-body": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/raw-body/-/raw-body-3.0.2.tgz",
      "integrity": "sha512-K5zQjDllxWkf7Z5xJdV0/B0WTNqx6vxG70zJE4N0kBs4LovmEYWJzQGxC9bS9RAKu3bgM40lrd5zoLJ12MQ5BA==",
      "license": "MIT",
      "dependencies": {
        "bytes": "~3.1.2",
        "http-errors": "~2.0.1",
        "iconv-lite": "~0.7.0",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/real-require": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/real-require/-/real-require-0.2.0.tgz",
      "integrity": "sha512-57frrGM/OCTLqLOAh0mhVA9VBMHd+9U7Zb2THMGdBUoZVOtGbJzjxsYGDJ3A9AYYCP4hn6y1TVbaOfzWtm5GFg==",
      "license": "MIT",
      "engines": {
        "node": ">= 12.13.0"
      }
    },
    "node_modules/router": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/router/-/router-2.2.0.tgz",
      "integrity": "sha512-nLTrUKm2UyiL7rlhapu/Zl45FwNgkZGaCpZbIHajDYgwlJCOzLSk+cIPAnsEqV955GjILJnKbdQC1nVPz+gAYQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.0",
        "depd": "^2.0.0",
        "is-promise": "^4.0.0",
        "parseurl": "^1.3.3",
        "path-to-regexp": "^8.0.0"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/safe-stable-stringify": {
      "version": "2.5.0",
      "resolved": "https://registry.npmjs.org/safe-stable-stringify/-/safe-stable-stringify-2.5.0.tgz",
      "integrity": "sha512-b3rppTKm9T+PsVCBEOUR46GWI7fdOs00VKZ1+9c1EWDaDMvjQc6tUwuFyIprgGgTcWoVHSKrU8H31ZHA2e0RHA==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/safer-buffer": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
      "license": "MIT"
    },
    "node_modules/send": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/send/-/send-1.2.1.tgz",
      "integrity": "sha512-1gnZf7DFcoIcajTjTwjwuDjzuz4PPcY2StKPlsGAQ1+YH20IRVrBaXSWmdjowTJ6u8Rc01PoYOGHXfP1mYcZNQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.3",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "etag": "^1.8.1",
        "fresh": "^2.0.0",
        "http-errors": "^2.0.1",
        "mime-types": "^3.0.2",
        "ms": "^2.1.3",
        "on-finished": "^2.4.1",
        "range-parser": "^1.2.1",
        "statuses": "^2.0.2"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/serve-static": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/serve-static/-/serve-static-2.2.1.tgz",
      "integrity": "sha512-xRXBn0pPqQTVQiC8wyQrKs2MOlX24zQ0POGaj0kultvoOCstBQM5yvOhAVSUwOMjQtTvsPWoNCHfPGwaaQJhTw==",
      "license": "MIT",
      "dependencies": {
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "parseurl": "^1.3.3",
        "send": "^1.2.0"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/setprototypeof": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz",
      "integrity": "sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==",
      "license": "ISC"
    },
    "node_modules/side-channel": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.1.tgz",
      "integrity": "sha512-6x6dK6zJdpTzF4sQeNYxwtvBzf6Eg4GtlesS94HOvTudUeyK2WXAaIfmDgsyslYrRBeFIlsi54AYsFGUuhmvrQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.4",
        "side-channel-list": "^1.0.1",
        "side-channel-map": "^1.0.1",
        "side-channel-weakmap": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-list": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.1.tgz",
      "integrity": "sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-map": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-weakmap": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3",
        "side-channel-map": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/sonic-boom": {
      "version": "4.2.1",
      "resolved": "https://registry.npmjs.org/sonic-boom/-/sonic-boom-4.2.1.tgz",
      "integrity": "sha512-w6AxtubXa2wTXAUsZMMWERrsIRAdrK0Sc+FUytWvYAhBJLyuI4llrMIC1DtlNSdI99EI86KZum2MMq3EAZlF9Q==",
      "license": "MIT",
      "dependencies": {
        "atomic-sleep": "^1.0.0"
      }
    },
    "node_modules/split2": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/split2/-/split2-4.2.0.tgz",
      "integrity": "sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==",
      "license": "ISC",
      "engines": {
        "node": ">= 10.x"
      }
    },
    "node_modules/statuses": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
      "integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/superagent": {
      "version": "10.3.0",
      "resolved": "https://registry.npmjs.org/superagent/-/superagent-10.3.0.tgz",
      "integrity": "sha512-B+4Ik7ROgVKrQsXTV0Jwp2u+PXYLSlqtDAhYnkkD+zn3yg8s/zjA2MeGayPoY/KICrbitwneDHrjSotxKL+0XQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "component-emitter": "^1.3.1",
        "cookiejar": "^2.1.4",
        "debug": "^4.3.7",
        "fast-safe-stringify": "^2.1.1",
        "form-data": "^4.0.5",
        "formidable": "^3.5.4",
        "methods": "^1.1.2",
        "mime": "2.6.0",
        "qs": "^6.14.1"
      },
      "engines": {
        "node": ">=14.18.0"
      }
    },
    "node_modules/supertest": {
      "version": "7.2.2",
      "resolved": "https://registry.npmjs.org/supertest/-/supertest-7.2.2.tgz",
      "integrity": "sha512-oK8WG9diS3DlhdUkcFn4tkNIiIbBx9lI2ClF8K+b2/m8Eyv47LSawxUzZQSNKUrVb2KsqeTDCcjAAVPYaSLVTA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "cookie-signature": "^1.2.2",
        "methods": "^1.1.2",
        "superagent": "^10.3.0"
      },
      "engines": {
        "node": ">=14.18.0"
      }
    },
    "node_modules/thread-stream": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/thread-stream/-/thread-stream-4.2.0.tgz",
      "integrity": "sha512-e2zZ96wSChazBsbENf/Pcm/4swHt2cEKQ92rhUjkL9GCKiTDJIaTBenjE/m9DXi0QBmTMDkFDdOomUy20A1tDQ==",
      "license": "MIT",
      "dependencies": {
        "real-require": "^1.0.0"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/thread-stream/node_modules/real-require": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/real-require/-/real-require-1.0.0.tgz",
      "integrity": "sha512-P4nbQYQfePJxRSmY+v/KINxVucm4NF3p3s7pJveMTtom52FR4YGltUQLB8idDXwDDWW+eYrWDFbuzUnjoWHF7g==",
      "license": "MIT"
    },
    "node_modules/toidentifier": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz",
      "integrity": "sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.6"
      }
    },
    "node_modules/tsx": {
      "version": "4.23.1",
      "resolved": "https://registry.npmjs.org/tsx/-/tsx-4.23.1.tgz",
      "integrity": "sha512-GQHnkIfxyx1wYCOS/wonik5MVRZU9hi1TEZmzGZSCJB1y9YgoZ8H6itNE/u4suE+yLmOzuE4E5S4TZ/ZX2wcWQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "~0.28.0"
      },
      "bin": {
        "tsx": "dist/cli.mjs"
      },
      "engines": {
        "node": ">=18.0.0"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      }
    },
    "node_modules/type-is": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/type-is/-/type-is-2.1.0.tgz",
      "integrity": "sha512-faYHw0anBbc/kWF3zFTEnxSFOAGUX9GFbOBthvDdLsIlEoWOFOtS0zgCiQYwIskL9iGXZL3kAXD8OoZ4GmMATA==",
      "license": "MIT",
      "dependencies": {
        "content-type": "^2.0.0",
        "media-typer": "^1.1.0",
        "mime-types": "^3.0.0"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/type-is/node_modules/content-type": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-2.1.0.tgz",
      "integrity": "sha512-mj7UPXE0jaqaOsukNZRUEfEi2AcL7C/vwmwcHV0O97eO1E1pxBZuyjlZrx5seTaNBg1U6+o35wpa35Qfcc+7ag==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/typescript": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-7.0.2.tgz",
      "integrity": "sha512-8FYau96o3NKOhbjKi/qNvG/W5jhzxkbdm5sj9AbZ/5T5sWqn3hJgLfGx27sRKZWTvyzCP8dLRBTf5tBTSRVUNA==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc"
      },
      "engines": {
        "node": ">=16.20.0"
      },
      "optionalDependencies": {
        "@typescript/typescript-aix-ppc64": "7.0.2",
        "@typescript/typescript-darwin-arm64": "7.0.2",
        "@typescript/typescript-darwin-x64": "7.0.2",
        "@typescript/typescript-freebsd-arm64": "7.0.2",
        "@typescript/typescript-freebsd-x64": "7.0.2",
        "@typescript/typescript-linux-arm": "7.0.2",
        "@typescript/typescript-linux-arm64": "7.0.2",
        "@typescript/typescript-linux-loong64": "7.0.2",
        "@typescript/typescript-linux-mips64el": "7.0.2",
        "@typescript/typescript-linux-ppc64": "7.0.2",
        "@typescript/typescript-linux-riscv64": "7.0.2",
        "@typescript/typescript-linux-s390x": "7.0.2",
        "@typescript/typescript-linux-x64": "7.0.2",
        "@typescript/typescript-netbsd-arm64": "7.0.2",
        "@typescript/typescript-netbsd-x64": "7.0.2",
        "@typescript/typescript-openbsd-arm64": "7.0.2",
        "@typescript/typescript-openbsd-x64": "7.0.2",
        "@typescript/typescript-sunos-x64": "7.0.2",
        "@typescript/typescript-win32-arm64": "7.0.2",
        "@typescript/typescript-win32-x64": "7.0.2"
      }
    },
    "node_modules/undici-types": {
      "version": "8.3.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-8.3.0.tgz",
      "integrity": "sha512-j375ScV60dom+YkPFIfTLcOiPxkN/buHz5GobjLhixFuANaNs3C9l4GmrWqejgXWJ7BbJcFYpTEUkS1Ge8bpZQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/unpipe": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz",
      "integrity": "sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/vary": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/vary/-/vary-1.1.2.tgz",
      "integrity": "sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/wrappy": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
      "integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",
      "license": "ISC"
    },
    "node_modules/yaml": {
      "version": "2.9.0",
      "resolved": "https://registry.npmjs.org/yaml/-/yaml-2.9.0.tgz",
      "integrity": "sha512-2AvhNX3mb8zd6Zy7INTtSpl1F15HW6Wnqj0srWlkKLcpYl/gMIMJiyuGq2KeI2YFxUPjdlB+3Lc10seMLtL4cA==",
      "license": "ISC",
      "bin": {
        "yaml": "bin.mjs"
      },
      "engines": {
        "node": ">= 14.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/eemeli"
      }
    },
    "node_modules/zod": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/zod/-/zod-4.4.3.tgz",
      "integrity": "sha512-ytENFjIJFl2UwYglde2jchW2Hwm4GJFLDiSXWdTrJQBIN9Fcyp7n4DhxJEiWNAJMV1/BqWfW/kkg71UDcHJyTQ==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/colinhacks"
      }
    }
  }
}
```
</div>

#### tsconfig.json

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tsconfig.json</span>
  </div>

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": ".",
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "scripts/**/*.ts", "tests/**/*.ts"]
}
```
</div>

#### .env.example

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/.env.example</span>
  </div>

```txt
NODE_ENV=development
PORT=3050
API_ORIGIN=http://localhost:8080
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
RELEASE_ENVIRONMENT=local
RELEASE_OWNER=local-release-owner
RELEASE_VERSION=1.0.0
COMMIT_SHA=placeholder-commit-sha
BUILD_ID=placeholder-build-id
DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/final_release_lab
REDIS_URL=redis://placeholder:placeholder@localhost:6379/0
```
</div>

#### .gitignore

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/.gitignore</span>
  </div>

```txt
.env
.env.*
!.env.example
node_modules/
dist/
coverage/
release/sbom.cdx.json
release/release-manifest.generated.json
*.log
```
</div>

#### .dockerignore

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/.dockerignore</span>
  </div>

```txt
node_modules
dist
coverage
.env
.env.*
!.env.example
.git
.github
*.log
release/sbom.cdx.json
release/release-manifest.generated.json
```
</div>

#### Dockerfile

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/Dockerfile</span>
  </div>

```txt
FROM node:26-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-alpine AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build
RUN npm prune --omit=dev

FROM node:26-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY release ./release
USER appuser
EXPOSE 3050
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:3050/v1/health/ready').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/src/api/server.js"]
```
</div>

#### compose.yaml

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/compose.yaml</span>
  </div>

```txt
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      PORT: "3050"
      API_ORIGIN: http://localhost:8080
      RATE_LIMIT_WINDOW_MS: "60000"
      RATE_LIMIT_MAX: "120"
      RELEASE_ENVIRONMENT: local-compose
      RELEASE_OWNER: local-release-owner
      RELEASE_VERSION: 1.0.0
      COMMIT_SHA: placeholder-commit-sha
      BUILD_ID: placeholder-build-id
    read_only: true
    tmpfs:
      - /tmp
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3050/v1/health/ready').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 6
      start_period: 10s
  nginx:
    image: nginx:1.29-alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      api:
        condition: service_healthy
```
</div>

#### README.md

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/README.md</span>
  </div>

````txt
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
````
</div>

#### CHANGELOG.md

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/CHANGELOG.md</span>
  </div>

````txt
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
````
</div>

#### SECURITY.md

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/SECURITY.md</span>
  </div>

````txt
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
````
</div>

#### .github/workflows/ci.yml

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/.github/workflows/ci.yml</span>
  </div>

```txt
name: final-production-release-lab-ci

on:
  workflow_dispatch:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  quality:
    name: quality-gates
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      # Human-readable source: actions/checkout@v4.2.2
      - name: Checkout repository
        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683

      - name: Use Node.js 26
        run: |
          node --version
          npm --version

      - name: Install locked dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Build
        run: npm run build

      - name: Test
        run: npm test -- --test-concurrency=1

      - name: Static workflow security check
        run: npm run workflow:check

      - name: Dependency policy check
        run: npm run dependency:check

      - name: Secret policy check
        run: npm run secret:check

      - name: Docker hardening policy check
        run: npm run docker:check

      - name: Kubernetes security policy check
        run: npm run k8s:security:check

      - name: Release policy check
        run: npm run release:check
```
</div>

#### .github/dependency-review-config.yml

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/.github/dependency-review-config.yml</span>
  </div>

```txt
fail-on-severity: high
deny-licenses:
  - AGPL-1.0-only
  - AGPL-3.0-only
comment-summary-in-pr: false
allow-ghsas: []
license-check: true
vulnerability-check: true
```
</div>

#### nginx/nginx.conf

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/nginx/nginx.conf</span>
  </div>

```txt
server {
  listen 80;
  server_name _;

  location / {
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Request-Id $request_id;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://api:3050;
  }
}
```
</div>

#### k8s/namespace.yaml

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/k8s/namespace.yaml</span>
  </div>

```txt
apiVersion: v1
kind: Namespace
metadata:
  name: final-production-release-lab
```
</div>

#### k8s/configmap.yaml

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/k8s/configmap.yaml</span>
  </div>

```txt
apiVersion: v1
kind: ConfigMap
metadata:
  name: final-production-release-lab-config
  namespace: final-production-release-lab
data:
  NODE_ENV: production
  PORT: "3050"
  API_ORIGIN: http://localhost:8080
  RELEASE_ENVIRONMENT: static-kubernetes
  RELEASE_OWNER: local-release-owner
  RELEASE_VERSION: 1.0.0
```
</div>

#### k8s/secret.example.yaml

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/k8s/secret.example.yaml</span>
  </div>

```txt
apiVersion: v1
kind: Secret
metadata:
  name: final-production-release-lab-secret-example
  namespace: final-production-release-lab
type: Opaque
stringData:
  DATABASE_URL: postgresql://placeholder:placeholder@postgres.example.invalid:5432/final_release_lab
  REDIS_URL: redis://placeholder:placeholder@redis.example.invalid:6379/0
  API_TOKEN: placeholder-api-token
```
</div>

#### k8s/deployment.yaml

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/k8s/deployment.yaml</span>
  </div>

```txt
apiVersion: apps/v1
kind: Deployment
metadata:
  name: final-production-release-lab-api
  namespace: final-production-release-lab
  labels:
    app: final-production-release-lab
spec:
  replicas: 2
  selector:
    matchLabels:
      app: final-production-release-lab
  template:
    metadata:
      labels:
        app: final-production-release-lab
    spec:
      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: api
          image: final-production-release-lab:local
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 3050
          envFrom:
            - configMapRef:
                name: final-production-release-lab-config
          securityContext:
            runAsNonRoot: true
            runAsUser: 10001
            runAsGroup: 10001
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
            seccompProfile:
              type: RuntimeDefault
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
          livenessProbe:
            httpGet:
              path: /v1/health/live
              port: http
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /v1/health/ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
```
</div>

#### k8s/service.yaml

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/k8s/service.yaml</span>
  </div>

```txt
apiVersion: v1
kind: Service
metadata:
  name: final-production-release-lab-api
  namespace: final-production-release-lab
spec:
  selector:
    app: final-production-release-lab
  ports:
    - name: http
      port: 80
      targetPort: http
```
</div>

#### release/release-policy.json

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/release/release-policy.json</span>
  </div>

```json
{
  "service": "final-production-release-lab",
  "releaseGate": {
    "requiredSignals": [
      "typecheck",
      "build",
      "test",
      "audit",
      "secret-scan",
      "workflow-security",
      "docker-hardening",
      "kubernetes-security",
      "smoke",
      "slo-continuity",
      "manual-review"
    ],
    "criticalSignals": [
      "audit",
      "secret-scan",
      "workflow-security",
      "smoke"
    ],
    "unknownPolicy": "hold",
    "localEvidencePolicy": "local-only-does-not-equal-production"
  },
  "rollback": {
    "postReleaseSmokeFailure": "rollback",
    "criticalSecurityFailure": "rollback",
    "missingPreReleaseEvidence": "hold"
  }
}
```
</div>

#### release/release-manifest.example.json

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/release/release-manifest.example.json</span>
  </div>

```json
{
  "releaseId": "release-local-example",
  "createdAt": "2026-08-26T00:00:00.000Z",
  "sourceRef": "placeholder-source-ref",
  "packageLockHash": "placeholder-package-lock-sha256",
  "dockerfileHash": "placeholder-dockerfile-sha256",
  "workflowHash": "placeholder-workflow-sha256",
  "k8sManifestHash": "placeholder-k8s-manifest-sha256",
  "sbomPath": "release/sbom.cdx.json",
  "sbomStatus": "UNKNOWN",
  "auditStatus": "UNKNOWN",
  "testStatus": "UNKNOWN",
  "buildStatus": "UNKNOWN",
  "smokeStatus": "UNKNOWN",
  "securityCheckStatus": "UNKNOWN",
  "releaseDecision": "hold",
  "rollbackPlanPath": "release/rollback-plan.md",
  "limitations": [
    "Local evidence does not prove a real production deployment.",
    "No image digest is recorded until an image is built and inspected.",
    "No GitHub Actions runtime result exists until the workflow runs in GitHub."
  ]
}
```
</div>

#### release/rollback-plan.md

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/release/rollback-plan.md</span>
  </div>

````txt
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
````
</div>

#### release/portfolio-evidence.md

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/release/portfolio-evidence.md</span>
  </div>

````txt
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
````
</div>

#### src/api/app.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/api/app.ts</span>
  </div>

```ts
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "../config/env.js";
import { healthRouter } from "../health/health.routes.js";
import { releaseRouter } from "../modules/release/release.routes.js";
import { securityRouter } from "../modules/security/security.routes.js";
import { errorMiddleware } from "../shared/errors/error-middleware.js";
import { notFoundMiddleware } from "../shared/middleware/not-found.js";
import { requestIdMiddleware } from "../shared/middleware/request-id.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", false);

  app.use(helmet());
  app.use(cors({
    origin: env.API_ORIGIN,
    credentials: false
  }));
  app.use(rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  }));
  app.use(express.json({ limit: "100kb" }));
  app.use(requestIdMiddleware);

  app.use("/v1/health", healthRouter);
  app.use("/v1/release", releaseRouter);
  app.use("/v1/security", securityRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
```
</div>

#### src/api/server.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/api/server.ts</span>
  </div>

```ts
import { env } from "../config/env.js";
import { createApp } from "./app.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(JSON.stringify({
    level: "info",
    message: "server_started",
    port: env.PORT,
    service: "final-production-release-lab"
  }));
});

function shutdown(signal: NodeJS.Signals) {
  console.log(JSON.stringify({
    level: "info",
    message: "shutdown_started",
    signal
  }));
  server.close(() => {
    console.log(JSON.stringify({
      level: "info",
      message: "shutdown_complete",
      signal
    }));
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
```
</div>

#### src/config/env.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/config/env.ts</span>
  </div>

```ts
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3050),
  API_ORIGIN: z.string().min(1).default("http://localhost:8080"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  RELEASE_ENVIRONMENT: z.string().min(1).default("local"),
  RELEASE_OWNER: z.string().min(1).default("local-release-owner"),
  RELEASE_VERSION: z.string().min(1).default("1.0.0"),
  COMMIT_SHA: z.string().min(1).default("placeholder-commit-sha"),
  BUILD_ID: z.string().min(1).default("placeholder-build-id")
});

export type AppEnv = z.infer<typeof envSchema>;
export const env: AppEnv = envSchema.parse(process.env);
```
</div>

#### src/health/health.routes.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/health/health.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { getHealth } from "./health.service.js";

export const healthRouter = Router();

healthRouter.get("/live", (_request, response) => {
  response.json(getHealth());
});

healthRouter.get("/ready", (_request, response) => {
  response.json({
    ...getHealth(),
    checks: {
      process: "ready",
      releaseEvidence: "available"
    }
  });
});
```
</div>

#### src/health/health.service.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/health/health.service.ts</span>
  </div>

```ts
import { env } from "../config/env.js";

export interface HealthResponse {
  status: "ok";
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export function getHealth(): HealthResponse {
  return {
    status: "ok",
    service: "final-production-release-lab",
    version: env.RELEASE_VERSION,
    environment: env.RELEASE_ENVIRONMENT,
    timestamp: new Date().toISOString()
  };
}
```
</div>

#### src/modules/release/release.routes.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/modules/release/release.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { validateBody } from "../../shared/validation/validate-request.js";
import {
  evaluateReleaseController,
  portfolioEvidenceController,
  releaseManifestController,
  releasePolicyController,
  rollbackDecisionController,
  rollbackPlanController
} from "./release.controller.js";
import { evaluateReleaseBodySchema } from "./release.schema.js";

export const releaseRouter = Router();

releaseRouter.get("/policy", releasePolicyController);
releaseRouter.get("/manifest", releaseManifestController);
releaseRouter.post("/evaluate", validateBody(evaluateReleaseBodySchema), evaluateReleaseController);
releaseRouter.post("/rollback-decision", validateBody(evaluateReleaseBodySchema), rollbackDecisionController);
releaseRouter.get("/rollback-plan", rollbackPlanController);
releaseRouter.get("/portfolio-evidence", portfolioEvidenceController);
```
</div>

#### src/modules/release/release.controller.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/modules/release/release.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { evaluateRelease, getPortfolioEvidence, getReleaseManifest, getReleasePolicy, getRollbackDecision, getRollbackPlan } from "./release.service.js";

export const releasePolicyController: RequestHandler = (_request, response) => {
  response.json(getReleasePolicy());
};

export const releaseManifestController: RequestHandler = (_request, response) => {
  response.json(getReleaseManifest());
};

export const evaluateReleaseController: RequestHandler = (request, response) => {
  response.json(evaluateRelease(request.body));
};

export const rollbackPlanController: RequestHandler = (_request, response) => {
  response.json(getRollbackPlan());
};

export const rollbackDecisionController: RequestHandler = (request, response) => {
  response.json(getRollbackDecision(request.body));
};

export const portfolioEvidenceController: RequestHandler = (_request, response) => {
  response.json(getPortfolioEvidence());
};
```
</div>

#### src/modules/release/release.service.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/modules/release/release.service.ts</span>
  </div>

```ts
import { readFileSync } from "node:fs";
import { fromProjectRoot } from "../../release/artifact-hash.js";
import { evaluateReleaseGate, type GateSignal, type ReleasePhase } from "../../release/gate-model.js";
import { generateReleaseManifest } from "../../release/release-manifest.js";
import { decideRollback } from "../../release/rollback-decision.js";

export function getReleasePolicy() {
  return JSON.parse(readFileSync(fromProjectRoot("release", "release-policy.json"), "utf8")) as Record<string, unknown>;
}

export function getReleaseManifest() {
  return generateReleaseManifest();
}

export function evaluateRelease(input: { phase: ReleasePhase; signals: GateSignal[] }) {
  return evaluateReleaseGate(input);
}

export function getRollbackPlan() {
  return {
    text: readFileSync(fromProjectRoot("release", "rollback-plan.md"), "utf8")
  };
}

export function getRollbackDecision(input: { phase: ReleasePhase; signals: GateSignal[] }) {
  return decideRollback(input);
}

export function getPortfolioEvidence() {
  return {
    text: readFileSync(fromProjectRoot("release", "portfolio-evidence.md"), "utf8")
  };
}
```
</div>

#### src/modules/release/release.schema.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/modules/release/release.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const gateStatusSchema = z.enum(["PASS", "FAIL", "UNKNOWN"]);

export const evaluateReleaseBodySchema = z.object({
  phase: z.enum(["pre-release", "post-release"]).default("pre-release"),
  signals: z.array(z.object({
    name: z.string().min(1),
    status: gateStatusSchema,
    required: z.boolean(),
    critical: z.boolean(),
    evidence: z.string().min(1),
    reason: z.string().optional()
  })).min(1)
});

export type EvaluateReleaseBody = z.infer<typeof evaluateReleaseBodySchema>;
```
</div>

#### src/modules/security/security.routes.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/modules/security/security.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { validateBody } from "../../shared/validation/validate-request.js";
import {
  dockerCheckController,
  kubernetesCheckController,
  projectSecretAuditController,
  scanSecretController,
  securityPolicyController,
  workflowCheckController
} from "./security.controller.js";
import { scanSecretBodySchema } from "./security.schema.js";

export const securityRouter = Router();

securityRouter.get("/policy", securityPolicyController);
securityRouter.post("/scan-secret", validateBody(scanSecretBodySchema), scanSecretController);
securityRouter.get("/secret-check", projectSecretAuditController);
securityRouter.get("/workflow-check", workflowCheckController);
securityRouter.get("/docker-check", dockerCheckController);
securityRouter.get("/k8s-check", kubernetesCheckController);
```
</div>

#### src/modules/security/security.controller.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/modules/security/security.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { auditProjectSecrets, getDockerCheck, getKubernetesCheck, getSecurityPolicy, getWorkflowCheck } from "./security.service.js";
import { scanTextForSecrets } from "../../security/secret-scanner.js";

export const securityPolicyController: RequestHandler = (_request, response) => {
  response.json(getSecurityPolicy());
};

export const scanSecretController: RequestHandler = (request, response) => {
  const body = request.body as { text: string; filePath: string };
  const findings = scanTextForSecrets(body.filePath, body.text);
  response.json({
    status: findings.length === 0 ? "PASS" : "FAIL",
    findingCount: findings.length,
    findings
  });
};

export const projectSecretAuditController: RequestHandler = async (_request, response) => {
  response.json(await auditProjectSecrets());
};

export const workflowCheckController: RequestHandler = (_request, response) => {
  response.json(getWorkflowCheck());
};

export const dockerCheckController: RequestHandler = (_request, response) => {
  response.json(getDockerCheck());
};

export const kubernetesCheckController: RequestHandler = (_request, response) => {
  response.json(getKubernetesCheck());
};
```
</div>

#### src/modules/security/security.service.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/modules/security/security.service.ts</span>
  </div>

```ts
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fromProjectRoot, projectRoot } from "../../release/artifact-hash.js";
import { evaluateDockerPolicy } from "../../security/docker-policy.js";
import { evaluateKubernetesPolicy } from "../../security/kubernetes-policy.js";
import { scanTextForSecrets, type SecretFinding } from "../../security/secret-scanner.js";
import { evaluateWorkflowPolicy } from "../../security/workflow-policy.js";

export interface SecurityAuditResult {
  status: "PASS" | "FAIL";
  findings: SecretFinding[];
  issues: string[];
}

const skippedDirectories = new Set(["node_modules", "dist", "coverage", ".git"]);
const skippedFiles = new Set(["package-lock.json"]);

function listSafeFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!skippedDirectories.has(entry.name)) {
        files.push(...listSafeFiles(fullPath));
      }
      continue;
    }

    if (entry.isFile() && !skippedFiles.has(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function auditProjectSecrets(): Promise<SecurityAuditResult> {
  const issues: string[] = [];
  const findings: SecretFinding[] = [];
  const safeFiles = listSafeFiles(projectRoot);

  for (const file of safeFiles) {
    const name = basename(file);
    const projectRelativePath = relative(projectRoot, file).replace(/\\/g, "/");
    if (name.startsWith(".env") && name !== ".env.example") {
      issues.push("committed env file is not allowed: " + projectRelativePath);
      continue;
    }

    const text = readFileSync(file, "utf8");
    findings.push(...scanTextForSecrets(projectRelativePath, text));
  }

  const envExamplePath = fromProjectRoot(".env.example");
  if (!existsSync(envExamplePath)) {
    issues.push(".env.example is missing");
  }

  return {
    status: issues.length === 0 && findings.length === 0 ? "PASS" : "FAIL",
    findings,
    issues
  };
}

export function getSecurityPolicy() {
  return {
    headers: "helmet",
    cors: "configured-origin",
    rateLimit: "enabled",
    bodyLimit: "100kb",
    errors: "public-problem-details-without-stack",
    secrets: "placeholders-only",
    nodePermissionModel: "defense-in-depth"
  };
}

export function getWorkflowCheck() {
  return evaluateWorkflowPolicy();
}

export function getDockerCheck() {
  return evaluateDockerPolicy();
}

export function getKubernetesCheck() {
  return evaluateKubernetesPolicy();
}
```
</div>

#### src/modules/security/security.schema.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/modules/security/security.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const scanSecretBodySchema = z.object({
  text: z.string().max(20_000),
  filePath: z.string().min(1).max(300).default("request-body.txt")
});

export type ScanSecretBody = z.infer<typeof scanSecretBodySchema>;
```
</div>

#### src/release/gate-model.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/release/gate-model.ts</span>
  </div>

```ts
export type GateStatus = "PASS" | "FAIL" | "UNKNOWN";
export type ReleaseDecision = "promote" | "hold" | "rollback";
export type ReleasePhase = "pre-release" | "post-release";

export interface GateSignal {
  name: string;
  status: GateStatus;
  required: boolean;
  critical: boolean;
  evidence: string;
  reason?: string;
}

export interface ReleaseEvaluation {
  decision: ReleaseDecision;
  phase: ReleasePhase;
  summary: string;
  signals: GateSignal[];
}

export function evaluateReleaseGate(input: { phase: ReleasePhase; signals: GateSignal[] }): ReleaseEvaluation {
  const requiredFailures = input.signals.filter((signal) => signal.required && signal.status === "FAIL");
  const criticalFailures = input.signals.filter((signal) => signal.critical && signal.status === "FAIL");
  const missingRequiredEvidence = input.signals.filter((signal) => signal.required && signal.status === "UNKNOWN");

  if (input.phase === "post-release" && (criticalFailures.length > 0 || requiredFailures.some((signal) => signal.name === "smoke"))) {
    return {
      decision: "rollback",
      phase: input.phase,
      summary: "A post-release critical gate failed, so rollback is the safest release decision.",
      signals: input.signals
    };
  }

  if (requiredFailures.length > 0 || criticalFailures.length > 0) {
    return {
      decision: "hold",
      phase: input.phase,
      summary: "A required release gate failed, so the artifact must not be promoted.",
      signals: input.signals
    };
  }

  if (missingRequiredEvidence.length > 0) {
    return {
      decision: "hold",
      phase: input.phase,
      summary: "Required evidence is missing, and UNKNOWN is not a passing release signal.",
      signals: input.signals
    };
  }

  return {
    decision: "promote",
    phase: input.phase,
    summary: "All required release gates have explicit passing evidence.",
    signals: input.signals
  };
}

export function createDefaultSignals(status: GateStatus): GateSignal[] {
  const names = [
    "typecheck",
    "build",
    "test",
    "audit",
    "secret-scan",
    "workflow-security",
    "docker-hardening",
    "kubernetes-security",
    "smoke",
    "slo-continuity",
    "manual-review"
  ];

  return names.map((name) => ({
    name,
    status,
    required: true,
    critical: ["audit", "secret-scan", "workflow-security", "smoke"].includes(name),
    evidence: "local validation signal"
  }));
}
```
</div>

#### src/release/release-manifest.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/release/release-manifest.ts</span>
  </div>

```ts
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fromProjectRoot, hashFile, hashFiles, listFilesRecursively } from "./artifact-hash.js";
import { evaluateReleaseGate, type GateStatus } from "./gate-model.js";

export interface ReleaseManifest {
  releaseId: string;
  createdAt: string;
  sourceRef: string;
  packageLockHash: string;
  dockerfileHash: string;
  workflowHash: string;
  k8sManifestHash: string;
  sbomPath: string;
  sbomStatus: GateStatus;
  auditStatus: GateStatus;
  testStatus: GateStatus;
  buildStatus: GateStatus;
  smokeStatus: GateStatus;
  securityCheckStatus: GateStatus;
  releaseDecision: string;
  rollbackPlanPath: string;
  limitations: string[];
}

function fileHashOrUnknown(relativePath: string): string {
  const path = fromProjectRoot(relativePath);
  return existsSync(path) ? hashFile(path) : "UNKNOWN";
}

export function generateReleaseManifest(input: {
  auditStatus?: GateStatus;
  testStatus?: GateStatus;
  buildStatus?: GateStatus;
  smokeStatus?: GateStatus;
  securityCheckStatus?: GateStatus;
  sbomStatus?: GateStatus;
} = {}): ReleaseManifest {
  const auditStatus = input.auditStatus ?? "UNKNOWN";
  const testStatus = input.testStatus ?? "UNKNOWN";
  const buildStatus = input.buildStatus ?? "UNKNOWN";
  const smokeStatus = input.smokeStatus ?? "UNKNOWN";
  const securityCheckStatus = input.securityCheckStatus ?? "UNKNOWN";
  const sbomStatus = input.sbomStatus ?? (existsSync(fromProjectRoot("release", "sbom.cdx.json")) ? "PASS" : "UNKNOWN");
  const k8sFiles = listFilesRecursively(fromProjectRoot("k8s"));
  const evaluation = evaluateReleaseGate({
    phase: "pre-release",
    signals: [
      { name: "audit", status: auditStatus, required: true, critical: true, evidence: "npm audit --audit-level=high" },
      { name: "test", status: testStatus, required: true, critical: false, evidence: "npm test" },
      { name: "build", status: buildStatus, required: true, critical: false, evidence: "npm run build" },
      { name: "smoke", status: smokeStatus, required: true, critical: true, evidence: "npm run smoke" },
      { name: "security-check", status: securityCheckStatus, required: true, critical: true, evidence: "security validation scripts" },
      { name: "sbom", status: sbomStatus, required: true, critical: false, evidence: "npm sbom" }
    ]
  });

  return {
    releaseId: "release-local-" + new Date().toISOString().replace(/[:.]/g, "-"),
    createdAt: new Date().toISOString(),
    sourceRef: process.env.COMMIT_SHA ?? "placeholder-source-ref",
    packageLockHash: fileHashOrUnknown("package-lock.json"),
    dockerfileHash: fileHashOrUnknown("Dockerfile"),
    workflowHash: fileHashOrUnknown(join(".github", "workflows", "ci.yml")),
    k8sManifestHash: k8sFiles.length > 0 ? hashFiles(k8sFiles) : "UNKNOWN",
    sbomPath: "release/sbom.cdx.json",
    sbomStatus,
    auditStatus,
    testStatus,
    buildStatus,
    smokeStatus,
    securityCheckStatus,
    releaseDecision: evaluation.decision,
    rollbackPlanPath: "release/rollback-plan.md",
    limitations: [
      "Local evidence does not prove a real production deployment.",
      "No registry image digest is recorded by this local manifest.",
      "No GitHub Actions runtime result exists until the workflow runs in GitHub."
    ]
  };
}

export function writeReleaseManifest(path = fromProjectRoot("release", "release-manifest.generated.json")): ReleaseManifest {
  const manifest = generateReleaseManifest({
    auditStatus: "UNKNOWN",
    testStatus: "UNKNOWN",
    buildStatus: "UNKNOWN",
    smokeStatus: "UNKNOWN",
    securityCheckStatus: "UNKNOWN"
  });
  writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  return manifest;
}
```
</div>

#### src/release/rollback-decision.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/release/rollback-decision.ts</span>
  </div>

```ts
import type { GateSignal, ReleaseDecision, ReleasePhase } from "./gate-model.js";
import { evaluateReleaseGate } from "./gate-model.js";

export interface RollbackDecision {
  decision: ReleaseDecision;
  reason: string;
  requiredEvidence: string[];
}

export function decideRollback(input: { phase: ReleasePhase; signals: GateSignal[] }): RollbackDecision {
  const evaluation = evaluateReleaseGate(input);
  if (evaluation.decision === "rollback") {
    return {
      decision: "rollback",
      reason: evaluation.summary,
      requiredEvidence: ["failed post-release gate", "previous known-good artifact", "smoke result after rollback"]
    };
  }

  if (evaluation.decision === "hold") {
    return {
      decision: "hold",
      reason: evaluation.summary,
      requiredEvidence: ["fixed gate", "rerun validation", "manual release owner review"]
    };
  }

  return {
    decision: "promote",
    reason: evaluation.summary,
    requiredEvidence: ["release manifest", "validation output", "rollback plan"]
  };
}
```
</div>

#### src/release/artifact-hash.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/release/artifact-hash.ts</span>
  </div>

```ts
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function findProjectRoot(start = dirname(fileURLToPath(import.meta.url))): string {
  let current = start;
  while (current !== dirname(current)) {
    if (existsSync(join(current, "package.json"))) {
      return current;
    }
    current = dirname(current);
  }
  throw new Error("Project root was not found.");
}

export const projectRoot = findProjectRoot();

export function fromProjectRoot(...segments: string[]): string {
  return join(projectRoot, ...segments);
}

export function hashFile(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function hashFiles(paths: string[]): string {
  const hash = createHash("sha256");
  for (const path of paths.toSorted()) {
    hash.update(path);
    hash.update("\0");
    hash.update(readFileSync(path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function listFilesRecursively(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const nextPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursively(nextPath));
      continue;
    }
    if (entry.isFile()) {
      files.push(nextPath);
    }
  }

  return files.toSorted();
}
```
</div>

#### src/security/secret-scanner.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/security/secret-scanner.ts</span>
  </div>

```ts
export interface SecretFinding {
  filePath: string;
  line: number;
  kind: string;
}

const tokenPrefixes = [
  { kind: "stripe_live_secret", prefix: ["s", "k", "_", "l", "i", "v", "e"].join("") },
  { kind: "github_token", prefix: ["g", "h", "p", "_"].join("") },
  { kind: "slack_bot_token", prefix: ["x", "o", "x", "b", "-"].join("") },
  { kind: "aws_access_key", prefix: ["A", "K", "I", "A"].join("") }
];

const privateKeyPattern = /BEGIN[\s-]+(?:RSA[\s-]+|EC[\s-]+|OPENSSH[\s-]+)?PRIVATE[\s-]+KEY/;
const assignmentPattern = /^\s*([A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN|KEY)|DATABASE_URL)\s*=\s*(.+?)\s*$/i;

export function isPlaceholderValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized.length === 0 ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized.includes("change-me") ||
    normalized.includes("dummy") ||
    normalized.includes("local") ||
    normalized.includes("test") ||
    normalized.includes("invalid");
}

export function scanTextForSecrets(filePath: string, text: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = text.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    let lineHasSpecificFinding = false;
    for (const tokenPrefix of tokenPrefixes) {
      if (line.includes(tokenPrefix.prefix) && !isPlaceholderValue(line)) {
        findings.push({ filePath, line: index + 1, kind: tokenPrefix.kind });
        lineHasSpecificFinding = true;
      }
    }

    if (privateKeyPattern.test(line) && !isPlaceholderValue(line)) {
      findings.push({ filePath, line: index + 1, kind: "private_key" });
      lineHasSpecificFinding = true;
    }

    const assignmentMatch = assignmentPattern.exec(line);
    if (assignmentMatch) {
      const key = assignmentMatch[1] ?? "";
      const value = assignmentMatch[2] ?? "";
      const sensitiveDatabaseUrl = key.toUpperCase() === "DATABASE_URL" && /^\w+:\/\//.test(value);
      const sensitiveNamedValue = key.toUpperCase() !== "DATABASE_URL";
      if (!lineHasSpecificFinding && (sensitiveDatabaseUrl || sensitiveNamedValue) && !isPlaceholderValue(value)) {
        findings.push({ filePath, line: index + 1, kind: key.toLowerCase() });
      }
    }
  }

  return findings;
}
```
</div>

#### src/security/dependency-policy.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/security/dependency-policy.ts</span>
  </div>

```ts
import { existsSync, readFileSync } from "node:fs";
import { fromProjectRoot } from "../release/artifact-hash.js";

export interface DependencyPolicyResult {
  status: "PASS" | "FAIL";
  issues: string[];
  auditCommand: string;
}

const requiredScripts = [
  "typecheck",
  "build",
  "test",
  "workflow:check",
  "dependency:check",
  "secret:check",
  "docker:check",
  "k8s:security:check",
  "release:check",
  "permission:check",
  "portfolio:check",
  "sbom:generate",
  "release:manifest"
];

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(fromProjectRoot(relativePath), "utf8")) as Record<string, unknown>;
}

function collectLatestVersions(value: unknown, path: string, issues: string[]): void {
  if (typeof value === "string") {
    if (value === "latest") {
      issues.push(path + " uses latest");
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectLatestVersions(entry, path + "[" + index + "]", issues));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      collectLatestVersions(nestedValue, path + "." + key, issues);
    }
  }
}

export function evaluateDependencyPolicy(): DependencyPolicyResult {
  const issues: string[] = [];
  const packageJsonPath = fromProjectRoot("package.json");
  const packageLockPath = fromProjectRoot("package-lock.json");

  if (!existsSync(packageJsonPath)) {
    issues.push("package.json is missing");
  }

  if (!existsSync(packageLockPath)) {
    issues.push("package-lock.json is missing");
  }

  if (existsSync(packageJsonPath)) {
    const packageJson = readJson("package.json");
    const scripts = packageJson.scripts && typeof packageJson.scripts === "object" ? packageJson.scripts as Record<string, unknown> : {};
    for (const scriptName of requiredScripts) {
      if (typeof scripts[scriptName] !== "string") {
        issues.push("script missing: " + scriptName);
      }
    }
    collectLatestVersions(packageJson.dependencies, "dependencies", issues);
    collectLatestVersions(packageJson.devDependencies, "devDependencies", issues);
  }

  if (existsSync(packageLockPath)) {
    const packageLock = readJson("package-lock.json");
    collectLatestVersions(packageLock, "package-lock", issues);
  }

  return {
    status: issues.length === 0 ? "PASS" : "FAIL",
    issues,
    auditCommand: "npm audit --audit-level=high"
  };
}
```
</div>

#### src/security/workflow-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/security/workflow-check.ts</span>
  </div>

```ts
export { evaluateWorkflowPolicy } from "./workflow-policy.js";
```
</div>

#### src/security/workflow-policy.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/security/workflow-policy.ts</span>
  </div>

```ts
import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { fromProjectRoot } from "../release/artifact-hash.js";

export interface WorkflowPolicyResult {
  status: "PASS" | "FAIL";
  issues: string[];
}

const unsafeContextFragments = [
  "github.event.pull_request.title",
  "github.event.pull_request.body",
  "github.head_ref",
  "github.event.issue.body",
  "github.event.comment.body"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function walk(value: unknown, visitor: (value: unknown, path: string[]) => void, path: string[] = []): void {
  visitor(value, path);

  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, visitor, path.concat(String(index))));
    return;
  }

  if (isRecord(value)) {
    for (const [key, nestedValue] of Object.entries(value)) {
      walk(nestedValue, visitor, path.concat(key));
    }
  }
}

function validatePermissions(value: unknown, location: string, issues: string[]): void {
  if (value === undefined) {
    issues.push(location + " permissions are missing");
    return;
  }

  if (value === "write-all") {
    issues.push(location + " uses write-all permissions");
    return;
  }

  if (isRecord(value)) {
    for (const [permissionName, permissionValue] of Object.entries(value)) {
      if (typeof permissionValue === "string" && permissionValue.toLowerCase().includes("write")) {
        issues.push(location + " grants write permission for " + permissionName);
      }
    }
  }
}

export function evaluateWorkflowPolicy(relativePath = ".github/workflows/ci.yml"): WorkflowPolicyResult {
  const workflowPath = fromProjectRoot(relativePath);
  const issues: string[] = [];

  if (!existsSync(workflowPath)) {
    return { status: "FAIL", issues: ["workflow file is missing"] };
  }

  const source = readFileSync(workflowPath, "utf8");
  const workflow = parse(source) as unknown;
  if (!isRecord(workflow)) {
    return { status: "FAIL", issues: ["workflow root is not an object"] };
  }

  const eventConfig = workflow.on ?? workflow["on"];
  if (isRecord(eventConfig) && Object.prototype.hasOwnProperty.call(eventConfig, "pull_request_target")) {
    issues.push("pull_request_target is not allowed for this learning workflow");
  }

  validatePermissions(workflow.permissions, "root", issues);

  const jobs = workflow.jobs;
  if (!isRecord(jobs)) {
    issues.push("jobs are missing");
  } else {
    for (const [jobName, jobValue] of Object.entries(jobs)) {
      if (isRecord(jobValue)) {
        validatePermissions(jobValue.permissions, "job " + jobName, issues);
      }
    }
  }

  walk(workflow, (value, path) => {
    if (typeof value !== "string") {
      return;
    }

    if (path.at(-1) === "uses" && !/@[0-9a-f]{40}$/i.test(value)) {
      issues.push("uses reference is not pinned to a full commit SHA at " + path.join("."));
    }

    if (path.at(-1) === "run") {
      if (/\$\{\{\s*secrets\./i.test(value)) {
        issues.push("run step references secrets directly at " + path.join("."));
      }

      for (const fragment of unsafeContextFragments) {
        if (value.includes(fragment)) {
          issues.push("run step interpolates untrusted context " + fragment);
        }
      }
    }
  });

  return { status: issues.length === 0 ? "PASS" : "FAIL", issues };
}
```
</div>

#### src/security/docker-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/security/docker-check.ts</span>
  </div>

```ts
export { evaluateDockerPolicy } from "./docker-policy.js";
```
</div>

#### src/security/docker-policy.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/security/docker-policy.ts</span>
  </div>

```ts
import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { fromProjectRoot } from "../release/artifact-hash.js";

export interface DockerPolicyResult {
  status: "PASS" | "FAIL";
  issues: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function includesLine(source: string, pattern: RegExp): boolean {
  return source.split(/\r?\n/).some((line) => pattern.test(line.trim()));
}

export function evaluateDockerPolicy(): DockerPolicyResult {
  const issues: string[] = [];
  const dockerfilePath = fromProjectRoot("Dockerfile");
  const dockerignorePath = fromProjectRoot(".dockerignore");
  const composePath = fromProjectRoot("compose.yaml");

  if (!existsSync(dockerfilePath)) {
    issues.push("Dockerfile is missing");
  } else {
    const dockerfile = readFileSync(dockerfilePath, "utf8");
    const fromCount = dockerfile.split(/\r?\n/).filter((line) => /^FROM\s+/i.test(line.trim())).length;
    if (fromCount < 2) issues.push("Dockerfile is not multi-stage");
    if (!includesLine(dockerfile, /^RUN\s+npm\s+ci\b/i)) issues.push("Dockerfile does not use npm ci");
    if (!includesLine(dockerfile, /^USER\s+appuser\b/i)) issues.push("Dockerfile does not use the non-root runtime user");
    if (/\bARG\b.*(?:SECRET|TOKEN|PASSWORD|KEY)/i.test(dockerfile)) issues.push("Dockerfile uses build arguments for sensitive values");
    if (/\bENV\b.*(?:SECRET|TOKEN|PASSWORD|KEY)/i.test(dockerfile)) issues.push("Dockerfile uses environment variables for sensitive values");
    if (!includesLine(dockerfile, /^HEALTHCHECK\b/i)) issues.push("Dockerfile does not define HEALTHCHECK");
  }

  if (!existsSync(dockerignorePath)) {
    issues.push(".dockerignore is missing");
  } else {
    const dockerignore = readFileSync(dockerignorePath, "utf8");
    for (const requiredEntry of ["node_modules", "dist", "coverage", ".env", ".git"]) {
      if (!dockerignore.split(/\r?\n/).includes(requiredEntry)) {
        issues.push(".dockerignore does not exclude " + requiredEntry);
      }
    }
  }

  if (!existsSync(composePath)) {
    issues.push("compose.yaml is missing");
  } else {
    const compose = parse(readFileSync(composePath, "utf8")) as unknown;
    const services = isRecord(compose) && isRecord(compose.services) ? compose.services : {};
    if (!isRecord(services.api)) issues.push("compose api service is missing");
    if (!isRecord(services.nginx)) issues.push("compose nginx service is missing");
    if (isRecord(services.nginx)) {
      const ports = Array.isArray(services.nginx.ports) ? services.nginx.ports : [];
      if (!ports.includes("8080:80")) issues.push("nginx does not expose host port 8080");
    }
  }

  return { status: issues.length === 0 ? "PASS" : "FAIL", issues };
}
```
</div>

#### src/security/k8s-security-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/security/k8s-security-check.ts</span>
  </div>

```ts
export { evaluateKubernetesPolicy } from "./kubernetes-policy.js";
```
</div>

#### src/security/kubernetes-policy.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/security/kubernetes-policy.ts</span>
  </div>

```ts
import { existsSync, readFileSync } from "node:fs";
import { parseAllDocuments } from "yaml";
import { fromProjectRoot } from "../release/artifact-hash.js";
import { scanTextForSecrets } from "./secret-scanner.js";

export interface KubernetesPolicyResult {
  status: "PASS" | "FAIL";
  issues: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function loadYamlDocuments(relativePath: string): unknown[] {
  const path = fromProjectRoot(relativePath);
  if (!existsSync(path)) return [];
  return parseAllDocuments(readFileSync(path, "utf8")).map((document) => document.toJSON());
}

function findKind(documents: unknown[], kind: string): Record<string, unknown> | undefined {
  return documents.find((document): document is Record<string, unknown> => isRecord(document) && document.kind === kind);
}

export function evaluateKubernetesPolicy(): KubernetesPolicyResult {
  const issues: string[] = [];
  const requiredFiles = [
    "k8s/namespace.yaml",
    "k8s/configmap.yaml",
    "k8s/secret.example.yaml",
    "k8s/deployment.yaml",
    "k8s/service.yaml"
  ];

  for (const file of requiredFiles) {
    if (!existsSync(fromProjectRoot(file))) {
      issues.push(file + " is missing");
    }
  }

  const deployment = findKind(loadYamlDocuments("k8s/deployment.yaml"), "Deployment");
  const service = findKind(loadYamlDocuments("k8s/service.yaml"), "Service");
  if (!deployment) {
    issues.push("Deployment manifest is missing");
  }

  if (deployment) {
    const spec = isRecord(deployment.spec) ? deployment.spec : {};
    const template = isRecord(spec.template) ? spec.template : {};
    const templateMetadata = isRecord(template.metadata) ? template.metadata : {};
    const podLabels = isRecord(templateMetadata.labels) ? templateMetadata.labels : {};
    const podSpec = isRecord(template.spec) ? template.spec : {};
    const podSecurityContext = isRecord(podSpec.securityContext) ? podSpec.securityContext : {};
    const containers = Array.isArray(podSpec.containers) ? podSpec.containers : [];
    const firstContainer = isRecord(containers[0]) ? containers[0] : {};
    const containerSecurityContext = isRecord(firstContainer.securityContext) ? firstContainer.securityContext : {};
    const capabilities = isRecord(containerSecurityContext.capabilities) ? containerSecurityContext.capabilities : {};
    const resources = isRecord(firstContainer.resources) ? firstContainer.resources : {};
    const requests = isRecord(resources.requests) ? resources.requests : {};
    const limits = isRecord(resources.limits) ? resources.limits : {};
    const seccompProfile = isRecord(containerSecurityContext.seccompProfile) ? containerSecurityContext.seccompProfile : podSecurityContext.seccompProfile;

    if (podSecurityContext.runAsNonRoot !== true && containerSecurityContext.runAsNonRoot !== true) issues.push("runAsNonRoot is not true");
    if (containerSecurityContext.allowPrivilegeEscalation !== false) issues.push("allowPrivilegeEscalation is not false");
    if (containerSecurityContext.readOnlyRootFilesystem !== true) issues.push("readOnlyRootFilesystem is not true");
    if (!Array.isArray(capabilities.drop) || !capabilities.drop.includes("ALL")) issues.push("capabilities.drop does not include ALL");
    if (!isRecord(seccompProfile) || seccompProfile.type !== "RuntimeDefault") issues.push("seccompProfile RuntimeDefault is missing");
    if (typeof requests.cpu !== "string" || typeof requests.memory !== "string") issues.push("resource requests are incomplete");
    if (typeof limits.cpu !== "string" || typeof limits.memory !== "string") issues.push("resource limits are incomplete");
    if (!isRecord(firstContainer.livenessProbe)) issues.push("livenessProbe is missing");
    if (!isRecord(firstContainer.readinessProbe)) issues.push("readinessProbe is missing");

    if (service) {
      const serviceSpec = isRecord(service.spec) ? service.spec : {};
      const selector = isRecord(serviceSpec.selector) ? serviceSpec.selector : {};
      for (const [key, value] of Object.entries(selector)) {
        if (podLabels[key] !== value) {
          issues.push("Service selector does not match Deployment pod label " + key);
        }
      }
    }
  }

  const secretPath = fromProjectRoot("k8s/secret.example.yaml");
  if (existsSync(secretPath)) {
    const secretText = readFileSync(secretPath, "utf8");
    const findings = scanTextForSecrets("k8s/secret.example.yaml", secretText);
    if (findings.length > 0) {
      issues.push("secret.example.yaml contains secret-looking values");
    }
  }

  const manifestTexts = requiredFiles.filter((file) => existsSync(fromProjectRoot(file))).map((file) => readFileSync(fromProjectRoot(file), "utf8")).join("\n");
  if (/cloud\.google|amazonaws|azure\.com|service\.beta\.kubernetes\.io/i.test(manifestTexts)) {
    issues.push("cloud provider annotation or endpoint is present");
  }

  return { status: issues.length === 0 ? "PASS" : "FAIL", issues };
}
```
</div>

#### src/security/node-permission-demo.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/security/node-permission-demo.ts</span>
  </div>

```ts
interface PermissionApi {
  has(scope: string, reference?: string): boolean;
}

type ProcessWithPermission = typeof process & {
  permission?: PermissionApi;
};

export interface PermissionDemoResult {
  model: string;
  permissionApiAvailable: boolean;
  fsReadAllowedForEntry: boolean | "UNKNOWN";
  runtimeBoundary: string;
  typeScriptBoundary: string;
}

export function runPermissionDemo(): PermissionDemoResult {
  const permission = (process as ProcessWithPermission).permission;
  return {
    model: "Node executes trusted JavaScript by default.",
    permissionApiAvailable: Boolean(permission),
    fsReadAllowedForEntry: permission ? permission.has("fs.read") : "UNKNOWN",
    runtimeBoundary: "Permission flags can restrict selected runtime resources when Node starts.",
    typeScriptBoundary: "TypeScript types do not grant or deny runtime operating-system permissions."
  };
}

if (import.meta.url === new URL(process.argv[1] ?? "", "file:").href) {
  console.log(JSON.stringify(runPermissionDemo(), null, 2));
}
```
</div>

#### src/platform/workflow-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/platform/workflow-check.ts</span>
  </div>

```ts
export { evaluateWorkflowPolicy } from "../security/workflow-policy.js";
```
</div>

#### src/platform/docker-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/platform/docker-check.ts</span>
  </div>

```ts
export { evaluateDockerPolicy } from "../security/docker-policy.js";
```
</div>

#### src/platform/k8s-security-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/platform/k8s-security-check.ts</span>
  </div>

```ts
export { evaluateKubernetesPolicy } from "../security/kubernetes-policy.js";
```
</div>

#### src/platform/release-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/platform/release-check.ts</span>
  </div>

```ts
import { evaluateReleaseGate, type GateSignal } from "../release/gate-model.js";
import { evaluateDependencyPolicy } from "../security/dependency-policy.js";
import { evaluateDockerPolicy } from "../security/docker-policy.js";
import { evaluateKubernetesPolicy } from "../security/kubernetes-policy.js";
import { auditProjectSecrets } from "../modules/security/security.service.js";
import { evaluateWorkflowPolicy } from "../security/workflow-policy.js";

function signal(name: string, status: "PASS" | "FAIL", evidence: string, critical: boolean): GateSignal {
  return { name, status, required: true, critical, evidence };
}

export async function evaluateLocalReleaseReadiness() {
  const workflow = evaluateWorkflowPolicy();
  const dependency = evaluateDependencyPolicy();
  const docker = evaluateDockerPolicy();
  const kubernetes = evaluateKubernetesPolicy();
  const secret = await auditProjectSecrets();

  return evaluateReleaseGate({
    phase: "pre-release",
    signals: [
      signal("workflow-security", workflow.status, "npm run workflow:check", true),
      signal("dependency-policy", dependency.status, "npm run dependency:check", false),
      signal("secret-scan", secret.status, "npm run secret:check", true),
      signal("docker-hardening", docker.status, "npm run docker:check", false),
      signal("kubernetes-security", kubernetes.status, "npm run k8s:security:check", false)
    ]
  });
}
```
</div>

#### src/platform/portfolio-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/platform/portfolio-check.ts</span>
  </div>

```ts
import { existsSync, readFileSync } from "node:fs";
import { fromProjectRoot } from "../release/artifact-hash.js";

export interface PortfolioCheckResult {
  status: "PASS" | "FAIL";
  issues: string[];
}

export function evaluatePortfolioEvidence(): PortfolioCheckResult {
  const issues: string[] = [];
  const evidencePath = fromProjectRoot("release", "portfolio-evidence.md");
  const readmePath = fromProjectRoot("README.md");

  if (!existsSync(evidencePath)) issues.push("portfolio evidence file is missing");
  if (!existsSync(readmePath)) issues.push("README.md is missing");

  if (existsSync(evidencePath)) {
    const evidence = readFileSync(evidencePath, "utf8");
    for (const requiredPhrase of ["local production-release readiness lab", "not be described as a real production deployment", "npm run workflow:check"]) {
      if (!evidence.includes(requiredPhrase)) {
        issues.push("portfolio evidence is missing: " + requiredPhrase);
      }
    }
  }

  if (existsSync(readmePath)) {
    const readme = readFileSync(readmePath, "utf8");
    if (!readme.includes("This is not a real cloud deployment")) {
      issues.push("README does not state the deployment boundary");
    }
  }

  return { status: issues.length === 0 ? "PASS" : "FAIL", issues };
}
```
</div>

#### src/shared/errors/http-error.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/shared/errors/http-error.ts</span>
  </div>

```ts
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly expose: boolean;
  public readonly details?: unknown;

  public constructor(statusCode: number, code: string, message: string, options: { expose?: boolean; details?: unknown } = {}) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    this.expose = options.expose ?? statusCode < 500;
    this.details = options.details;
  }
}
```
</div>

#### src/shared/errors/problem-details.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/shared/errors/problem-details.ts</span>
  </div>

```ts
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  requestId: string;
  code: string;
}

export function createProblemDetails(input: {
  status: number;
  title: string;
  detail: string;
  instance: string;
  requestId: string;
  code: string;
}): ProblemDetails {
  return {
    type: "about:blank",
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: input.instance,
    requestId: input.requestId,
    code: input.code
  };
}
```
</div>

#### src/shared/errors/error-middleware.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/shared/errors/error-middleware.ts</span>
  </div>

```ts
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "./http-error.js";
import { createProblemDetails } from "./problem-details.js";

function publicMessage(error: unknown): { status: number; title: string; detail: string; code: string } {
  if (error instanceof HttpError) {
    return {
      status: error.statusCode,
      title: error.code,
      detail: error.expose ? error.message : "The request could not be completed.",
      code: error.code
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      title: "invalid_request",
      detail: "The request body did not match the expected schema.",
      code: "invalid_request"
    };
  }

  return {
    status: 500,
    title: "internal_error",
    detail: "The request could not be completed.",
    code: "internal_error"
  };
}

export const errorMiddleware: ErrorRequestHandler = (error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const requestId = typeof response.locals.requestId === "string" ? response.locals.requestId : "unknown-request";
  const message = publicMessage(error);

  response.status(message.status).json(createProblemDetails({
    status: message.status,
    title: message.title,
    detail: message.detail,
    instance: request.originalUrl,
    requestId,
    code: message.code
  }));
};
```
</div>

#### src/shared/middleware/request-id.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/shared/middleware/request-id.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestIdMiddleware: RequestHandler = (request, response, next) => {
  const headerValue = request.header("x-request-id");
  const requestId = headerValue && headerValue.length <= 128 ? headerValue : randomUUID();
  response.locals.requestId = requestId;
  response.setHeader("x-request-id", requestId);
  next();
};
```
</div>

#### src/shared/middleware/not-found.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/shared/middleware/not-found.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

export const notFoundMiddleware: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, "not_found", "The requested resource was not found.", { expose: true, details: { path: request.path } }));
};
```
</div>

#### src/shared/validation/validate-request.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/src/shared/validation/validate-request.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (request, _response, next) => {
    const parsed = schema.parse(request.body);
    request.body = parsed;
    next();
  };
}
```
</div>

#### scripts/smoke-test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/smoke-test.ts</span>
  </div>

```ts
import http from "node:http";
import https from "node:https";

const target = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
const endpoints = [
  "/v1/health/ready",
  "/v1/release/manifest",
  "/v1/security/policy"
];

function requestEndpoint(url: URL): Promise<{ status: number; ok: boolean; bytes: number }> {
  const transport = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const request = transport.get(url, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => {
        const status = response.statusCode ?? 0;
        resolve({
          status,
          ok: status >= 200 && status < 300,
          bytes: Buffer.concat(chunks).length
        });
      });
    });

    request.setTimeout(5_000, () => {
      request.destroy(new Error("smoke request timed out"));
    });
    request.on("error", reject);
  });
}

const results = [];
for (const endpoint of endpoints) {
  const result = await requestEndpoint(new URL(endpoint, target));
  results.push({ endpoint, ...result });
}

const failed = results.filter((result) => !result.ok);
console.log(JSON.stringify({
  status: failed.length === 0 ? "PASS" : "FAIL",
  target,
  results
}, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
```
</div>

#### scripts/workflow-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/workflow-check.ts</span>
  </div>

```ts
import { evaluateWorkflowPolicy } from "../src/security/workflow-policy.js";

const result = evaluateWorkflowPolicy();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
```
</div>

#### scripts/dependency-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/dependency-check.ts</span>
  </div>

```ts
import { evaluateDependencyPolicy } from "../src/security/dependency-policy.js";

const result = evaluateDependencyPolicy();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
```
</div>

#### scripts/secret-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/secret-check.ts</span>
  </div>

```ts
import { auditProjectSecrets } from "../src/modules/security/security.service.js";

const result = await auditProjectSecrets();
console.log(JSON.stringify({
  status: result.status,
  findingCount: result.findings.length,
  issues: result.issues,
  findings: result.findings
}, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
```
</div>

#### scripts/docker-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/docker-check.ts</span>
  </div>

```ts
import { evaluateDockerPolicy } from "../src/security/docker-policy.js";

const result = evaluateDockerPolicy();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
```
</div>

#### scripts/k8s-security-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/k8s-security-check.ts</span>
  </div>

```ts
import { evaluateKubernetesPolicy } from "../src/security/kubernetes-policy.js";

const result = evaluateKubernetesPolicy();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
```
</div>

#### scripts/release-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/release-check.ts</span>
  </div>

```ts
import { evaluateLocalReleaseReadiness } from "../src/platform/release-check.js";

const result = await evaluateLocalReleaseReadiness();
console.log(JSON.stringify(result, null, 2));
process.exit(result.decision === "promote" ? 0 : 1);
```
</div>

#### scripts/permission-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/permission-check.ts</span>
  </div>

```ts
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fromProjectRoot } from "../src/release/artifact-hash.js";

const target = fromProjectRoot("dist", "src", "security", "node-permission-demo.js");

if (!existsSync(target)) {
  console.log(JSON.stringify({
    status: "UNKNOWN",
    reason: "Build output is missing. Run npm run build before checking runtime permission flags."
  }, null, 2));
  process.exit(0);
}

const result = spawnSync(process.execPath, ["--permission", target], {
  cwd: fromProjectRoot(),
  encoding: "utf8"
});

const combinedOutput = (result.stdout ?? "") + (result.stderr ?? "");
if (/bad option|unknown option|not allowed in NODE_OPTIONS/i.test(combinedOutput)) {
  console.log(JSON.stringify({
    status: "UNKNOWN",
    reason: "This Node runtime does not support the permission flag used by the demo."
  }, null, 2));
  process.exit(0);
}

console.log(JSON.stringify({
  status: result.status === 0 ? "PASS" : "FAIL",
  exitCode: result.status,
  output: combinedOutput.trim()
}, null, 2));
process.exit(result.status === 0 ? 0 : 1);
```
</div>

#### scripts/portfolio-check.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/portfolio-check.ts</span>
  </div>

```ts
import { evaluatePortfolioEvidence } from "../src/platform/portfolio-check.js";

const result = evaluatePortfolioEvidence();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === "PASS" ? 0 : 1);
```
</div>

#### scripts/generate-release-manifest.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/generate-release-manifest.ts</span>
  </div>

```ts
import { writeReleaseManifest } from "../src/release/release-manifest.js";

const manifest = writeReleaseManifest();
console.log(JSON.stringify({
  status: "PASS",
  path: "release/release-manifest.generated.json",
  releaseDecision: manifest.releaseDecision
}, null, 2));
```
</div>

#### scripts/generate-sbom.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/generate-sbom.ts</span>
  </div>

```ts
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fromProjectRoot } from "../src/release/artifact-hash.js";

const npmCliPath = process.env.npm_execpath;
const command = npmCliPath ? process.execPath : process.platform === "win32" ? "npm.cmd" : "npm";
const args = npmCliPath
  ? [npmCliPath, "sbom", "--sbom-format=cyclonedx", "--json"]
  : ["sbom", "--sbom-format=cyclonedx", "--json"];
const result = spawnSync(command, args, {
  cwd: fromProjectRoot(),
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024
});

if (result.status !== 0 || !result.stdout.trim()) {
  console.log(JSON.stringify({
    status: "UNKNOWN",
    reason: (result.error?.message || result.stderr || result.stdout || "npm sbom did not produce output").trim()
  }, null, 2));
  process.exit(0);
}

const target = fromProjectRoot("release", "sbom.cdx.json");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, result.stdout, "utf8");
console.log(JSON.stringify({
  status: "PASS",
  path: "release/sbom.cdx.json"
}, null, 2));
```
</div>

#### scripts/wait-for-ready.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/scripts/wait-for-ready.ts</span>
  </div>

```ts
const target = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
const deadline = Date.now() + 30_000;

while (Date.now() < deadline) {
  try {
    const response = await fetch(target + "/v1/health/ready");
    if (response.ok) {
      console.log(JSON.stringify({ status: "PASS", target }));
      process.exit(0);
    }
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

console.log(JSON.stringify({ status: "FAIL", target, reason: "readiness endpoint did not become ready" }));
process.exit(1);
```
</div>

#### tests/env.unit.test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tests/env.unit.test.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { env } from "../src/config/env.js";

test("env parser provides local release defaults", () => {
  assert.equal(typeof env.PORT, "number");
  assert.equal(env.RELEASE_VERSION.length > 0, true);
});
```
</div>

#### tests/release-gate.unit.test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tests/release-gate.unit.test.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultSignals, evaluateReleaseGate } from "../src/release/gate-model.js";

test("release gate promotes only when required evidence passes", () => {
  const result = evaluateReleaseGate({ phase: "pre-release", signals: createDefaultSignals("PASS") });
  assert.equal(result.decision, "promote");
});

test("release gate holds when required evidence is unknown", () => {
  const result = evaluateReleaseGate({ phase: "pre-release", signals: createDefaultSignals("UNKNOWN") });
  assert.equal(result.decision, "hold");
});
```
</div>

#### tests/rollback-decision.unit.test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tests/rollback-decision.unit.test.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultSignals } from "../src/release/gate-model.js";
import { decideRollback } from "../src/release/rollback-decision.js";

test("post-release smoke failure triggers rollback decision", () => {
  const signals = createDefaultSignals("PASS");
  const smoke = signals.find((signal) => signal.name === "smoke");
  assert.ok(smoke);
  smoke.status = "FAIL";
  const result = decideRollback({ phase: "post-release", signals });
  assert.equal(result.decision, "rollback");
});
```
</div>

#### tests/secret-scanner.unit.test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tests/secret-scanner.unit.test.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { isPlaceholderValue, scanTextForSecrets } from "../src/security/secret-scanner.js";

test("secret scanner allows placeholders", () => {
  assert.equal(isPlaceholderValue("placeholder-api-token"), true);
  assert.equal(scanTextForSecrets(".env.example", "API_TOKEN=placeholder-api-token").length, 0);
});

test("secret scanner detects token-like values without printing them", () => {
  const token = ["g", "h", "p", "_", "samplevalue"].join("");
  const findings = scanTextForSecrets("sample.txt", "TOKEN=" + token);
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.kind, "github_token");
});
```
</div>

#### tests/dependency-policy.unit.test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tests/dependency-policy.unit.test.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { evaluateDependencyPolicy } from "../src/security/dependency-policy.js";

test("dependency policy accepts locked non-latest dependencies", () => {
  const result = evaluateDependencyPolicy();
  assert.equal(result.status, "PASS");
  assert.equal(result.auditCommand, "npm audit --audit-level=high");
});
```
</div>

#### tests/workflow-policy.unit.test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tests/workflow-policy.unit.test.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { evaluateWorkflowPolicy } from "../src/security/workflow-policy.js";

test("workflow policy validates least privilege and pinned actions", () => {
  const result = evaluateWorkflowPolicy();
  assert.equal(result.status, "PASS", result.issues.join("\n"));
});
```
</div>

#### tests/docker-policy.unit.test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tests/docker-policy.unit.test.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { evaluateDockerPolicy } from "../src/security/docker-policy.js";

test("docker policy validates runtime hardening", () => {
  const result = evaluateDockerPolicy();
  assert.equal(result.status, "PASS", result.issues.join("\n"));
});
```
</div>

#### tests/kubernetes-policy.unit.test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tests/kubernetes-policy.unit.test.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { evaluateKubernetesPolicy } from "../src/security/kubernetes-policy.js";

test("kubernetes policy validates securityContext controls", () => {
  const result = evaluateKubernetesPolicy();
  assert.equal(result.status, "PASS", result.issues.join("\n"));
});
```
</div>

#### tests/release-manifest.unit.test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tests/release-manifest.unit.test.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { generateReleaseManifest } from "../src/release/release-manifest.js";

test("release manifest records local evidence hashes", () => {
  const manifest = generateReleaseManifest({
    auditStatus: "PASS",
    testStatus: "PASS",
    buildStatus: "PASS",
    smokeStatus: "PASS",
    securityCheckStatus: "PASS",
    sbomStatus: "PASS"
  });
  assert.equal(manifest.releaseDecision, "promote");
  assert.notEqual(manifest.dockerfileHash, "UNKNOWN");
});
```
</div>

#### tests/api.integration.test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tests/api.integration.test.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/api/app.js";

test("health and release endpoints respond", async () => {
  const app = createApp();
  const health = await request(app).get("/v1/health/ready").expect(200);
  assert.equal(health.body.status, "ok");

  const manifest = await request(app).get("/v1/release/manifest").expect(200);
  assert.equal(typeof manifest.body.releaseDecision, "string");
});

test("release evaluation rejects missing evidence as hold", async () => {
  const app = createApp();
  const response = await request(app)
    .post("/v1/release/evaluate")
    .send({
      phase: "pre-release",
      signals: [
        { name: "test", status: "UNKNOWN", required: true, critical: false, evidence: "npm test" }
      ]
    })
    .expect(200);
  assert.equal(response.body.decision, "hold");
});
```
</div>

#### tests/security.integration.test.ts

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/final-production-release-lab/tests/security.integration.test.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/api/app.js";

test("security policy endpoint exposes safe policy signals", async () => {
  const response = await request(createApp()).get("/v1/security/policy").expect(200);
  assert.equal(response.body.headers, "helmet");
});

test("public errors do not expose stack traces", async () => {
  const response = await request(createApp()).get("/missing-route").expect(404);
  assert.equal(typeof response.body.stack, "undefined");
  assert.equal(response.body.code, "not_found");
});

test("secret scan endpoint returns finding metadata only", async () => {
  const token = ["s", "k", "_", "l", "i", "v", "e", "_", "samplevalue"].join("");
  const response = await request(createApp())
    .post("/v1/security/scan-secret")
    .send({ filePath: "input.txt", text: "TOKEN=" + token })
    .expect(200);
  assert.equal(response.body.status, "FAIL");
  assert.equal(response.body.findings[0].kind, "stripe_live_secret");
  assert.equal(JSON.stringify(response.body).includes(token), false);
});
```
</div>

## 15. 知识迁移与真实项目场景

<a id="section-15"></a>

迁移到真实项目时，你要把 local static checks 接到 remote CI required checks，把 SBOM 和 manifest 接到 artifact registry，把 Docker build 结果接到 image digest，把 Kubernetes manifest 接到 admission/run evidence，把 smoke 接到真实入口，把 SLO gate 接到监控系统。迁移时不要改变 claim boundary：没有远程证据，就不写远程结论。

## 16. 本章复盘任务

<a id="section-16"></a>

1. 解释 npm install 与 npm ci 的差异，并说明 package-lock 为什么是 release evidence。
2. 打开 .github/workflows/ci.yml，逐层说出 event、workflow、job、step、runner、uses 和 run 的边界。
3. 说明 pull_request_target 的风险为什么取决于 base repository context 与 checked-out code。
4. 说明 release:check 与 release:manifest 为什么可能给出不同 decision。
5. 说明 portfolio README 中哪些话可以说，哪些话必须等真实 deployment evidence 出现后才能说。

## 17. 最终心智模型

<a id="section-17"></a>

最终记忆：发布安全是一组跨层证据，不是一条成功日志。local gate、CI gate、dependency evidence、secret boundary、API security、Node permission boundary、Docker hardening、Kubernetes securityContext、SBOM、manifest、rollback 和 portfolio claim 都要各自说明 owner、command、artifact、failure mode 和 proof boundary。

## 18. 官方资料

<a id="section-18"></a>

- Node.js Permissions API: https://nodejs.org/api/permissions.html
- GitHub Actions workflow syntax: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- GitHub Actions secure use: https://docs.github.com/en/actions/reference/security/secure-use
- GitHub GITHUB_TOKEN: https://docs.github.com/en/actions/tutorials/authenticate-with-github_token
- GitHub secrets: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
- GitHub dependency review: https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review
- GitHub secret scanning: https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning
- npm ci: https://docs.npmjs.com/cli/v11/commands/npm-ci
- npm package-lock.json: https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json
- npm audit: https://docs.npmjs.com/cli/v11/commands/npm-audit
- npm sbom: https://docs.npmjs.com/cli/v11/commands/npm-sbom
- npm scripts: https://docs.npmjs.com/cli/v11/using-npm/scripts
- Dockerfile reference: https://docs.docker.com/reference/dockerfile/
- Docker build context: https://docs.docker.com/build/concepts/context/
- Docker build secrets: https://docs.docker.com/build/building/secrets/
- Docker Compose services: https://docs.docker.com/reference/compose-file/services/
- Kubernetes Deployment: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- Kubernetes Service: https://kubernetes.io/docs/concepts/services-networking/service/
- Kubernetes ConfigMap: https://kubernetes.io/docs/concepts/configuration/configmap/
- Kubernetes Secret: https://kubernetes.io/docs/concepts/configuration/secret/
- Kubernetes probes: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- Kubernetes security context: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
- Express security best practices: https://expressjs.com/en/advanced/best-practice-security/
- OWASP Node.js Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
