export function getUseApiWithToast() {
  return `
import { toast } from "vue-sonner";
import client from "./useTreaty";

export type Err =
  {
    message?: string;
    data?: null | Record<string, any> | string;
    status: number;
  };
/**
 * Simple API Hook with Toast notifications - maintains type inference
 */
export function useApiWithToast() {

  // Error toast notification
  const showError = (message: string) => {
    toast.error(message)
  };

  // Warning toast notification
  const showWarning = (message: string) => {
    toast.warning(message)
  };

  // Get user-friendly error messages
  const getErrorMessage = (error: any): string => {
    if (error?.status === 400) return "Invalid request parameters";
    if (error?.status === 401) return "Login expired, please login again";
    if (error?.status === 403) return "Insufficient permissions";
    if (error?.status === 404) return "Requested resource not found";
    if (error?.status === 500) return "Internal server error, please try again later";
    return error?.message || "Operation failed, please try again later";
  };

  // Basic API call - maintains original type inference
  const call = async <Data>(
    apiCall: () => Promise<{ data: Data; error: Err }>,
  ): Promise<Data | null> => {
    try {
      const { data, error } = await apiCall();
      if (error) {
        showError(getErrorMessage(error));
        return null;
      }
      return data;
    } catch (error: any) {
      showError(getErrorMessage(error));
      return null;
    }
  };

  // API call with default value
  const callWithDefault = async <Data>(
    apiCall: () => Promise<{ data: Data; error: Err }>,
    defaultValue: Data,
  ): Promise<Data> => {
    const result = await call(apiCall);
    return result !== null ? result : defaultValue;
  };

  // Paginated API call
  const callPaginated = async <Data>(
    apiCall: () => Promise<{ data: Data; error: Err }>,
    defaultValue?: any,
  ): Promise<Data | null> => {
    const defaultPaginatedValue = defaultValue || {
      items: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
    const result = await callWithDefault(apiCall, defaultPaginatedValue);
    return result;
  };

  // Success notification
  const showSuccess = (message: string) => {
    toast.success(message)
  };

  // Create operation (with success notification)
  const create = async <Data>(
    apiCall: () => Promise<{ data: Data; error: Err }>,
    successMessage: string = "Created successfully",
  ): Promise<Data | null> => {
    const result = await call(apiCall);
    if (result !== null) {
      showSuccess(successMessage);
    }
    return result;
  };

  // Update operation (with success notification)
  const update = async <Data>(
    apiCall: () => Promise<{ data: Data; error: Err }>,
    successMessage: string = "Updated successfully",
  ): Promise<Data | null> => {
    const result = await call(apiCall);
    if (result !== null) {
      showSuccess(successMessage);
    }
    return result;
  };

  // Delete operation (with success notification)
  const remove = async <Data>(
    apiCall: () => Promise<{ data: Data; error: Err }>,
    successMessage: string = "Deleted successfully",
  ): Promise<Data | null> => {
    const result = await call(apiCall);
    if (result !== null) {
      showSuccess(successMessage);
    }
    return result;
  };

  return {
    // Basic calls
    call,
    callWithDefault,
    callPaginated,

    // CRUD operations
    create,
    update,
    remove,

    // Toast methods
    showError,
    showWarning,
    showSuccess,

    // Direct client access
    client,
  };
}
`;
}