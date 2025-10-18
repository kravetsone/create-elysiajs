export function getTurboJson() {
	return `{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": [
        "^build"
      ],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env*"
      ],
      "outputs": [
        "dist/**",
        "!.next/cache/**"
      ]
    },
    "lint": {
      "dependsOn": [
        "^lint"
      ]
    },
    "lint:fix": {
      "dependsOn": [
        "^lint:fix"
      ]
    },
    "check-types": {
      "dependsOn": [
        "^check-types"
      ]
    },
    "clean": {
      "cache": false
    },
    "dev": {
      "persistent": true,
      "cache": false
    }
  }
}`;
}
