import axios, { AxiosError } from "axios";

/** Turns any thrown value into a message the user can read (pt-BR). */
export const handleAxiosError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response) {
      // The API already answers in Portuguese; the status is the last resort
      return axiosError.response.data?.message || `A requisição falhou (código ${axiosError.response.status}). Tente de novo.`;
    }
    if (axiosError.request) {
      return 'Não foi possível falar com o servidor. Confira sua conexão e tente de novo.';
    }
    return 'Não foi possível enviar a requisição. Tente de novo.';
  }
  if (error instanceof Error) return error.message;
  return 'Algo deu errado. Tente de novo.';
};
