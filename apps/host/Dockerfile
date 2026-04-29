#--------------------------------------
# Stage: Compile Apps
#--------------------------------------
FROM node:22.15.0-alpine3.21 AS builder

ENV REFRESHED_AT 2019-12-08

WORKDIR /app

RUN apk update && apk upgrade
RUN apk add build-base bash curl \
    libffi-dev jpeg-dev zlib-dev openssl-dev \
    autoconf automake libc6-compat libjpeg-turbo-dev \
    libpng-dev nasm libtool g++ make git python3

RUN npm install -g node-gyp \
    && rm -rf /var/cache/apk/*


COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . ./

RUN cp .env.unstable .env

# Increase memory for the build process to 8GB
ENV NODE_OPTIONS --max-old-space-size=4096
RUN yarn build

#--------------------------------------
# Stage: Packaging Apps
#--------------------------------------
FROM nginx:1.29-alpine

VOLUME /app
COPY --from=builder /app/dist /app

EXPOSE 80

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
