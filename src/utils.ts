type PackageManager = "bun" | "npm" | "yarn" | "pnpm"

export function detectPackageManager() {
    const userAgent = process.env.npm_config_user_agent;
  
    if(!userAgent) throw new Error(`Package manager doesn't detected. Please specify template with "--template bun"`);
  
    return userAgent.split(" ")[0].split("/")[0] as PackageManager;
  }