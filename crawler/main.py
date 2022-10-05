"""
Get token here: https://twitchapps.com/tmi/
https://www.learndatasci.com/tutorials/how-stream-text-data-twitch-sockets-python/ 

# server = 'irc.chat.twitch.tv'
# port = 6667
# nickname = 'qlgks1'
# token = 'oauth:'
# channel = '#hanryang1125' / dopa24
"""

# python lib
import os
import sys
import socket
import logging
from enum import Enum
from time import sleep

# custom lib
from mongo import MongoRepository
from twitch_chat import TwitchChat

# STATIC ENUM
class CrawlStatus(Enum):
    INIT = (1, "crawl process init") # repo.is_crawling_on() and is_need_init
    PROGRESS = (2, "crawl process progress") # repo.is_crawling_on() and is_need_init == False
    CLOSED = (3, "crawl process socket close") # After init => off(off at first)
    SLEEPING = (4, "crawl process waitting until turn on") # SLEEPING


if __name__ == '__main__':

    # log conifg
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s — %(message)s',
        datefmt='%Y-%m-%d_%H:%M:%S',
        handlers=[logging.FileHandler('./logs/twitch_chat_crawling.log', encoding='utf-8')]
    )    

    # db config
    repo = MongoRepository()

    # twitch object만들고 바로 IRC
    #######################################
    # 1. db.config에서 nick_name, oauth_token, channel_name 가져와서 세팅 가능
    #######################################
    config_info = repo.get_crawler_config()
    is_need_init = True

    while True:
        try:
            #######################################
            # 2. create chat connection, 최초 진입점
            #######################################
            if repo.is_crawling_on() and is_need_init:
                logging.info(f"{CrawlStatus.INIT.value} [ init connection ]")
                config_info = repo.get_crawler_config()
                twitch_chat = TwitchChat(
                    config_info['nick_name'],
                    config_info['oauth_token'],
                    config_info['channel_name']
                )
                is_need_init = False

                # make socket and listen
                sock = socket.socket()
                sock.settimeout(3000)
                sock.connect((twitch_chat.server, twitch_chat.port))
                sock.send(f"PASS {twitch_chat.token}\r\n".encode('utf-8'))
                sock.send(f"NICK {twitch_chat.nickname}\r\n".encode('utf-8'))
                sock.send(f"JOIN {twitch_chat.channel}\r\n".encode('utf-8'))
                response = sock.recv(2048).decode('utf-8')  # at first
                logging.info(f"{CrawlStatus.PROGRESS.value} [ ON >> progress crawling ]")

            #######################################
            # 3. After init => on / off check -> on
            #######################################
            elif repo.is_crawling_on() and is_need_init == False:

                try:
                    response = sock.recv(2048).decode('utf-8')
                    if response.startswith('PING'):
                        sock.send("PONG\n".encode('utf-8'))
                    elif len(response) > 0:
                        msg = twitch_chat.get_chat_parsing(response)
                        if msg:
                            repo.save_chat_message(msg)
                except Exception as e:
                    logging.error(f"{CrawlStatus.CLOSED.value} [ error: {e}, {type(e).__name__}, {type(e)} ]")
                    pass
            
            #######################################
            # 4. After init => off(off at first)
            #######################################
            elif is_need_init == False:
                logging.info(f"{CrawlStatus.CLOSED.value} [ OFF >> close sock ]")

                try:
                    sock.close()
                except Exception as e:
                    logging.error(f"{CrawlStatus.CLOSED.value} [ error: {e}, {type(e).__name__}, {type(e)} ]")
                is_need_init = True
                sleep(5)

            #######################################
            # 5. wait for start
            #######################################
            else:
                logging.info(f"{CrawlStatus.SLEEPING.value} [ OFF >> SLEEPING, waiting ON ]")
                sleep(30)
        
        except KeyboardInterrupt:
            logging.info(f"[ developer stop process ]")
            sock.close()
            is_need_init = True
            try:
                sys.exit(0)
            except SystemExit:
                os._exit(0)

        except Exception as e:
            logging.error(f" while error: {e}, {type(e).__name__}, {type(e)} ]")
            is_need_init = True
            continue
