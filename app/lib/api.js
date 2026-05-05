const API_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['x-auth-token'] = token;
  }
  
  const config = {
    method,
    headers,
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth APIs
export const authAPI = {
  signup: (userData) => apiCall('/auth/signup', 'POST', userData),
  login: (credentials) => apiCall('/auth/login', 'POST', credentials),
};

// Medicines APIs
export const medicinesAPI = {
  getAll: () => apiCall('/medicines'),
  getById: (id) => apiCall(`/medicines/${id}`),
  create: (data, token) => apiCall('/medicines', 'POST', data, token),
  update: (id, data, token) => apiCall(`/medicines/${id}`, 'PUT', data, token),
  delete: (id, token) => apiCall(`/medicines/${id}`, 'DELETE', null, token),
};

// Users APIs
export const usersAPI = {
  getAll: (token) => apiCall('/users', 'GET', null, token),
  approveSupplier: (id, token) => apiCall(`/users/${id}/approve`, 'PUT', null, token),
  delete: (id, token) => apiCall(`/users/${id}`, 'DELETE', null, token),
};

// Sales APIs
export const salesAPI = {
  getAll: (token) => apiCall('/sales', 'GET', null, token),
  create: (data, token) => apiCall('/sales', 'POST', data, token),
};

// Orders APIs
export const ordersAPI = {
  getAll: (token) => apiCall('/orders', 'GET', null, token),
  updateStatus: (id, status, token) => apiCall(`/orders/${id}/status`, 'PUT', { status }, token),
};