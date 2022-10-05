
# python lib
from datetime import datetime

class TwitchChat:

    # 생성자, oauth 토큰이랑 채널명을 동적으로 만들자
    def __init__(self, nickname, oauth_token, channel) -> None:
        self.server = 'irc.chat.twitch.tv'
        self.port = 6667
        self.nickname = nickname
        self.token = oauth_token
        self.channel = '#' + channel

    # chatting parsing -> target 데이터 추출
    def get_chat_parsing(self, txt: str):
        try:
            # 최초 JOIN 성공시 출력되는 message, pass
            if "JOIN" in txt:
                return

            created_at = datetime.now()
            msg = txt.split(":")

            data = dict(
                channel=self.channel,
                username=msg[1].split("!")[0],
                message=msg[-1].replace("\r", ""),
                created_at=created_at,
            )
            return data
        except Exception:
            return None
