export function getUseTreaty() {
  return `import { EndApp } from "@backend/index";
import { treaty } from "@elysiajs/eden";
// 创建Eden Treaty客户端
export const client = treaty<EndApp>(
  import.meta.env.VITE_API_URL || "http://localhost:9002",
);

export default client;
`;
}