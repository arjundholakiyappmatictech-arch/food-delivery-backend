const dummyRestaurant = {
   id: 1,

   name: "Domino's Pizza",

   image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900',

   rating: 4.4,

   totalRatings: '15K+',

   costForTwo: '₹400 for two',

   cuisines: ['Pizza', 'Fast Food', 'Italian'],

   address: 'Satellite, Ahmedabad',

   deliveryTime: '25-30 mins',

   menus: [
      {
         id: 1,
         name: 'Recommended',

         items: [
            {
               id: 1,
               name: 'Margherita Pizza',
               description: 'Classic delight with 100% real mozzarella cheese.',

               price: 199,

               rating: 4.6,

               ratingCount: '2K+',

               image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
            },

            {
               id: 2,
               name: 'Farmhouse Pizza',
               description: 'Loaded with onions, capsicum, mushrooms & tomatoes.',

               price: 349,

               rating: 4.5,

               ratingCount: '1.5K+',

               image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
            },
         ],
      },

      {
         id: 2,

         name: 'Sides',

         items: [
            {
               id: 3,

               name: 'Garlic Bread',

               description: 'Freshly baked garlic bread with herbs.',

               price: 149,

               rating: 4.3,

               ratingCount: '900+',

               image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
            },

            {
               id: 4,

               name: 'Cheese Dip',

               description: 'Creamy cheese dip.',

               price: 49,

               rating: 4.2,

               ratingCount: '500+',

               image_url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500',
            },
         ],
      },

      {
         id: 3,

         name: 'Desserts',

         items: [
            {
               id: 5,

               name: 'Choco Lava Cake',

               description: 'Warm chocolate cake with molten center.',

               price: 119,

               rating: 4.8,

               ratingCount: '3K+',

               image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
            },
         ],
      },
   ],
};

export default dummyRestaurant;
