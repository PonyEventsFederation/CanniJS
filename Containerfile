FROM debian:bullseye

ENV NODE_VERSION 18.4.0
ENV PNPM_VERSION 7.6.0
ENV PNPM_HOME /root/.local/share/pnpm
ENV PATH ${PATH}:/root/.local/share/pnpm

RUN useradd -D canni
USER canni

RUN apt-get update && apt-get install -y --no-install-recommends \
		curl \
		software-properties-common \
	&& rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://get.pnpm.io/install.sh | SHELL=`/bin/bash` sh - \
	&& pnpm -v

RUN pnpm env use -g ${NODE_VERSION}

WORKDIR /app

COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY LICENSE LICENSE

RUN pnpm i --frozen-lockfile

COPY jsconfig.json jsconfig.json
COPY src src
COPY data data

RUN pnpm build

COPY .eslintrc.js .eslintrc.js

RUN pnpm lint

CMD ["node", "src/index.mjs"]
