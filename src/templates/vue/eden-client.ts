export function getEdenClient(projectName: string) {
  return `import { edenClient } from '@elysiajs/eden';
import type { ApiResponseRoutes, ApiResponse, PaginatedResponse, User, Partner } from '@${projectName}/backend';

// Create type-safe API client
export const api = edenClient<ApiResponseRoutes>(import.meta.env.VITE_API_URL || 'http://localhost:3000');

// Convenient API call wrappers
export const apiClient = {
  // Health check
  async health() {
    return await api.health.get();
  },


  async getUsers(page = 1, pageSize = 10) {
    return await api.api.users.get({
      query: { page, pageSize }
    });
  },

  async getUser(id: string) {
    return await api.api.users[':id'].get({
      params: { id }
    });
  },

  async createUser(userData: { email: string; name?: string }) {
    return await api.api.users.post({
      body: userData
    });
  },

  async updateUser(id: string, userData: { email?: string; name?: string }) {
    return await api.api.users[':id'].put({
      params: { id },
      body: userData
    });
  },

  async deleteUser(id: string) {
    return await api.api.users[':id'].delete({
      params: { id }
    });
  },

  
  async getPartners(page = 1, pageSize = 10, search?: string) {
    return await api.api.partners.get({
      query: { page, pageSize, ...(search && { search }) }
    });
  },

  async getPartner(id: string) {
    return await api.api.partners[':id'].get({
      params: { id }
    });
  },

  async createPartner(partnerData: { name: string; email?: string; phone?: string }) {
    return await api.api.partners.post({
      body: partnerData
    });
  },

  async updatePartner(id: string, partnerData: { name?: string; email?: string; phone?: string }) {
    return await api.api.partners[':id'].put({
      params: { id },
      body: partnerData
    });
  },

  async deletePartner(id: string) {
    return await api.api.partners[':id'].delete({
      params: { id }
    });
  }
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiResponse = async <T>(
  apiCall: Promise<ApiResponse<T> | any>
): Promise<T> => {
  try {
    const response = await apiCall;

    // Handle Eden response format
    const data = response.data || response;

    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        throw new ApiError(
          data.error || 'API request failed',
          response.status || 500,
          data
        );
      }
      return data.data as T;
    }

    // Handle directly returned data
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors, etc.
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      0,
      error
    );
  }
};

// Type-safe handling of paginated data
export const handlePaginatedResponse = async <T>(
  apiCall: Promise<PaginatedResponse<T> | any>
): Promise<{ data: T[]; pagination: NonNullable<PaginatedResponse<T>['pagination']> }> => {
  const response = await handleApiResponse<PaginatedResponse<T>>(apiCall);
  return {
    data: response.data || [],
    pagination: response.pagination || {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
  };
};

// Specific typed API call functions
export const userApi = {
  getUsers: (page = 1, pageSize = 10) =>
    handlePaginatedResponse<User>(apiClient.getUsers(page, pageSize)),

  getUser: (id: string) =>
    handleApiResponse<User>(apiClient.getUser(id)),

  createUser: (userData: { email: string; name?: string }) =>
    handleApiResponse<User>(apiClient.createUser(userData)),

  updateUser: (id: string, userData: { email?: string; name?: string }) =>
    handleApiResponse<User>(apiClient.updateUser(id, userData)),

  deleteUser: (id: string) =>
    handleApiResponse(apiClient.deleteUser(id))
};

export const partnerApi = {
  getPartners: (page = 1, pageSize = 10, search?: string) =>
    handlePaginatedResponse<Partner>(apiClient.getPartners(page, pageSize, search)),

  getPartner: (id: string) =>
    handleApiResponse<Partner>(apiClient.getPartner(id)),

  createPartner: (partnerData: { name: string; email?: string; phone?: string }) =>
    handleApiResponse<Partner>(apiClient.createPartner(partnerData)),

  updatePartner: (id: string, partnerData: { name?: string; email?: string; phone?: string }) =>
    handleApiResponse<Partner>(apiClient.updatePartner(id, partnerData)),

  deletePartner: (id: string) =>
    handleApiResponse(apiClient.deletePartner(id))
};

export const healthApi = {
  check: () => handleApiResponse(apiClient.health())
};`;
}
