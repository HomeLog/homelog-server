FROM node:22-alpine as build
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY src/database/prisma/schema.prisma ./src/database/prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:22-alpine as production
WORKDIR /app

COPY --from=build /app/package*.json .
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]