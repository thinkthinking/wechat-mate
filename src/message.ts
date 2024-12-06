import * as PUPPET from "wechaty-puppet";
import { MessageInterface } from "wechaty/impls";
import { parseChatMessage } from "./utils.js";
import { saveChatMessage } from "./db.js";

export async function handleReceiveMessage(msg: MessageInterface) {
  try {
    // 获取发送者和群组信息
    const talker = msg.talker();
    const room = msg.room();
    const messageObj = {
      ...msg,
      talker_name: talker ? talker.name() : 'unknown',
      room_name: room ? await room.topic() : 'private_chat'
    };
    console.log("receive message: ", messageObj);

    const m = await parseChatMessage(msg);

    if (
      m.msg_type === PUPPET.types.Message.Text ||
      m.msg_type === PUPPET.types.Message.Url
    ) {
      try {
        await saveChatMessage(m);
      } catch (error: any) {
        if (error?.code === 503) {
          console.error("Service temporarily unavailable. Will retry in 5 seconds...");
          // 5秒后重试一次
          setTimeout(async () => {
            try {
              await saveChatMessage(m);
            } catch (retryError) {
              console.error("Retry failed:", retryError);
            }
          }, 5000);
        } else {
          console.error("Failed to save message:", error);
        }
      }
    }
  } catch (e) {
    console.error("parse chat message failed: ", e);
  }
}
