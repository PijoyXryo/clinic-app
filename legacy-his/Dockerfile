FROM php:8.3-cli
# pdo_mysql = talk to MariaDB; unzip = needed by Composer
RUN apt-get update \
 && apt-get install -y --no-install-recommends unzip \
 && docker-php-ext-install pdo_mysql \
 && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist
COPY . .
EXPOSE 8080
# 0.0.0.0 = accept connections from other containers, not just "inside me"
CMD ["php", "-S", "0.0.0.0:8080", "-t", "web", "web/index.php"]