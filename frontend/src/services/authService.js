import api from '@/lib/api/api';

export const register = async (data) => {
   const response = await api.post('/register', data);

   return response.data;
};

export const login = async (data) => {
   const response = await api.post('/login', data);

   return response.data;
};

export const logout = async () => {
   const response = await api.post('/logout');

   return response.data;
};
