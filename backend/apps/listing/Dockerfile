
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                     
COPY nest-cli.json tsconfig*.json ./ 
COPY apps/listing ./apps/listing
COPY libs ./libs
COPY proto ./proto
RUN npm run build listing          

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.env ./.env
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/listing/prisma ./apps/listing/prisma
EXPOSE 50052
CMD ["node", "dist/apps/listing/src/main.js"]
