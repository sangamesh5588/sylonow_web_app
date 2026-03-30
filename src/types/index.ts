export type Category = 
  | "Birthday" 
  | "Proposal" 
  | "Anniversary" 
  | "Baby shower" 
  | "Festive" 
  | "Corporate"
  | "Wedding"
  | "Gifts"
  | "Experience";

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: Category;
  images: string[];
  inclusions: string[];
  addons: Addon[];
  location: string;
  distance?: string;
  tags?: string[];
  trending?: boolean;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  serviceId: string;
  service: Service;
  selectedAddons: string[];
  date: string;
  time: string;
  quantity: number;
}

export interface User {
  uid: string;
  phoneNumber: string;
  displayName?: string;
  email?: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string;
  houseNumber?: string;
  fullAddress: string;
  landmark?: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  address: Address;
  createdAt: string;
  scheduledAt: string;
}
