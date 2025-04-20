
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                     
COPY nest-cli.json tsconfig*.json ./ 
COPY apps/apigateway ./apps/apigateway
COPY libs ./libs
COPY proto ./proto
RUN npm run build apigateway          

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.env ./.env
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/apps/apigateway/src/main.js"]
