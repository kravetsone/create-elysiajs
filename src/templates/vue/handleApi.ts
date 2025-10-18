export function getHandleApi() {
  return `
import { useApiWithToast } from "./useApiWithToast";

/**
 * Example API wrapper - customize the methods below for your API routes
 */
export const useApi = () => {
  const api = useApiWithToast();
  return {
    // 合作伙伴
    partners: {

      list: (query: string) =>
        api.callPaginated(() =>
          api.client.api.partners.ping.get({ query: { str: query } })
        ),
    },
    // 原始toast方法（如果需要自定义提示）
    toast: {
      error: api.showError,
      success: api.showSuccess,
      warning: api.showWarning,
    },
  };
};
`;
}