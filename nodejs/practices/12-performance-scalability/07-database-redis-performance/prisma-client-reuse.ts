
export interface PrismaPoolPlan {
  nodeProcesses: number;
  poolSizePerProcess: number;
  totalPotentialConnections: number;
}

export function planPrismaPool(nodeProcesses: number, poolSizePerProcess: number): PrismaPoolPlan {
  return {
    nodeProcesses,
    poolSizePerProcess,
    totalPotentialConnections: nodeProcesses * poolSizePerProcess
  };
}
