
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                     
COPY nest-cli.json tsconfig*.json ./ 
COPY apps/reservation ./apps/reservation
COPY libs ./libs
COPY proto ./proto
RUN npm run build reservation          

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.env ./.env
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/reservation/prisma ./apps/reservation/prisma
EXPOSE 50053
CMD ["node", "dist/apps/reservation/src/main.js"]
