# Ousad Bazar - Pharma E-Commerce

**Live:** [https://stagging.ousadbazar.com](https://stagging.ousadbazar.com)

A pharmacy e-commerce web application built with Next.js App Router, allowing users to browse, search, and purchase medicines and healthcare products online.

## Tech Stack

- **Framework:** Next.js 15 (React 19)
- **Styling:** Tailwind CSS, DaisyUI, SCSS
- **UI Components:** Ant Design
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Icons:** Iconify
- **Notifications:** Custom toast utility

## Features

- Product browsing with infinite scroll
- Product search with dedicated search page
- Product detail pages
- Shopping cart with drawer UI
- Checkout flow
- User authentication (login/register)
- Order tracking
- Guest order support
- Wishlist
- User profile
- Filters by supplier, category, and price range
- Responsive design (mobile + desktop)

## Pages

| Route             | Description                      |
| ----------------- | -------------------------------- |
| `/`               | Home page                        |
| `/all-medicines`  | Browse all products with filters |
| `/search`         | Search products                  |
| `/product/:id`    | Product details                  |
| `/cart`           | Shopping cart                    |
| `/checkout`       | Checkout                         |
| `/order`          | My orders (authenticated)        |
| `/guest-order`    | Guest order lookup               |
| `/order-tracking` | Track orders                     |
| `/wishlist`       | Wishlist                         |
| `/profile`        | User profile                     |
| `/login`          | Login                            |
| `/register`       | Register                         |

## Setup

```bash
# Install dependencies
pnpm install

# Start development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
├── app/                # App Router pages and layout
├── components/         # Reusable UI components
├── lib/                # Helpers and utilities
├── public/             # Static assets
├── stores/             # Zustand stores
├── types/              # Shared TypeScript types
├── package.json        # App scripts and dependencies
├── next.config.ts      # Next.js configuration
└── tailwind.config.ts  # Tailwind configuration
```

## Configuration

API and image base URLs are configured in [lib/config.ts](lib/config.ts):

```js
export const apiBasePharma = "http://192.168.101.151:3000/api";
export const imgBasePharma =
  "https://ecommerce-pharma.s3.ap-southeast-1.amazonaws.com";
```
