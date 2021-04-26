import json
import numpy as np
from pymongo import MongoClient

# 가중치 계산
def result_calculation(target_result: dict):
    target_key_set = list(target_result.keys())
    p = np.array(list(target_result.values()), dtype=float)
    p /= p.sum()  # normalize

    raffle_result = np.random.choice(target_key_set, 1, p=p, replace=False) # 가중치 연산
    return raffle_result

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

# mian
if __name__ == '__main__':

    raffle_prise_user = ""
    db = get_main_client()
    config_info = db.twitch_raffle_result.find({})[0]

    # twitch_chat.raffle_result (dict) 기반으로 확률 계산하고 뽑아야함 -> chat.log file
    # 가중치 확률 계산 뽑기 정도로 생각하자 
    # with open("chat.log", "r") as f:
    #     lines = f.readlines()
    #     target_line = lines[-1]
    #     target_line = target_line.split("— ")[-1]
    #     target_line = eval(target_line) # str to dict 
    #     raffle_prise_user = result_calculation(target_line)

    raffle_prise_user = result_calculation(config_info['result_json'])
    print(f"congratulations! {raffle_prise_user}!")



