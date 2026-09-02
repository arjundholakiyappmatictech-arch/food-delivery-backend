'use client';

import { useRouter } from 'next/navigation';

import useAddresses from '@/lib/hooks/useAddresses';
import { AddressForm } from './AddressForm';

export function EditAddressForm({ addressId, initialData }) {
   const router = useRouter();

   const { updateAddress, isUpdating } = useAddresses();

   const defaultValues = {
      label: initialData?.label || 'home',
      address_line: initialData?.address_line || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      pincode: initialData?.pincode || '',
      latitude: initialData?.latitude != null ? String(initialData.latitude) : '',
      longitude: initialData?.longitude != null ? String(initialData.longitude) : '',
      is_default: Boolean(initialData?.is_default),
   };

   const onSubmit = async (data) => {
      await updateAddress({
         addressId,
         data,
      });

      router.replace('/addresses');
   };

   return (
      <AddressForm
         defaultValues={defaultValues}
         onSubmit={onSubmit}
         submitting={isUpdating}
         submitLabel="Save Changes"
         submittingLabel="Updating address..."
      />
   );
}
