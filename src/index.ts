import {
  Config,
  getConfigFilePath,
  readConfig,
  setUser,
  writeConfig,
} from "./config";

async function main() {
  console.log(
    await writeConfig({
      dbUrl: "postgres://example",
      currentUserName: "Zach",
    }),
  );
  console.log("Hello, world!");
  const currentConfig: Config = await readConfig();
  console.log(currentConfig);
}

main();
