FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
		curl \
		software-properties-common \
		unzip \
	&& rm -rf /var/lib/apt/lists/*

ENV BUN_INSTALL /root/.bun
ENV PATH ${PATH}:/root/.bun/bin
RUN curl -fsSL https://bun.sh/install | bash

WORKDIR /home/canni/app
COPY . .

RUN bun i --frozen-lockfile -p

COPY LICENSE LICENSE
ENV NODE_ENV production
CMD ["bun", "main.js"]
