export interface SlotContract {
  readonly name: string;
  readonly required: boolean;
  readonly slotProps: readonly string[];
  readonly description: string;
}

export function findMissingRequiredSlots(
  slots: readonly SlotContract[],
  providedSlotNames: readonly string[],
): readonly string[] {
  const provided = new Set(providedSlotNames);

  return slots
    .filter((slot) => slot.required && !provided.has(slot.name))
    .map((slot) => slot.name);
}
