import * as PUPPET from "wechaty-puppet";
import { MessageInterface } from "wechaty/impls";
import { ChatMessage } from "./types.js";

export async function parseChatMessage(
  msg: MessageInterface
): Promise<ChatMessage> {
  const msg_type = msg.type();
  const msg_id = msg.id;
  const payload = msg.payload;
  const talker = msg.talker();

  if (!msg_id || !payload || !talker) {
    console.log("invalid msg: ", msg);
    return Promise.reject("invalid msg");
  }

  let room_id = "";
  let room_name = "";
  let room_avatar = "";

  const room = msg.room();

  if (room) {
    room_id = room.id;
    room_name = (await room.topic()).trim();
    room_avatar = room.payload?.avatar || "";
  }

  const talker_id = talker.id;
  const talker_name = talker.name().trim();
  const talker_avatar = talker.payload?.avatar;

  // 获取消息创建时间
  const timestamp = msg.date().getTime();
  const created_at = new Date(timestamp);

  console.log("Original timestamp:", timestamp);
  console.log("Created at (UTC):", created_at.toISOString());
  console.log("Created at (Beijing):", new Date(timestamp + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19));

  let content = "";
  let url_title = "";
  let url_desc = "";
  let url_link = "";
  let url_thumb = "";

  switch (msg_type) {
    case PUPPET.types.Message.Text:
      content = msg.text().trim();
      break;
    case PUPPET.types.Message.Url:
      const urlMsg = await msg.toUrlLink();

      url_title = urlMsg.title();
      url_desc = urlMsg.description() || "";
      url_link = urlMsg.url();
      url_thumb = urlMsg.thumbnailUrl() || "";
      break;
    default:
      console.log("msg type not support");
      return Promise.reject(`msg type not support: ${msg_type}`);
  }

  return Promise.resolve({
    msg_type,
    msg_id,
    created_at,
    talker_id,
    talker_name,
    talker_avatar,
    room_id,
    room_name,
    room_avatar,
    content,
    url_title,
    url_desc,
    url_link,
    url_thumb,
  });
}
