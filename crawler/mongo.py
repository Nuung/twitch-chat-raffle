
# python lib
import numpy as np
from datetime import datetime
from pymongo import MongoClient

class MongoRepository():

    def __init__(self, **connection_info) -> None:
        if connection_info:
            db_info = connection_info
        else:
            db_info = MongoRepository.get_env()

        self.client = MongoClient(
            db_info["host"],
            int(db_info["port"]),
            connect=False,
            username=db_info["username"],
            password=db_info["password"],
            authSource=db_info["role"]
        )

        self.db = self.client["twitch_raffle"]
        self.db_migarte()

    def db_migarte(self):
        '''
        - db, collection 등 기본 세팅이 전혀 되어 있지 않으면, 자동으로 기본값으로 세팅
        - 하지만 OAuth Token은 직접 가져와야함
        '''
        # db_migrate 실시, index 설정까지 더불어서
        if "config" not in self.db.list_collection_names():
            # config, chat_msg_log collection 필요
            self.db.config.insert_one({
                "nick_name": "qlgks1",
                "oauth_token": "oauth:xtft5hce1muhkjhyx01oeqa1td6acc",
                "channel_name": "aba4647",
                "status": True
            })
            self.db.chat_msg_log.insert_one({
                "channel": "#aba4647",
                "username": "qlgks1",
                "message": "collection 세팅용\n",
                "time": datetime.now()
            })
            self.db.chat_msg_log.create_index("channel", unique=False)

    def is_crawling_on(self) -> bool:
        try:
            return self.db.config.find({})[0]['status']
        except Exception as exc:
            raise exc

    def get_crawler_config(self) -> dict:
        try:
            return self.db.config.find({})[0]
        except Exception as exc:
            raise exc

    def save_chat_message(self, msg: dict):
        try:
            self.db.chat_msg_log.insert_one(msg)
        except Exception as exc:
            raise exc

    @staticmethod
    def get_env() -> dict:
        '''
        - READ .env file and target info parsing
        '''
        with open("./.env", "r") as f:
            lines = f.readlines()
            for target_info in lines:
                if "DB_INFO" in target_info:
                    db_info = eval(target_info.split("=")[-1])  # str to dict
        return db_info
