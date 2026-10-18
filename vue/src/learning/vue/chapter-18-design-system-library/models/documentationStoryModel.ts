import type { ComponentStateName } from "./componentStateMatrixModel";

export interface DocumentationStory {
  readonly title: string;
  readonly componentName: string;
  readonly state: ComponentStateName;
  readonly args: Readonly<Record<string, string | boolean>>;
  readonly purpose: string;
  readonly antiExample: boolean;
}

export function findMissingStoryStates(
  stories: readonly DocumentationStory[],
  requiredStates: readonly ComponentStateName[],
): readonly ComponentStateName[] {
  const documentedStates = new Set(stories.map((story) => story.state));

  return requiredStates.filter((state) => !documentedStates.has(state));
}
