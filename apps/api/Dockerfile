FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

# Install dependencies including workspaces
RUN npm install

# Copy source code
COPY . .

# Build not needed for API in dev, but good for prod structure
# RUN npm run build --workspace=@solo/api

EXPOSE 5000

CMD ["npm", "run", "dev", "--workspace=@solo/api"]
