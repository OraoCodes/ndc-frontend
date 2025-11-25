export interface ThematicArea {
  id: number;
  name: string;
  description?: string | null;
}

export interface County {
  id: number;
  name: string;
  population?: number | null;
  thematic_area_id?: number | null;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// export interface CountySummaryPerformance {
//   rank: number;
//   county: string;
//   indexScore: number;
//   performance: string;
// }
export interface CountySummaryPerformance {
  name: string
  score: number
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  // Respect Vite env var `VITE_API_BASE` when set. If not set, use same origin.
  // `import.meta.env` is provided by Vite at build/dev time.
  const BASE = (import.meta as any).env?.VITE_API_BASE ?? "";
  const fullUrl = BASE ? `${BASE}${url}` : url;

  const res = await fetch(fullUrl, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${res.statusText} ${text}`);
  }
  return (await res.json()) as T;
}

export const api = {
  // Authentication
  register: async (payload: any): Promise<AuthResponse> => request<AuthResponse>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),
  login: async (payload: any): Promise<AuthResponse> => request<AuthResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),

  // Thematic Areas
  listThematicAreas: async (): Promise<ThematicArea[]> => request<ThematicArea[]>('/thematic-areas'),
  getThematicArea: async (id: number): Promise<ThematicArea> => request<ThematicArea>(`/thematic-areas/${id}`),
  createThematicArea: async (payload: { name: string; description?: string }) => request(`/thematic-areas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  deleteThematicArea: async (id: number) => request(`/thematic-areas/${id}`, { method: 'DELETE' }),

  // Counties
  listCounties: async (): Promise<County[]> => request<County[]>('/counties'),
  getCounty: async (id: number): Promise<County> => request<County>(`/counties/${id}`),
  createCounty: async (payload: {
    name: string;
    population?: number;
    thematic_area_id?: number;
  }): Promise<County> => request<County>('/counties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),
  updateCounty: async (
    id: number,
    payload: { name: string; population?: number; thematic_area_id?: number }
  ): Promise<County> => request<County>(`/counties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),
  deleteCounty: async (id: number) => request<void>(`/counties/${id}`, { method: 'DELETE' }),
  getCountySummaryPerformance: async (thematicArea: string): Promise<CountySummaryPerformance[]> => request<CountySummaryPerformance[]>(`/counties/summary-performance/${thematicArea}`),

  // Publications
  listPublications: async (): Promise<any[]> => request<any[]>('/publications'),
  getPublication: async (id: number): Promise<any> => request<any>(`/publications/${id}`),
  createPublication: async (payload: { title: string; date?: string; summary?: string; filename: string; contentBase64: string }) => request(`/publications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  downloadPublication: async (id: number) => {
    const BASE = (import.meta as any).env?.VITE_API_BASE ?? "";
    const fullUrl = BASE ? `${BASE}/publications/${id}/download` : `/publications/${id}/download`;
    const res = await fetch(fullUrl);
    if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
    return res.blob();
  },
};
