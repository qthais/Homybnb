
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                     
COPY nest-cli.json tsconfig*.json ./ 
COPY apps/auth ./apps/auth
COPY libs ./libs
COPY proto ./proto
RUN npm run build auth          

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.env ./.env
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/auth/prisma ./apps/auth/prisma
EXPOSE 50051
CMD ["node", "dist/apps/auth/src/main.js"]
