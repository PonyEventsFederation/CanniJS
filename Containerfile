FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
		curl \
		software-properties-common \
		unzip \
	&& rm -rf /var/lib/apt/lists/*

ENV BUN_INSTALL /root/.bun
ENV PATH ${PATH}:/root/.bun/bin
RUN curl -fsSL https://bun.sh/install | bash

ENV PNPM_HOME /root/.local/share/pnpm
RUN bun i -g pnpm@8.6.12

WORKDIR /home/canni/app
COPY . .

RUN pnpm i --frozen-lockfile -P

COPY LICENSE LICENSE
ENV NODE_ENV production
CMD ["bun", "main.js"]
