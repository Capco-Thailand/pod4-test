FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace @endorsement/api --include-workspace-root
COPY apps/api apps/api
RUN npm run build --workspace @endorsement/api
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@endorsement/api"]
