FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

COPY --from=build /app/package*.json .
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/src/database/prisma ./src/database/prisma

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]

EXPOSE 3001