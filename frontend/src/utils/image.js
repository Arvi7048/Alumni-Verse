import { API_CONFIG } from "../config/config";

// Build an absolute URL for images/assets returned by the API
// Examples of input path:
// - "http://cdn.example.com/file.jpg" -> returned as-is
// - "/uploads/profiles/file.jpg" -> BASE_URL + path
// - "uploads/profiles/file.jpg" -> BASE_URL + "/" + path
export function getImageUrl(path) {
  if (!path) return "";
  if (typeof path !== "string") return "";

  // Already absolute
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Preserve any query string
  const [rawPath, query = ""] = path.split("?");

  // Remove any accidental API prefix
  let cleaned = rawPath;
  // If stored as full API_BASE_URL + /uploads/..., strip it
  if (cleaned.startsWith(API_CONFIG.API_BASE_URL)) {
    cleaned = cleaned.replace(API_CONFIG.API_BASE_URL, "");
  }
  // If it starts with /api/..., strip the /api prefix
  if (cleaned.startsWith("/api/")) {
    cleaned = cleaned.replace("/api", "");
  }

  // Ensure leading slash
  const normalized = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;

  // If this is an app-static asset (e.g., /placeholder.svg), do NOT prefix BASE_URL.
  // Only prefix BASE_URL for backend-served paths like /uploads/...
  if (!normalized.startsWith("/uploads/")) {
    // Return as-is so it resolves against the frontend origin
    return query ? `${normalized}?${query}` : normalized;
  }

  // Backend-served uploads should be absolute to API base host
  const url = `${API_CONFIG.BASE_URL}${normalized}`;
  return query ? `${url}?${query}` : url;
}
