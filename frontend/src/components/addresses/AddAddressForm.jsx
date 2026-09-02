'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import useAddresses from '@/lib/hooks/useAddresses';
import { AddressForm } from './AddressForm';

export function AddAddressForm() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const from = searchParams.get('from');

   const { createAddress, isCreating } = useAddresses();

   const defaultValues = {
      label: 'home',
      address_line: '',
      city: '',
      state: '',
      pincode: '',
      latitude: '',
      longitude: '',
      is_default: false,
   };

   const onSubmit = async (data) => {
      await createAddress(data);

      router.replace(from === 'select' ? '/addresses/select' : '/addresses');
   };

   return (
      <AddressForm
         defaultValues={defaultValues}
         onSubmit={onSubmit}
         submitting={isCreating}
         submitLabel="Save and Continue"
         submittingLabel="Saving address..."
      />
   );
}
