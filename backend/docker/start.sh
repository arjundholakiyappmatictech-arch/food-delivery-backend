#!/bin/sh

set -e

echo "Running database migrations..."
php artisan migrate --force

echo "Starting Laravel queue worker..."
php artisan queue:work &

echo "Starting Laravel scheduler..."
php artisan schedule:work &
SCHEDULER_PID=$!
echo "Laravel scheduler started with PID: $SCHEDULER_PID"

echo "Starting PHP-FPM..."
php-fpm -D

echo "Starting Nginx..."
nginx -g 'daemon off;'