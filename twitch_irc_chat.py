import re
import socket
import logging
from emoji import demojize
from datetime import datetime
from twitch_calculation import result_calculation

"""
Get token here: https://twitchapps.com/tmi/

# server = 'irc.chat.twitch.tv'
# port = 6667
# nickname = 'qlgks1'
# token = 'oauth:'
# channel = '#hanryang1125' / dopa24
"""

class TwitchChat:

    # 생성자, oauth 토큰이랑 채널명을 동적으로 만들자 
    def __init__(self, oauth_token, channel) -> None:
        self.server = 'irc.chat.twitch.tv';
        self.port = 6667
        self.nickname = 'qlgks1'
        self.token = oauth_token
        self.channel = '#' + channel
        self.loggin_config()
        self.raffle_result = {}

    # 기본 loggin setting
    def loggin_config(self):
        logging.basicConfig(level=logging.DEBUG,
                            format='%(asctime)s — %(message)s',
                            datefmt='%Y-%m-%d_%H:%M:%S',
                            handlers=[logging.FileHandler('chat.log', encoding='utf-8')])

    # class main Action 부분
    def chat_connect(self):
        sock = socket.socket()
        sock.connect((self.server, self.port))
        sock.send(f"PASS {self.token}\r\n".encode('utf-8'))
        sock.send(f"NICK {self.nickname}\r\n".encode('utf-8'))
        sock.send(f"JOIN {self.channel}\r\n".encode('utf-8'))
        resp = sock.recv(2048).decode('utf-8') # at first

        try:
            while True:
                resp = sock.recv(2048).decode('utf-8')
                print(self.get_chat_parsing(resp))
                # print(get_chat_parsing(resp))
                # if resp.startswith('PING'):
                #     # sock.send("PONG :tmi.twitch.tv\n".encode('utf-8'))
                #     sock.send("PONG\n".encode('utf-8'))
                # elif len(resp) > 0:
                #     logging.info(get_chat_parsing(demojize(resp))) 
        
        # ctrl + c -> exit (end)
        except KeyboardInterrupt:
            sock.close()
            logging.info(self.raffle_result)

            # result chk and input 
            temp_input = input("if you want to see result right now? (y/n) >> ")
            while temp_input != 'y' and temp_input != 'Y' and temp_input != 'n' and temp_input != 'N':
                temp_input = input("please! input fuxking correct answer! (y/n) >> ")

            # result output 
            if temp_input == 'y' or temp_input == 'Y':
                print(self.raffle_result)
                exit()
            elif temp_input == 'n' or temp_input =='N':
                print(self.raffle_result)
                print("Bye! checkout chat.log or run twitch_calculation.py")
                exit()

        # other exception
        except Exception as e:
            print(f"chat_connect and getting msg error: {e}, {type(e).__name__}, {type(e)}")

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
                'username': username,
                'message': message.replace("\r", "")
            }
            
            # raffle -> dict / key에 cnt ++ 
            if self.raffle_result.get(username): self.raffle_result[username] = self.raffle_result[username] + 1
            else: self.raffle_result[username] = 1

            return d;
        except Exception: return None


# mian
if __name__ == '__main__':

    # twitch object만들고 바로 IRC 
    oauth_token = input("input oauth_token [https://twitchapps.com/tmi/] >> ")
    channel = input("input channel without # >> ")
    twitch_chat = TwitchChat(oauth_token, channel)
    twitch_chat.chat_connect()    

    # twitch_chat.raffle_result (dict) 기반으로 확률 계산하고 뽑아야함
    # 가중치 확률 계산 뽑기 정도로 생각하자 