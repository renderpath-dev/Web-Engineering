export interface ModelValueContract {
  readonly propName: string;
  readonly updateEventName: string;
  readonly valueType: string;
  readonly controlled: boolean;
}

export function createModelValueContract(
  propName: string,
  valueType: string,
  controlled: boolean,
): ModelValueContract {
  return {
    propName,
    updateEventName: `update:${propName}`,
    valueType,
    controlled,
  };
}

export function isModelUpdateEvent(
  contract: ModelValueContract,
  eventName: string,
): boolean {
  return contract.updateEventName === eventName;
}
