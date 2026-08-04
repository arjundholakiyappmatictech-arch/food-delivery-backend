export function formatSavedAddress(address) {
   return {
      type: 'saved_address',
      addressId: address.id,
      title: address.label,
      address: [address.address_line, address.city, address.state, address.pincode].filter(Boolean).join(', '),
   };
}
