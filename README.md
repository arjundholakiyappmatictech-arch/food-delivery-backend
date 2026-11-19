# Tomato

Tomato is a full-stack food delivery application that enables customers to browse nearby restaurants, order food, manage delivery addresses, and leave reviews, while providing dashboards for restaurant owners and delivery agents.

## Features

- User authentication with role-based permissions (Customer, Restaurant Owner, Delivery Agent).
- Distance-based restaurant discovery using geographic coordinates (Haversine formula), search queries, and category filtering.
- Interactive restaurant menus and item management.
- Cart management with item updates and persistent state.
- Customer address management with location coordinates.
- Multi-step checkout, order placement, cancellation, and invoice generation.
- Automated background queue pipeline for delivery assignment, pickup, and delivery tracking.
- Payment processing for Cash on Delivery and online/card payment simulation.
- Customer ratings and reviews for completed orders.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Zustand, Axios, Tailwind CSS, React Hook Form, Zod.
- **Backend:** PHP 8.3/8.4, Laravel 13, Laravel Sanctum.
- **Database:** PostgreSQL (Supabase).
- **Infrastructure:** Docker, Nginx, Vercel (Frontend), Render (Backend).

## Project Structure & Engineering Documentation

- `frontend/` - Next.js 16 frontend application (React 19, Pure JavaScript, TanStack Query v5, Zustand v5, shadcn/ui).
- `backend/` - Laravel 12/13 API backend (PHP 8.4, PostgreSQL, Sanctum, 2-verb routing architecture).
- `AGENTS.md` - Canonical entry point and execution matrix for AI coding assistants.
- `ARCHITECTURE.md` - Full-stack system contracts, 2-verb API boundary, ADR-001 envelope, and auth flow.
- `PROJECT_REQUIREMENTS.md` - Product domain specifications, user personas, and feature rules.
- `frontend/nextjs-engineering-handbook/` - Canonical Next.js frontend rulebook.
- `backend/laravel-engineering-handbook/` - Canonical Laravel backend rulebook.

## How It Works

1. The frontend (Next.js on Vercel) sends HTTP requests to the backend API.
2. The backend (Laravel running in a Docker container on Render) handles request authentication via Sanctum tokens and executes business logic in service classes.
3. Database queries and background jobs are executed against PostgreSQL (Supabase).

## Local Setup

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

To run the queue worker locally:

```bash
php artisan queue:listen
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Backend (`backend/.env`)

- `APP_NAME`
- `APP_ENV`
- `APP_KEY`
- `APP_DEBUG`
- `APP_URL`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `QUEUE_CONNECTION`
- `SESSION_DRIVER`
- `CACHE_STORE`
- `MAIL_MAILER`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM_ADDRESS`

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_URL`

## Production

- **Frontend:** Vercel
- **Backend:** Render (Docker container)
- **Database:** Supabase (PostgreSQL)

Live Demo:
https://tomato-rho-three.vercel.app/

## Queue

The application uses Laravel's database queue driver (`php artisan queue:work`) to process background delivery workflows (`AssignDeliveryJob`, `PickupJob`, `DeliverJob`), email notifications, and auth activity logs.

## API

The backend exposes a REST API protected by Laravel Sanctum Bearer tokens. Main API areas include:

- **Authentication:** `/api/register`, `/api/login`, `/api/logout`
- **Addresses:** `/api/addresses`
- **Restaurants & Menus:** `/api/restaurants`, `/api/menus`, `/api/menu-items`
- **Cart:** `/api/cart`, `/api/carts/store`
- **Orders & Payments:** `/api/orders`, `/api/orders/{id}/payment`
- **Deliveries:** `/api/deliveries`
- **Reviews:** `/api/reviews`

## License

MIT (as defined in `backend/composer.json`).
