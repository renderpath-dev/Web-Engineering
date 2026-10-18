# Node.js 第 14 章 API 契约治理面试题

## 1. 为什么 API contract 不是普通接口文档？

因为 contract 是客户端、测试、SDK、发布门禁能共同读取和验证的公共承诺；普通文档通常不能自动发现实现漂移。

## 2. 为什么 TypeScript type 不能替代 Zod runtime validation？

TypeScript 在编译期检查并在运行时被擦除；HTTP body、query、headers 和 cookies 是外部输入，必须在 Node runtime 中解析。

## 3. operationId 的工程价值是什么？

它给每个 operation 一个稳定机器可读身份，用于 SDK、测试、drift detection、metrics 和 release report。

## 4. 为什么 SDK 不能导入 Prisma model？

Prisma model 是服务端持久化边界，SDK 是消费者边界；泄露它会把数据库 schema 变成公共 API。

## 5. 为什么 metrics 不能使用 raw URL？

raw URL 往往包含资源 ID 或搜索参数，会产生高基数标签并污染观测系统。

## 6. 怎样判断一个变更是否 breaking？

如果现有客户端在不改代码的情况下可能解析失败、分支错误或语义误判，它就是 breaking 或至少需要人工评审。

## 7. Deprecation header 和 Sunset header 分别解决什么？

Deprecation 表示资源已被弃用；Sunset 表示资源未来可能停止响应的时间点。

## 8. 为什么本项目使用 OpenAPI 3.1.1？

官方已发布 3.2.0，但本地项目只引入 YAML 解析和结构检查，不假设 3.2 专用 validator 支持，因此选择 3.1.1。
