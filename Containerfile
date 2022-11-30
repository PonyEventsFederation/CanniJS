FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
		curl \
		software-properties-common \
	&& rm -rf /var/lib/apt/lists/*

# RUN useradd -m sani
# USER sani

ENV PNPM_VERSION 7.13.4
ENV PNPM_HOME /root/.local/share/pnpm
ENV PATH ${PATH}:/root/.local/share/pnpm
RUN curl -fsSL https://get.pnpm.io/install.sh | SHELL=`/bin/bash` sh - \
	&& pnpm -v

ENV NODE_VERSION 14.20.1
RUN pnpm env use -g ${NODE_VERSION}

WORKDIR /home/sani/app


COPY . .

RUN pnpm i --frozen-lockfile

RUN pnpm lint

RUN pnpm prune --prod && pnpm store prune

COPY LICENSE LICENSE

ENV NODE_ENV production

CMD ["node", "main.js"]
