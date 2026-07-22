export const KEY = {
  user: "izi_user",
  token: "izi_token",
  users: "izi_users",
  logs: "izi_logs",
  meds: "izi_meds",
  reminders: "izi_reminders",
  chat: "izi_chat",
  settings: "izi_settings",
};

export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/$/, "");

export function getStored(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function setStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function currentUser() {
  return getStored(KEY.user, null);
}

export function authHeaders() {
  const token = localStorage.getItem(KEY.token);
  return token ? { Authorization: `Bearer ${token}` } : {};
}
