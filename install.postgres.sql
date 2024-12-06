-- 设置时区为北京时间
SET timezone = 'Asia/Shanghai';

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    msg_id TEXT NOT NULL,
    room_id TEXT,
    room_name TEXT,
    room_avatar TEXT,
    talker_id TEXT NOT NULL,
    talker_name TEXT,
    talker_avatar TEXT,
    content TEXT,
    msg_type INTEGER,
    url_title TEXT,
    url_desc TEXT,
    url_link TEXT,
    url_thumb TEXT
);
