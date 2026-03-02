// src/pages/list/mockData.ts (또는 현재 mockData.ts 위치)
export type FileType = "folder" | "video" | "music" | "figma" | "image" | "word" | "excel" | "graph";
export type ViewMode = "grid" | "list";
export type PreviewType = "video";

export type FileItem = {
  id: number;
  type: FileType;
  title: string;
  subtitle?: string;
  size?: string;
  previewType?: PreviewType;
  previewSrc?: string;
  graphName?: string;
  createdAt?: string;
  thumbnail?: string;
  nodeCount?: number;
  edgeCount?: number;
  nodeKinds?: string[];
};

export const filesSeed: FileItem[] = [];

export function typeIcon(type: FileType): string {
  const map: Record<FileType, string> = {
    folder: "📁",
    video: "🎬",
    music: "🎵",
    figma: "🟣",
    image: "🖼️",
    word: "🟦",
    excel: "🟩",
    graph: "⬡",
  };
  return map[type] ?? "📄";
}
