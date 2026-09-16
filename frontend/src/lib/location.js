export function formatAddress(address) {
   if (!address) {
      return '';
   }

   return [address.address_line, address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(', ');
}

export function formatSavedAddress(address) {
   return {
      type: 'saved_address',
      addressId: address.id,
      title: address.label,
      address: formatAddress(address),
   };
}
