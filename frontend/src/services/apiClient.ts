export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, data: any, message: string) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const apiClient = {
  async get(url: string, params?: Record<string, string | number | undefined>) {
    let query = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      query = '?' + searchParams.toString();
    }
    const response = await fetch(url + query);
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new ApiError(response.status, data, API request failed: \);
    }
    return response.json();
  }
};
