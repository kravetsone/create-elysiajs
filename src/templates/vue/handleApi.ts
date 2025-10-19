export function getHandleApi() {
  return `
import { useApiWithToast } from "./useApiWithToast";

/**
 * Example API wrapper - customize the methods below for your API routes
 */
export const useApi = () => {
  const api = useApiWithToast();
  return {
    // Partners
    partners: {

      list: (query: string) =>
        api.callPaginated(() =>
          api.client.api.partners.ping.get({ query: { str: query } })
        ),
    },
    // Raw toast methods (if custom notifications are needed)
    toast: {
      error: api.showError,
      success: api.showSuccess,
      warning: api.showWarning,
    },
  };
};
`;
}