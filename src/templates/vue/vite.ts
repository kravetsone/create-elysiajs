export function getViteConfig(frontend: string) {
	if (frontend === "Vue") {
		return `import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: ["vue", "vue-router", "@vueuse/core"],
      dts: true, // 生成类型声明文件
    }),
    // 自动导入组件
    Components({
      resolvers: [],
      dts: true, // 生成组件类型声明文件
      dirs: ["src/components"], // 自动导入的组件目录
      extensions: ["vue"], // 组件文件扩展名
      deep: true, // 深度搜索子目录
      include: [/\\.vue$/, /\\.vue\\?vue/], // 包含的文件类型
    }),
  ],
  server: {
    port: 5000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@backend": resolve(__dirname, "../backend/src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});`;
	}

	if (frontend === "React") {
		return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});`;
	}

	// 默认 Vue 配置
	return getViteConfig("Vue");
}
