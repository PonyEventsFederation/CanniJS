FROM debian:13-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
		wget \
	&& rm -rf /var/lib/apt/lists/*

ENV PNPM_VERSION 12.14.0
ENV PNPM_HOME /root/.local/share/pnpm
ENV PATH ${PATH}:/root/.local/share/pnpm/bin
RUN wget -qO- https://get.pnpm.io | env ENV="$HOME/.bashrc" SHELL="$(which bash)" bash - \
	&& pnpm -v

ENV NODE_VERSION 14.21.3
RUN pnpm rt set -g node ${NODE_VERSION}

WORKDIR /home/canni/app

COPY . .
RUN pnpm i --frozen-lockfile -P

COPY LICENSE LICENSE
ENV NODE_ENV production
CMD ["node", "main.js"]
