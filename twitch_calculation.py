import json
import numpy as np

"""
Get token here: https://twitchapps.com/tmi/

# server = 'irc.chat.twitch.tv'
# port = 6667
# nickname = 'qlgks1'
# token = 'oauth:'
# channel = '#hanryang1125' / dopa24 / ddubbu7 -> https://www.twitch.tv/ddubbu7
"""

# 가중치 계산
def result_calculation(target_result: dict):
    target_key_set = list(target_result.keys())
    p = np.array(list(target_result.values()), dtype=float)
    p /= p.sum()  # normalize

    raffle_result = np.random.choice(target_key_set, 1, p=p, replace=False) # 가중치 연산
    return raffle_result

# mian
if __name__ == '__main__':

    raffle_prise_user = ""

    # twitch_chat.raffle_result (dict) 기반으로 확률 계산하고 뽑아야함 -> chat.log file
    # 가중치 확률 계산 뽑기 정도로 생각하자 
    with open("chat.log", "r") as f:
        lines = f.readlines()
        target_line = lines[-1]
        target_line = target_line.split("— ")[-1]
        target_line = eval(target_line) # str to dict 
        raffle_prise_user = result_calculation(target_line)

    print(f"congratulations!!! ####{raffle_prise_user}####")
        


