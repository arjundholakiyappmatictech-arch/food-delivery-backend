import RestaurantDetails from '@/components/restaurants/RestaurantDetails';

export default async function RestaurantPage({ params }) {
   const { id } = await params;

   return <RestaurantDetails restaurantId={id} />;
}
