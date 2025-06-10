import axios, { AxiosError } from "axios";

export const handleAxiosError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>;
    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return axiosError.response.data?.message || `Request failed with status code ${axiosError.response.status}`;
    } else if (axiosError.request) {
      // The request was made but no response was received
      return 'Network Error: Could not connect to the server.';
    } else {
      // Something happened in setting up the request that triggered an Error
      return `Request setup error: ${axiosError.message}`;
    }
  } else if (error instanceof Error) {
    // Generic JavaScript error
    return error.message;
  } else {
    // Unknown error
    return 'An unexpected error occurred.';
  }
};