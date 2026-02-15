import axios, { AxiosError, AxiosHeaders } from 'axios';

export type ApiEvent = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  startDate: string;
  capacity: number;
  reservedCount: number;
  price: number;
};

export type ReserveEventResponse = {
  reservation: {
    id: string;
    eventId: string;
    userId: string;
    seats: number;
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentReference?: string;
    paidAt?: string;
    createdAt: string;
  };
  remaining: number;
  telegramInviteLink: string;
};

export type NotificationItem = {
  id: string;
  type: 'match' | 'message' | 'event';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type UserProfile = {
  avatarUrl: string | null;
  bio: string | null;
  interests: string[];
  city: string | null;
  age: number | null;
  gender: string | null;
  education: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

let accessToken: string | null = null;
let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function resolveQueue(token: string | null) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

function normalizeError(error: AxiosError) {
  const data = error.response?.data as { message?: string } | undefined;
  const message = data?.message || error.message || 'API request failed';
  return new Error(message);
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);
    config.headers = headers;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      throw normalizeError(error);
    }

    if (error.response?.status === 401 && !(originalRequest as { _retry?: boolean })._retry) {
      (originalRequest as { _retry?: boolean })._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const token = await refreshAccessToken();
          resolveQueue(token ? accessToken : null);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) {
            reject(normalizeError(error));
            return;
          }

          const headers = originalRequest.headers instanceof AxiosHeaders
            ? originalRequest.headers
            : new AxiosHeaders(originalRequest.headers);
          headers.set('Authorization', `Bearer ${token}`);
          originalRequest.headers = headers;
          resolve(api(originalRequest));
        });
      });
    }

    throw normalizeError(error);
  }
);

export async function login(email: string, password: string) {
  const { data } = await api.post<{ accessToken: string; user: { email: string; subscriptionPlan: string } }>('/auth/login', {
    email,
    password,
  });

  setAccessToken(data.accessToken);
  return data;
}

export async function refreshAccessToken() {
  try {
    const { data } = await api.post<{ accessToken: string }>('/auth/refresh');
    setAccessToken(data.accessToken);
    return true;
  } catch (error) {
    console.error('Token refresh failed', error);
    setAccessToken(null);
    return false;
  }
}

export async function fetchEvents(params?: { category?: string; limit?: number }) {
  const { data } = await api.get<{ count: number; events: ApiEvent[] }>('/events', { params });
  return data.events;
}

export async function reserveEvent(eventId: string, seats = 1, paymentReference?: string) {
  const { data } = await api.post<ReserveEventResponse>('/events/reserve', { eventId, seats, paymentReference });
  return data;
}

export async function fetchNotifications() {
  const { data } = await api.get<{ unread: number; items: NotificationItem[] }>('/notifications');
  return data;
}

export async function fetchSubscription() {
  const { data } = await api.get<{ plan: string; features: string[] }>('/subscriptions/me');
  return data;
}

export async function subscribe(provider: 'zarinpal' | 'stripe') {
  const { data } = await api.post<{ status: string; redirectUrl: string }>('/payments/subscribe', { provider });
  return data;
}

export async function fetchUserProfile() {
  const { data } = await api.get<UserProfile>('/user/profile');
  return data;
}

export async function updateUserProfile(payload: Partial<UserProfile>) {
  const { data } = await api.put<UserProfile & { usage: string; id: string }>('/user/profile', payload);
  return data;
}

export { api };
