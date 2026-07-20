import { NextResponse } from "next/server";

export type ApiSuccess<T> = { data: T; error: null };
export type ApiFailure = { data: null; error: { code: string; message: string; details?: unknown } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export const ok = <T>(data: T, status = 200) => NextResponse.json<ApiSuccess<T>>({ data, error: null }, { status });
export const fail = (code: string, message: string, status: number, details?: unknown) =>
  NextResponse.json<ApiFailure>({ data: null, error: { code, message, ...(details === undefined ? {} : { details }) } }, { status });

export function handleApiError(error: unknown) {
  const value = error as { code?: string; message?: string; details?: unknown };
  if (value?.code === "VALIDATION_ERROR") return fail(value.code, value.message ?? "Invalid request.", 422, value.details);
  if (value?.code === "PGRST116") return fail("NOT_FOUND", "Resource not found.", 404);
  if (value?.code === "42501") return fail("FORBIDDEN", "The requested operation is not permitted.", 403);
  return fail(value?.code ?? "INTERNAL_ERROR", value?.message ?? "An unexpected error occurred.", 500);
}
