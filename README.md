# Twitch Chat (with IRC) Auto Raffle

> About twitch IRC chat [Offical DOCS](https://dev.twitch.tv/docs/irc) </br> About [IRC](https://en.wikipedia.org/wiki/Internet_Relay_Chat)

## Requirements

- `twitch.tv` account
- `docker` and `docker-compose`
- do not use port `80(nginx), 3000(node, expree), 28018(mongo), 8000(python)`

## Getting Start

1. you dont need to register "dev.twitch.tv". 
2. go >> https://www.learndatasci.com/tutorials/how-stream-text-data-twitch-sockets-python/ and get OAuth Token
    <img src="/github-readme-imgs/img1.png" width="600" />
3. `git clone https://github.com/Nuung/twitch-chat-raffle.git` and `cd twitch-chat-raffle`
4. go `./crawler/mongo.py - def db_migarte(self)` and change (line 37, 38, 39, 43, 44)
    ```python
        "nick_name": "qlgks1",
        "oauth_token": "oauth:xtft5hce1muhkjhyx01oeqa1td6acc",
        "channel_name": "aba4647",
    ```
5. go `./app/.env` and change `PAGE_TITLE` value to what you want
6. finally, go `./docker` and run script below
    ```shell
    source docker-start.sh
    ```

    <img src="/github-readme-imgs/img2.png" width="1000" />

    and if you use `docker desktop`, you can see the container list below

    <img src="/github-readme-imgs/img3.png" width="700" />
7. it's done! just go `http:localhost`
    <img src="/github-readme-imgs/img4.png" width="800" />

## Guide

> you can see the video guide this youtube page
> 

### about page useage

1. you can change config value, just click `Setting` button and change what you want
    <img src="/github-readme-imgs/img5.png" width="400" />

2. **🔴🔴 checkout 🔴🔴**, before change Setting(config) value, you have to **turn off** the crawling by clik `On` toggle button

3. if you click the user list area, you can see what user chated
    <img src="/github-readme-imgs/img6.png" width="400" />

4. you want to do raffle, just clikc `Raffle` button
    <img src="/github-readme-imgs/img7.png" width="400" />

    if you click the `OK` button, message database(collection in mongodb named `chat_msg_log`) will be initialize <br/>
    and save the result (user information) in `twitch_raffle_result` collection in mongodb <br/>
    or if you click the `Cancel`, nothing happen


### detail 

1. you can use mongodb AUTH mode, checkout files below
- `/mongodb/mongodb.conf`
- `/crawler/.env`
- `/crawler/mongodb.py`
- `/app/.env`
- `/app/routes/index.js`
- change mongodb values and re-build the image and docker-compose

2. If you want to change page logo, just change the file below
- `/app/public/images/logo.png`
- This task will be applied in real time by nginx. just refresh page.

### append

- I used express ejs view engine with vanilla-javascript and ajax(jquery) by signle page `index.ejs` <br>
- And I used just on routes `index.js`. Change every-thing what you want


## Tech
- node(expree), python3(IRC crawling), mongodb, nginx

--- 

## More About
- [개백수7호](https://www.twitch.tv/ddubbu7)
- 