const API_BASE_URL = '/api';

// Helper function for API requests
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// People API
export const peopleAPI = {
  getAll: () => fetchAPI('/people'),
  getById: (id) => fetchAPI(`/people/${id}`),
  create: (personData) => fetchAPI('/people', {
    method: 'POST',
    body: JSON.stringify(personData),
  }),
  update: (id, personData) => fetchAPI(`/people/${id}`, {
    method: 'PUT',
    body: JSON.stringify(personData),
  }),
  delete: (id) => fetchAPI(`/people/${id}`, {
    method: 'DELETE',
  }),
};

// Chores API
export const choresAPI = {
  getAll: () => fetchAPI('/chores'),
  getById: (id) => fetchAPI(`/chores/${id}`),
  create: (choreData) => fetchAPI('/chores', {
    method: 'POST',
    body: JSON.stringify(choreData),
  }),
  update: (id, choreData) => fetchAPI(`/chores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(choreData),
  }),
  delete: (id) => fetchAPI(`/chores/${id}`, {
    method: 'DELETE',
  }),
  complete: (id) => fetchAPI(`/chores/${id}/complete`, {
    method: 'POST',
  }),
  uncomplete: (id) => fetchAPI(`/chores/${id}/uncomplete`, {
    method: 'POST',
  }),
};

// Prizes API
export const prizesAPI = {
  getAll: () => fetchAPI('/prizes'),
  getById: (id) => fetchAPI(`/prizes/${id}`),
  create: (prizeData) => fetchAPI('/prizes', {
    method: 'POST',
    body: JSON.stringify(prizeData),
  }),
  update: (id, prizeData) => fetchAPI(`/prizes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(prizeData),
  }),
  delete: (id) => fetchAPI(`/prizes/${id}`, {
    method: 'DELETE',
  }),
  redeem: (id, personId) => fetchAPI(`/prizes/${id}/redeem`, {
    method: 'POST',
    body: JSON.stringify({ person_id: personId }),
  }),
};

// Transactions API
export const transactionsAPI = {
  getByPerson: (personId) => fetchAPI(`/transactions/${personId}`),
  getAll: () => fetchAPI('/transactions'),
};
