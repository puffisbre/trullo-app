/**
 * Get authentication headers for fetch requests
 * For Safari compatibility: sends token in Authorization header as fallback
 * when cookies are blocked (third-party cookies)
 */
export function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Try to get token from localStorage (Safari fallback)
  // Backend checks both cookies and Authorization header
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

