export type ClosableResource = {
  close(): Promise<void>;
};

export async function closeWorkerResources(resources: ClosableResource[]): Promise<void> {
  for (const resource of resources) {
    await resource.close();
  }
}
