export function getUseApiWithToast() {
  return `
import { toast } from "vue-sonner";
import client from "./useTreaty";

export type Err =
  | {
    message?: string;
    data?: null | Record<string, any> | string;
    status: number;
  }
  | any;

/**
 * 使用Toast的简单API Hook - 保持类型推导
 */
export function useApiWithToast() {


  // 显示错误toast
  const showError = (message: string) => {
    toast("错误")
  };

  // 显示警告toast
  const showWarning = (message: string) => {
    toast("警告")
  };

  // 获取友好的错误消息
  const getErrorMessage = (error: any): string => {
    if (error?.status === 400) return "请求参数有误";
    if (error?.status === 401) return "登录已过期，请重新登录";
    if (error?.status === 403) return "没有权限进行此操作";
    if (error?.status === 404) return "请求的资源不存在";
    if (error?.status === 500) return "服务器内部错误，请稍后再试";
    return error?.message || "操作失败，请稍后再试";
  };

  // 基础API调用 - 保持原始类型推导
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

  // 带默认值的API调用
  const callWithDefault = async <Data>(
    apiCall: () => Promise<{ data: Data; error: Err }>,
    defaultValue: Data,
  ): Promise<Data> => {
    const result = await call(apiCall);
    return result !== null ? result : defaultValue;
  };

  // 分页API调用
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

  // 成功提示
  const showSuccess = (message: string) => {
    toast(message)
  };

  // 创建操作（带成功提示）
  const create = async <Data>(
    apiCall: () => Promise<{ data: Data; error: Err }>,
    successMessage: string = "创建成功",
  ): Promise<Data | null> => {
    const result = await call(apiCall);
    if (result !== null) {
      showSuccess(successMessage);
    }
    return result;
  };

  // 更新操作（带成功提示）
  const update = async <Data>(
    apiCall: () => Promise<{ data: Data; error: Err }>,
    successMessage: string = "更新成功",
  ): Promise<Data | null> => {
    const result = await call(apiCall);
    if (result !== null) {
      showSuccess(successMessage);
    }
    return result;
  };

  // 删除操作（带成功提示）
  const remove = async <Data>(
    apiCall: () => Promise<{ data: Data; error: Err }>,
    successMessage: string = "删除成功",
  ): Promise<Data | null> => {
    const result = await call(apiCall);
    if (result !== null) {
      showSuccess(successMessage);
    }
    return result;
  };

  return {
    // 基础调用
    call,
    callWithDefault,
    callPaginated,

    // CRUD操作
    create,
    update,
    remove,

    // Toast方法
    showError,
    showWarning,
    showSuccess,

    // 直接访问client
    client,
  };
}
`;
}