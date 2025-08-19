
export function fixImageUrl(
  url?: string | null,
  fallback: string = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop"
): string {
  if (!url) return fallback;

  return url
    .replace(/^http:\/([^/])/, "http://$1") 
    .replace(/^http:\/\//, "https://"); 
}

