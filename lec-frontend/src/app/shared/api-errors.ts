import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorResponse {
  message?: string;
  validationErrors?: Record<string, string>;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const response = error.error as ApiErrorResponse | null;
    return response?.message || 'Não foi possível concluir a operação. Tente novamente.';
  }
  return 'Não foi possível concluir a operação. Tente novamente.';
}

export function getApiValidationErrors(error: unknown): Record<string, string> {
  if (error instanceof HttpErrorResponse) {
    const response = error.error as ApiErrorResponse | null;
    return response?.validationErrors || {};
  }
  return {};
}
