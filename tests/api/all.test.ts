import { contracts } from "../contracts";
import { check, setupMocks } from ".";

for (const [contractName, contract] of Object.entries(contracts)) {
  describe(contractName, () => {
    beforeEach(() => {
      setupMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    for (const [testName, test] of Object.entries(contract)) {
      describe(testName, () => {
        for (const caseName of Object.keys(test.cases)) {
          it(caseName, async () => {
            await check(test, caseName);
          });
        }
      });
    }
  });
}
