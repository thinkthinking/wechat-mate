import { ScanStatus, WechatyBuilder } from "wechaty";
import QrcodeTerminal from "qrcode-terminal";
import { handleReceiveMessage } from "./message.js";

const token = "";
const bot = WechatyBuilder.build({
  puppet: "wechaty-puppet-wechat4u",
  puppetOptions: {
    token,
    timeoutSeconds: 60,
    tls: {
      disable: true,
    },
  },
});

bot
  .on("scan", (qrcode, status, data) => {
    console.log(`
  ============================================================
  qrcode : ${qrcode}, status: ${status}, data: ${data}
  ============================================================
  `);
    if (status === ScanStatus.Waiting) {
      QrcodeTerminal.generate(qrcode, {
        small: true,
      });
    }
  })
  .on("login", (user) => {
    console.log(`
  ============================================
  user: ${JSON.stringify(user)}, friend: ${user.friend()}, ${user.coworker()}
  ============================================
  `);
  })
  .on("message", handleReceiveMessage)
  .on("error", (err) => {
    console.log(err);
  });

bot.start();
