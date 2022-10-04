#!/bin/bash

cd ../crawler
docker build . -t tcr-crawler

cd ../app
docker build . -t tcr-app

cd ../docker

docker-compose -f docker-compose.yml -p twitch-chat-raffle-app stop
docker-compose -f docker-compose.yml -p twitch-chat-raffle-app down
docker-compose -f docker-compose.yml -p twitch-chat-raffle-app up -d
