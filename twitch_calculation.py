import json

"""
Get token here: https://twitchapps.com/tmi/

# server = 'irc.chat.twitch.tv'
# port = 6667
# nickname = 'qlgks1'
# token = 'oauth:zp9ya6rlcec2oiprz2h9pnf66ju6ye'
# channel = '#hanryang1125' / dopa24
"""

# 가중치 계산
def result_calculation(target_result: dict):
    print()

# mian
if __name__ == '__main__':

    # twitch_chat.raffle_result (dict) 기반으로 확률 계산하고 뽑아야함 -> chat.log file
    # 가중치 확률 계산 뽑기 정도로 생각하자 
    with open("chat.log", "r") as f:
        lines = f.readlines()
        target_line = lines[-1]
        target_line = target_line.split("— ")[-1]
        target_line = eval(target_line) # str to dict 
        result_calculation(target_line)
        
        # print(target_line['bsk9668'])


