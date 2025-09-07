## Build stage: build the Jekyll site with Node/PostCSS
FROM ruby:3.3.6-slim AS builder

RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential \
    nodejs \
    npm \
    git \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Ruby gems first (leverage Docker layer cache)
COPY Gemfile Gemfile.lock ./
ENV BUNDLE_WITHOUT="development:test"
RUN bundle install --jobs 4 --retry 3

# Install Node dependencies (Tailwind/PostCSS)
COPY package.json package-lock.json ./
# Deterministic installs via npm ci
RUN npm ci

# Copy the rest of the repo and build the site
COPY . .
ENV JEKYLL_ENV=production NODE_ENV=production
RUN bundle exec jekyll build

## Runtime stage: nginx serving the static site with HTTP Basic Auth
FROM nginx:1.27-alpine

RUN apk add --no-cache bash openssl

# Copy built site
COPY --from=builder /app/_site /usr/share/nginx/html

# Nginx config and entrypoint
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
