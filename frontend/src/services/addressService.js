import api from '@/lib/api/api';

export async function getAddresses() {
   const response = await api.get('/addresses');

   const addresses = response.data?.data;

   return Array.isArray(addresses) ? addresses : [];
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
