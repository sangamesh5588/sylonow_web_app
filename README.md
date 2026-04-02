# Sylonow — Let's Celebrate

> Premium decoration booking platform for birthdays, weddings, baby showers, anniversaries, and more — built for Bengaluru.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## Overview

Sylonow is a full-stack PWA that lets customers browse, filter, and book decoration packages. It includes real-time location detection, a smart search engine, cart and checkout flow, OTP-based authentication, coupon management, Razorpay payments, and a wedding invitation product (Wedlyz).

---

## Features

### Core
- **Browse & Filter Decorations** — Category pages with price, sort, and location filters
- **Near Me** — GPS-based distance sorting across category and search pages
- **Smart Search** — Token-aware search with area matching and "near me" intent detection
- **Service Detail** — Full package view with inclusions, add-ons, booking terms, and image gallery
- **Cart & Checkout** — Add services, select date/time, apply coupons, and place orders
- **Orders** — Track all past and current bookings with QR code support

### Auth & User
- **OTP Login** — Phone number authentication via MSG91
- **Profile** — Edit name, email, and profile details
- **Addresses** — Save and manage multiple delivery addresses with Google Maps picker
- **Wishlist** — Save favourite decoration packages

### Discovery
- **Offers** — Curated discount listings
- **Popular Searches** — Trending category shortcuts on the home screen
- **Area Sections** — Location-tagged featured packages

### Wedlyz
- Online wedding invitation website product starting at ₹999
- Graphic visual combo pack
- WhatsApp-first sharing flow
- Enquiry via WhatsApp integration

### Technical
- **PWA** — Installable on Android and iOS with offline support
- **SEO** — Per-page meta tags, Open Graph, sitemap, robots.txt
- **Razorpay** — Payment order creation and verification via Supabase Edge Functions
- **MSG91** — OTP send, resend, and verify via Edge Functions
- **Smooth Scroll** — Lenis-powered smooth scrolling

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS 4, Motion (Framer) |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| Payments | Razorpay |
| OTP Auth | MSG91 |
| Maps | Google Maps JavaScript API |
| PWA | vite-plugin-pwa |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |

---

## Project Structure

```
src/
├── components/
│   ├── category/        # Category page top filter bar
│   ├── home/            # Home page sections (banners, carousels, search)
│   ├── layout/          # Navbar, Footer, BottomNav, ScrollToTop
│   └── address/         # Address picker with Google Maps
├── contexts/
│   └── AuthContext.tsx  # Global auth state
├── lib/
│   ├── citySelection.ts # City picker, Near Me GPS detection, distance calc
│   ├── services.ts      # Supabase service fetching
│   ├── booking.ts       # Cart logic
│   ├── coupons.ts       # Coupon validation
│   └── razorpay.ts      # Payment helpers
├── pages/
│   ├── Home.tsx
│   ├── Category.tsx     # Decoration category listing with filters
│   ├── Search.tsx       # Global search with Near Me
│   ├── ServiceDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Orders.tsx
│   ├── Profile.tsx
│   ├── Addresses.tsx
│   ├── Wishlist.tsx
│   ├── Offers.tsx
│   ├── Coupons.tsx
│   └── wedding-cards/
│       └── WedlyBySylonow.tsx  # Wedlyz product page
├── services/
│   └── msg91*.ts        # OTP service integrations
├── types/
│   └── index.ts         # Shared TypeScript types
supabase/
└── functions/
    ├── verify-otp/
    ├── msg91-auth-user/
    ├── create-razorpay-order/
    └── verify-razorpay-payment/
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- Google Maps API key (with Places + Geocoding enabled)
- MSG91 account
- Razorpay account

### Setup

```bash
# Clone the repo
git clone https://github.com/jobssylonow-cloud/sylonow_web_app.git
cd sylonow_web_app

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Fill in your keys in .env.local

# Start dev server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_MSG91_WIDGET_ID=your_msg91_widget_id
```

### Build

```bash
npm run build
```

---

## Supabase Edge Functions

Deploy all functions with:

```bash
supabase functions deploy verify-otp
supabase functions deploy msg91-auth-user
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

---

## Near Me Feature

When a user enables **Near Me**:
1. The browser requests GPS permission
2. Coordinates are reverse-geocoded to a city via Google Maps API
3. Coordinates are stored in `localStorage`
4. Services are sorted by Haversine distance using each service's `latitude` / `longitude` fields from Supabase

---

## License

Private — All rights reserved © Sylonow Vision Private Limited
