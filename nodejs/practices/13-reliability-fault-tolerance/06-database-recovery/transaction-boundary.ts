export interface TransactionBoundary {
  maxWait: number;
  timeout: number;
  isolationLevel: "Serializable";
}

export const transactionBoundary: TransactionBoundary = {
  maxWait: 2_000,
  timeout: 5_000,
  isolationLevel: "Serializable"
};
