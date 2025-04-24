// Centralized security functions
let retryCount = 0;
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; 

export const getCSRFToken = async () => {
  try {
    const response = await fetch('/csrf-token');
    if (!response.ok) throw new Error('CSRF token fetch failed');
    return await response.json();
  } catch (error) {
    console.error('CSRF Token Error:', error);
    throw error;
  }
};

export const fetchWithRetry = async (url, options = {}) => {
  try {
    const { csrfToken } = await getCSRFToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      }
    });

    if (response.status === 429) {
      const resetTime = response.headers.get('Retry-After') || 60;
      throw new Error(`rate_limit:${resetTime}`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Request failed');
    }

    retryCount = 0; // Reset retry counter on success
    return response.json();
  } catch (error) {
    if (retryCount < MAX_RETRIES && 
       (error.message.startsWith('rate_limit:') || error.message.includes('network'))) {
      retryCount++;
      const delay = BASE_DELAY * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options);
    }
    throw error;
  }
};