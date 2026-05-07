import {
  Dashboard,
  TrendingUp,
  ShoppingCart,
  Inventory,
  Category,
  People,
  ContactMail,
  Star,
  PhotoLibrary,
  LocalOffer,
  Settings,
} from '@mui/icons-material';

export const adminNavigationConfig = [
  {
    section: 'Main',
    items: [
      { 
        label: 'Dashboard', 
        icon: Dashboard, 
        path: '/admin',
        description: 'Overview and statistics'
      },
      { 
        label: 'Analytics', 
        icon: TrendingUp, 
        path: '/admin/analytics',
        description: 'Detailed analytics and reports'
      },
    ]
  },
  {
    section: 'Management',
    items: [
      { 
        label: 'Orders', 
        icon: ShoppingCart, 
        path: '/admin/orders', 
        badge: 5,
        description: 'Manage customer orders'
      },
      { 
        label: 'Products', 
        icon: Inventory, 
        path: '/admin/products',
        description: 'Product inventory management'
      },
      { 
        label: 'Categories', 
        icon: Category, 
        path: '/admin/categories',
        description: 'Product categories'
      },
      { 
        label: 'Customers', 
        icon: People, 
        path: '/admin/customers',
        description: 'Customer management'
      },
    ]
  },
  {
    section: 'Content',
    items: [
      { 
        label: 'Contacts', 
        icon: ContactMail, 
        path: '/admin/contacts', 
        badge: 2,
        description: 'Contact form submissions'
      },
      { 
        label: 'Reviews', 
        icon: Star, 
        path: '/admin/reviews',
        description: 'Product reviews'
      },
      { 
        label: 'Media', 
        icon: PhotoLibrary, 
        path: '/admin/media',
        description: 'Media library'
      },
      { 
        label: 'Offers', 
        icon: LocalOffer, 
        path: '/admin/offers',
        description: 'Special offers and promotions'
      },
    ]
  },
  {
    section: 'Settings',
    items: [
      { 
        label: 'Settings', 
        icon: Settings, 
        path: '/admin/settings',
        description: 'System settings'
      },
    ]
  },
];

export const getCurrentPageTitle = (pathname, config = adminNavigationConfig) => {
  for (const section of config) {
    const item = section.items.find(item => item.path === pathname);
    if (item) return item.label;
  }
  
  // Handle nested routes
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 2) {
    const parentPath = `/${segments.slice(0, 2).join('/')}`;
    return getCurrentPageTitle(parentPath, config) + ' Details';
  }
  
  return 'Dashboard';
};