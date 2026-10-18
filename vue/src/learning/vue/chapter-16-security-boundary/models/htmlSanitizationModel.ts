export type RichTextDecision = "allowed" | "blocked" | "requires-backend-review";

export interface RichTextReview {
  readonly sourceLabel: string;
  readonly tagName: string;
  readonly attributeNames: ReadonlyArray<string>;
  readonly decision: RichTextDecision;
  readonly reason: string;
}

const allowedTags = new Set(["strong", "em", "p", "ul", "ol", "li"]);
const allowedAttributes = new Set(["class"]);
const blockedTags = new Set(["script", "iframe", "object", "embed"]);
const blockedAttributes = new Set(["onclick", "onerror", "style"]);

export function classifyRichTextInput(
  sourceLabel: string,
  tagName: string,
  attributeNames: ReadonlyArray<string>,
): RichTextReview {
  const normalizedTag = tagName.toLowerCase();
  const normalizedAttributes = attributeNames.map((name) => name.toLowerCase());

  if (blockedTags.has(normalizedTag)) {
    return {
      sourceLabel,
      tagName: normalizedTag,
      attributeNames: normalizedAttributes,
      decision: "blocked",
      reason: "Blocked tag is outside the learning allowlist.",
    };
  }

  if (normalizedAttributes.some((name) => blockedAttributes.has(name))) {
    return {
      sourceLabel,
      tagName: normalizedTag,
      attributeNames: normalizedAttributes,
      decision: "blocked",
      reason: "Blocked attribute is not allowed in rich text.",
    };
  }

  if (!allowedTags.has(normalizedTag)) {
    return {
      sourceLabel,
      tagName: normalizedTag,
      attributeNames: normalizedAttributes,
      decision: "requires-backend-review",
      reason: "Unknown tags require backend sanitizer review.",
    };
  }

  if (normalizedAttributes.some((name) => !allowedAttributes.has(name))) {
    return {
      sourceLabel,
      tagName: normalizedTag,
      attributeNames: normalizedAttributes,
      decision: "requires-backend-review",
      reason: "Unknown attributes require backend sanitizer review.",
    };
  }

  return {
    sourceLabel,
    tagName: normalizedTag,
    attributeNames: normalizedAttributes,
    decision: "allowed",
    reason: "Learning allowlist accepts this tag and attributes.",
  };
}
