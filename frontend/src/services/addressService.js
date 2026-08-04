import api from '@/lib/api/api';

export async function getAddresses(search = '', page = 1) {
   const response = await api.get('/addresses', {
      params: {
         page,
         ...(search.trim() && {
            q: search.trim(),
         }),
      },
   });

   return {
      addresses: Array.isArray(response.data?.data) ? response.data.data : [],

      pagination: response.data?.pagination ?? null,
   };
}

export async function createAddress(data) {
   const payload = {
      ...data,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      is_default: Boolean(data.is_default),
   };

   const response = await api.post('/addresses/store', payload);

   return response.data?.data;
}
