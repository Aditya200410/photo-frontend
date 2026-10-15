// Central Authentication Management Utility
// Ensures persistent sessions (no unexpected auto-logout) and complete cleanup upon logout

export const getUserToken = () => {
  const token = localStorage.getItem('userToken');
  if (!token || token === 'undefined' || token === 'null' || token === 'DUMMY') {
    return null;
  }
  return token;
};

export const getAdminToken = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  if (!token || token === 'undefined' || token === 'null' || token === 'DUMMY') {
    return null;
  }
  return token;
};

export const isUserLoggedIn = () => {
  return Boolean(getUserToken());
};

export const isAdminLoggedIn = () => {
  const adminToken = getAdminToken();
  const isAdminFlag = localStorage.getItem('isAdmin') === 'true' || sessionStorage.getItem('isAdmin') === 'true';
  return Boolean(adminToken || isAdminFlag);
};

export const setAuthSession = ({ token, role = 'user', isAdmin = false }) => {
  if (token) {
    localStorage.setItem('userToken', token);
    if (role === 'admin' || isAdmin) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('isAdmin', 'true');
    }
  }
  if (role === 'admin' || isAdmin) {
    localStorage.setItem('isAdmin', 'true');
    sessionStorage.setItem('isAdmin', 'true');
  }
  window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { isLoggedIn: true, role } }));
};

export const logout = (redirectTo = '/login') => {
  // Thoroughly clear all tokens and authorization flags from persistent and session storage
  localStorage.removeItem('userToken');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');

  sessionStorage.removeItem('isAdmin');
  sessionStorage.clear();

  window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { isLoggedIn: false } }));
  window.dispatchEvent(new Event('auth-logout'));

  if (redirectTo) {
    window.location.href = redirectTo;
  }
};
