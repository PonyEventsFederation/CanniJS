FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
		curl \
		software-properties-common \
	&& rm -rf /var/lib/apt/lists/*

ENV PNPM_VERSION 9.6.0
ENV PNPM_HOME /root/.local/share/pnpm
ENV PATH ${PATH}:/root/.local/share/pnpm
RUN curl -fsSL https://get.pnpm.io/install.sh | SHELL=`/bin/bash` sh - \
	&& pnpm -v

ENV NODE_VERSION 14.21.3
RUN pnpm env use -g ${NODE_VERSION}

WORKDIR /home/canni/app

COPY . .
RUN pnpm i --frozen-lockfile -P

COPY LICENSE LICENSE
ENV NODE_ENV production
CMD ["node", "main.js"]
