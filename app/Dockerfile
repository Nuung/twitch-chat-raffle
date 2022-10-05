FROM node:16

WORKDIR /app

COPY package*.json ./

RUN yarn install

# 앱 소스 추가
COPY . .

# Docker 이미지 내에서 유효하기 때문에 이미지 바깥에서 접근할 수 있는 포트를 열어줘야 합니다. 이를 위해 EXPOSE 명령어를 지정해줍니다.
EXPOSE 3000

# 컨테이너에서 실행될 명령을 지정
CMD [ "yarn", "start:dev"]
