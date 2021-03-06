import re
import socket
import logging
from datetime import datetime
from twitch_calculation import result_calculation
from pymongo import MongoClient
from time import sleep

"""
Get token here: https://twitchapps.com/tmi/
https://www.learndatasci.com/tutorials/how-stream-text-data-twitch-sockets-python/ 

# server = 'irc.chat.twitch.tv'
# port = 6667
# nickname = 'qlgks1'
# token = 'oauth:'
# channel = '#hanryang1125' / dopa24
"""

class TwitchChat:

    # 생성자, oauth 토큰이랑 채널명을 동적으로 만들자 
    def __init__(self, nickname, oauth_token, channel) -> None:
        self.server = 'irc.chat.twitch.tv';
        self.port = 6667
        self.nickname = nickname
        self.token = oauth_token
        self.channel = '#' + channel
        self.loggin_config()
        if db.twitch_raffle_result.find({})[0]['result_json'] == "": self.raffle_result = {}
        else: db.twitch_raffle_result.find({})[0]['result_json']

    # 기본 loggin setting
    def loggin_config(self):
        logging.basicConfig(level=logging.DEBUG,
                            format='%(asctime)s — %(message)s',
                            datefmt='%Y-%m-%d_%H:%M:%S',
                            handlers=[logging.FileHandler('chat.log', encoding='utf-8')])

    # chatting parsing -> target 데이터 추출
    def get_chat_parsing(self, txt: str):
        try:
            # temp = txt.split("#")[-1].split(":")
            # temp[1] = temp[1].replace("\r\n", "")
            time_logged = datetime.now().strftime('%Y-%m-%d_%H:%M:%S')
            username, channel, message = re.search(
                ':(.*)\!.*@.*\.tmi\.twitch\.tv PRIVMSG #(.*) :(.*)', txt
            ).groups()

            d = {
                'dt': time_logged,
                'channel': channel,
                'username': username,
                'message': message.replace("\r", "")
            }
            
            # raffle -> dict / key에 cnt ++ 
            if self.raffle_result.get(username): self.raffle_result[username] = self.raffle_result[username] + 1
            else: self.raffle_result[username] = 1

            # save to db.twitch_chat_dumps for dump logs
            if d is not None: db.twitch_chat_dumps.save(d)

            # update to db.twitch_raffle_result
            db.twitch_raffle_result.update_one({ "type": "Leaderboard" }, { "$set" : { "result_json": self.raffle_result} })

            return d;
        except Exception: return None


#############################################################################################

def get_main_client():
    # db config info
    db_info = {}

    # READ .env file and target info parsing
    with open(".env", "r") as f:
        lines = f.readlines()
        for target_info in lines:
            if "DB_INFO" in target_info:
                db_info = eval(target_info.split("=")[-1]) # str to dict 

    client = MongoClient(db_info['host'], int(db_info['port']), connect=False,
                        username=db_info['username'],
                        password=db_info['password'],
                        authSource=db_info['role'])
    return client['twitch_raffle']

def is_on(db):
    return db.on_off_check.find({})[0]['status']

# mian
if __name__ == '__main__':
    # db config
    db = get_main_client()

    # twitch object만들고 바로 IRC 
    # 1. db.config에서 nick_name, oauth_token, channel_name 가져와서 세팅 가능
    config_info = db.config.find({})[0]
    twitch_chat = TwitchChat(config_info['nick_name'], config_info['oauth_token'], config_info['channel_name'])
    is_need_init = True

    while True:
        # 2. create chat connection 
        if is_on(db) and is_need_init:
            print("init connection")
            config_info = db.config.find({})[0]
            twitch_chat = TwitchChat(config_info['nick_name'], config_info['oauth_token'], config_info['channel_name'])
            is_need_init = False
            sock = socket.socket()
            sock.settimeout(3000)
            sock.connect((twitch_chat.server, twitch_chat.port))
            sock.send(f"PASS {twitch_chat.token}\r\n".encode('utf-8'))
            sock.send(f"NICK {twitch_chat.nickname}\r\n".encode('utf-8'))
            sock.send(f"JOIN {twitch_chat.channel}\r\n".encode('utf-8'))
            resp = sock.recv(2048).decode('utf-8') # at first            
        elif is_on(db) and is_need_init == False: # 3. on / off check -> on
            try: 
                resp = sock.recv(2048).decode('utf-8')
                if resp.startswith('PING'): sock.send("PONG\n".encode('utf-8'))
                elif len(resp) > 0: print(twitch_chat.get_chat_parsing(resp))
            except Exception as e: 
                print(f"error: {e}, {type(e).__name__}, {type(e)}")
                pass
        else: # off -> sock close and need obj init
            try:
                print("close sock")
                sock.close()
            except Exception as e: 
                pass
            
            print("end up")
            is_need_init = True
            sleep(5)