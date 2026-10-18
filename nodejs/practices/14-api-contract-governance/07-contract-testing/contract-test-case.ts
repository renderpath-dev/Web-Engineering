export type ContractTestCase = {
  name: string;
  method: string;
  path: string;
  expectedStatus: number;
  expectedSchema: string;
};

export function testCaseName(testCase: ContractTestCase): string {
  return `${testCase.method} ${testCase.path} -> ${testCase.expectedStatus}`;
}
