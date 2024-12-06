import { ChatMessage } from "./types.js";
import pkg from 'pg';
const { Pool } = pkg;

let pool: pkg.Pool | null = null;

export function getDb(): pkg.Pool {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  pool = new Pool({
    connectionString,
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  // 初始化数据库表
  initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(-1);
  });

  return pool;
}

async function initializeDatabase() {
  const pool = getDb();
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS chat_messages (
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
  `;

  try {
    await pool.query(createTableSQL);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

// 格式化时间戳为北京时间字符串
function formatBeijingTime(date: Date): string {
  const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return beijingTime.toISOString().replace('T', ' ').slice(0, 19);
}

export async function saveChatMessage(msg: ChatMessage) {
  try {
    const pool = getDb();
    const {
      msg_type,
      msg_id,
      created_at,
      room_id,
      room_name,
      room_avatar,
      talker_id,
      talker_name,
      talker_avatar,
      content,
      url_title,
      url_desc,
      url_link,
      url_thumb,
    } = msg;

    // 首先设置会话时区为 Asia/Shanghai
    await pool.query("SET timezone = 'Asia/Shanghai';");

    const sql = `
      INSERT INTO chat_messages(
        created_at,
        msg_id,
        room_id,
        room_name,
        room_avatar,
        talker_id,
        talker_name,
        talker_avatar,
        content,
        msg_type,
        url_title,
        url_desc,
        url_link,
        url_thumb
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING created_at
    `;

    const values = [
      created_at,
      msg_id,
      room_id,
      room_name,
      room_avatar,
      talker_id,
      talker_name,
      talker_avatar,
      content,
      msg_type,
      url_title,
      url_desc,
      url_link,
      url_thumb,
    ];

    const result = await pool.query(sql, values);
    const savedTime = result.rows[0].created_at;
    console.log("Message saved successfully at (Beijing time):", formatBeijingTime(savedTime));
  } catch (error) {
    console.error("Failed to save message:", error);
    throw error;
  }
}

// 获取最近的消息
export async function getRecentMessages(limit: number = 10) {
  try {
    const pool = getDb();
    
    // 设置时区
    await pool.query("SET timezone = 'Asia/Shanghai';");
    
    const sql = `
      SELECT 
        id,
        created_at,
        msg_id,
        room_name,
        talker_name,
        content,
        msg_type
      FROM chat_messages 
      ORDER BY created_at DESC 
      LIMIT $1
    `;

    const result = await pool.query(sql, [limit]);
    const messages = result.rows.map(row => ({
      ...row,
      created_at: formatBeijingTime(row.created_at)
    }));
    
    console.log("Recent messages (Beijing time):", messages);
    return messages;
  } catch (error) {
    console.error("Failed to get recent messages:", error);
    throw error;
  }
}
