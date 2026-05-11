import type { OccurrenceDetail, OccurrenceSummary } from "@/types/parkflow";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
const TOKEN_KEY = "parkflow_token";

type LoginResponse = {
  token: string;
  tokenType: string;
  user: {
    fullName: string;
    email: string;
    roles: string[];
  };
};

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const response = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  saveToken(response.token);
  return response;
}

export async function listOccurrences(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return request<OccurrenceSummary[]>(`/occurrences${query}`);
}

export async function getOccurrence(id: string) {
  return request<OccurrenceDetail>(`/occurrences/${id}`);
}

export async function analyzeOccurrence(id: string) {
  return request(`/ai/occurrences/${id}/analyze`, {
    method: "POST"
  });
}

