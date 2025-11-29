# Build stage
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

# Production stage  
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Remove: COPY nginx.conf (use default)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
