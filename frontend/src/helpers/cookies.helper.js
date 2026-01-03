// hàm tạo cookies
export function setCookie(cname, cvalue, exdays = 7) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  // encode value to be safe for cookie storage
  const safeValue = encodeURIComponent(cvalue);
  // set path=/ so cookie is available app-wide; use SameSite=Lax for basic CSRF protection
  document.cookie = `${cname}=${safeValue};${expires};path=/;SameSite=Lax`;
}

export function getCookie(cname) {
  const name = cname + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(name) === 0) {
      const raw = c.substring(name.length, c.length);
      try {
        return decodeURIComponent(raw);
      } catch (e) {
        return raw;
      }
    }
  }
  return '';
}

// hàm xóa cookie (sets expiry in past and path=/)
export function deleteCookie(cname) {
  document.cookie = `${cname}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// xóa toàn bộ cookie (best-effort)
export function deleteAllCookie() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
}
