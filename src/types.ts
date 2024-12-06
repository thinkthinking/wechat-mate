export interface ChatMessage {
  msg_type: number;
  msg_id: string;
  created_at: Date;
  room_id?: string;
  room_name?: string;
  room_avatar?: string;
  talker_id: string;
  talker_name?: string;
  talker_avatar?: string;
  content?: string;
  url_title?: string;
  url_desc?: string;
  url_link?: string;
  url_thumb?: string;
}
