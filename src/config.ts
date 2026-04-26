import os from "node:os";
import path from "node:path";
import fs from "node:fs";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

const CONFIG_JSON_PATH = "/.gatorconfig.json";

export function setUser(userName: string) {
  const config = readConfig();
  config.currentUserName = userName;
  writeConfig(config);
}

export function getConfigFilePath(): string {
  return path.join(os.homedir(), CONFIG_JSON_PATH);
}

export function writeConfig(cfg: Config) {
  try {
    fs.writeFileSync(getConfigFilePath(), JSON.stringify(cfg, null, 2), {
      encoding: "utf-8",
    });
  } catch (error) {}
}

export function validateConfig(rawConfig: any): Config {
  const result = JSON.parse(rawConfig);

  return {
    dbUrl: result.dbUrl,
    currentUserName: result.currentUserName,
  } satisfies Config;
}

export function readConfig() {
  try {
    const rawConfig = fs.readFileSync(getConfigFilePath(), {
      encoding: "utf-8",
    });
    const cfg = validateConfig(rawConfig);
    return cfg;
  } catch (error) {
    return {
      dbUrl: "",
      currentUserName: "",
    };
  }
}
