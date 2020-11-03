FROM node:14.14.0-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
# run start is used for prod, defined in package.json
CMD ["npm", "run", "start"]