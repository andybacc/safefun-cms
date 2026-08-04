/**
 * SafeFun CMS API Service Client
 */

export const fetchAdminData = async (endpoint, options = {}, config, auth) => {
  const rawBaseUrl = (config?.apiBaseUrl || 'http://localhost:8787').trim();
  const baseUrl = rawBaseUrl.replace(/\/$/, '');
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...auth.getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: { message: response.statusText } };
    }
    const message = errorData?.error?.message || errorData?.message || `HTTP ${response.status}: Failed request`;
    throw new Error(message);
  }

  return response.json();
};

/**
 * RevenueCat Subscriber Fetcher via Backend Only
 */
export const fetchRevenueCatSubscriber = async (appUserId, config, auth) => {
  return fetchAdminData(`/overview/revenuecat/subscriber/${encodeURIComponent(appUserId)}`, {}, config, auth);
};

/**
 * Resend Email API Client via Backend Proxy (resolves CORS restrictions)
 */
export const sendResendEmail = async ({ to, subject, html, text, from }, baseUrl = 'http://localhost:8787') => {
  const cleanBaseUrl = (baseUrl || 'http://localhost:8787').replace(/\/$/, '');
  const url = `${cleanBaseUrl}/resend`;

  const payload = {
    from: from || 'SafeFun Admin <noreply@safefun.it>',
    to: Array.isArray(to) ? to : [to],
    subject,
    html: html || undefined,
    text: text || undefined,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Resend Email Error [${response.status}]`);
  }

  return response.json();
};
