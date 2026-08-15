export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

export function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; domain=.vigyanprep.com; path=/; max-age=${maxAge}; secure; samesite=lax`;
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; domain=.vigyanprep.com; path=/; max-age=-1; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax`;
  document.cookie = `${name}=; domain=vigyanprep.com; path=/; max-age=-1; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax`;
  document.cookie = `${name}=; path=/; max-age=-1; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}
