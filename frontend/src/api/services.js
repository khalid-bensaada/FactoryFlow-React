import api from './client.js';

const data = (promise) => promise.then((r) => r.data);

export const getInstallationStatus = () => data(api.get('/installation/status'));
export const install = (body) => data(api.post('/installation', body));
export const login = (body) => data(api.post('/auth/login', body));
export const getMe = () => data(api.get('/auth/me'));

export const getDashboard = () => data(api.get('/dashboard'));

export const getOperators = () => data(api.get('/users', { params: { role: 'operator' } }));
export const createOperator = (body) => data(api.post('/users', body));

export const getMaterials = (params) => data(api.get('/materials', { params }));
export const getMaterial = (id) => data(api.get(`/materials/${id}`));
export const createMaterial = (body) => data(api.post('/materials', body));
export const updateMaterial = (id, body) => data(api.put(`/materials/${id}`, body));
export const stockIn = (id, quantity) => data(api.post(`/materials/${id}/stock-in`, { quantity }));
export const getMovements = (id) => data(api.get(`/materials/${id}/movements`));

export const getProducts = (params) => data(api.get('/products', { params }));
export const createProduct = (body) => data(api.post('/products', body));
export const updateProduct = (id, body) => data(api.put(`/products/${id}`, body));

export const getOrders = (params) => data(api.get('/orders', { params }));
export const getOrder = (id) => data(api.get(`/orders/${id}`));
export const createOrder = (body) => data(api.post('/orders', body));
export const updateOrder = (id, body) => data(api.put(`/orders/${id}`, body));
export const cancelOrder = (id) => data(api.patch(`/orders/${id}/cancel`));
export const startOrder = (id) => data(api.patch(`/orders/${id}/start`));
export const completeOrder = (id) => data(api.patch(`/orders/${id}/complete`));
