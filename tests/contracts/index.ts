import path from "node:path";

const context = import.meta.glob<true, string, Contract>("./*.ts", {
  import: "default",
  eager: true,
});

const contracts = Object.entries(context).reduce<Record<string, Contract>>(
  (acc, [fileName, contract]) => {
    const contractName = path.basename(fileName, ".ts");
    acc[contractName] = contract;
    return acc;
  },
  {},
);

export default contracts;
