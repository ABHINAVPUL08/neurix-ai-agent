import type { AiModeId } from "@/lib/ai-modes";

export type MessageRole = "user" | "assistant";

export type MessageFeedback = "up" | "down" | null;

export type MessageKind = "chat" | "document-analysis";

export type ChatMessageItem = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  feedback?: MessageFeedback;
  kind?: MessageKind;
};

export type UploadedFileRecord = {
  id: string;
  name: string;
  analyzedAt: number;
  analysisPreview?: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessageItem[];
  uploadedFiles: UploadedFileRecord[];
  aiMode: AiModeId;
  createdAt: number;
  updatedAt: number;
};

export type OrbState = "idle" | "thinking" | "speaking" | "listening";

export type AppView = "chat" | "dashboard";
