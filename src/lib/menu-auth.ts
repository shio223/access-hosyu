const STORAGE_KEY = "hosyu-update-authenticated";

export function isUpdateMenuAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === "true";
}

export function setUpdateMenuAuthenticated(authenticated: boolean): void {
  sessionStorage.setItem(STORAGE_KEY, authenticated ? "true" : "false");
}
