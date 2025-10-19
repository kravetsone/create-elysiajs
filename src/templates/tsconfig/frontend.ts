export function getFrontendTSConfig(framework: "Vue" | "React") {
  const configs = {
    Vue: {
      files: [],
      references: [
        {
          path: "./tsconfig.app.json",
        },
        {
          path: "./tsconfig.node.json",
        },
      ],
    },
    React: {
      $schema: "https://json.schemastore.org/tsconfig",
      extends: ["./base.json"],
      compilerOptions: {
        forceConsistentCasingInFileNames: true,
        inlineSources: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
        preserveWatchOutput: true,
        strictNullChecks: true,
        jsx: "react-jsx",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        useDefineForClassFields: true,
        skipLibCheck: true,
        incremental: true,
      },
    },
  };

  return JSON.stringify(
    configs[framework as keyof typeof configs] || configs.Vue,
    null,
    2,
  );
}
