import axiosInstance from './axios-config';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { AuthResponse } from '../auth/types';

// Generic API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

// API Client class with typed methods
class ApiClient {
  /**
   * Generic GET request
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await axiosInstance.get(url, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * Generic POST request
   */
  async post<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * Generic PUT request
   */
  async put<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * Generic PATCH request
   */
  async patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await axiosInstance.patch(url, data, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * Upload file(s) with form data
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    const response: AxiosResponse<T> = await axiosInstance.post(url, formData, uploadConfig);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * Download file as blob
   */
  async download(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<Blob>> {
    const downloadConfig: AxiosRequestConfig = {
      ...config,
      responseType: 'blob',
    };

    const response: AxiosResponse<Blob> = await axiosInstance.get(url, downloadConfig);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * Make a request with custom configuration
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await axiosInstance.request(config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * Get request with Auth response wrapper (for auth endpoints)
   */
  async getAuth<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AuthResponse<T>> {
    const response = await this.get<AuthResponse<T>>(url, config);
    return response.data;
  }

  /**
   * Post request with Auth response wrapper (for auth endpoints)
   */
  async postAuth<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AuthResponse<T>> {
    const response = await this.post<AuthResponse<T>, D>(url, data, config);
    return response.data;
  }

  /**
   * Put request with Auth response wrapper (for auth endpoints)
   */
  async putAuth<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AuthResponse<T>> {
    const response = await this.put<AuthResponse<T>, D>(url, data, config);
    return response.data;
  }

  /**
   * Delete request with Auth response wrapper (for auth endpoints)
   */
  async deleteAuth<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AuthResponse<T>> {
    const response = await this.delete<AuthResponse<T>>(url, config);
    return response.data;
  }
}

// Create and export API client instance
const apiClient = new ApiClient();

export default apiClient;

// Export the class for potential extension
export { ApiClient }; 