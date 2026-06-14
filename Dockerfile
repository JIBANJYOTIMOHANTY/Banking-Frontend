FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package*.json /app/
RUN npm ci --only=production
EXPOSE 4000
CMD ["node", "dist/banking-frontend/server/server.mjs"]
