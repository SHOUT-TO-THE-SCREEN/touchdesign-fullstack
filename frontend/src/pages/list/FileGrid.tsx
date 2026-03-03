// src/pages/list/FileGrid.tsx
import { useState, useEffect, useRef } from "react";
import { typeIcon } from "./mockData";
import type { FileItem, ViewMode } from "./mockData";

type FileGridProps = {
  files: FileItem[];
  selectedId: number;
  setSelectedId: (id: number) => void;
  viewMode: ViewMode;
  onOpen?: (id: number) => void;
  onDelete?: (id: number) => void;
  onRename?: (id: number) => void;
};

export default function FileGrid({
  files, selectedId, setSelectedId, viewMode, onOpen, onDelete, onRename,
}: FileGridProps) {
  const [menuId, setMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`grid_list ${viewMode === "list" ? "list" : ""}`}>
      {files.map((f) => (
        <div
          key={f.id}
          className={`fileCard_list ${f.id === selectedId ? "selected" : ""} ${viewMode === "list" ? "list" : ""}`}
          onClick={() => setSelectedId(f.id)}
          onDoubleClick={() => onOpen?.(f.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") onOpen?.(f.id); }}
        >
          <div className="fileTop_list">
            <div className="fileLeft_list">
              <div className="fileIcon_list">{typeIcon(f.type)}</div>
              <div className="fileSize_list">{f.size ?? "-"}</div>
            </div>

            {/* ⋯ 드롭다운 메뉴 */}
            <div
              style={{ position: "relative" }}
              ref={menuId === f.id ? menuRef : null}
            >
              <button
                className="dots_list"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuId(menuId === f.id ? null : f.id);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: "0 4px" }}
              >
                ⋯
              </button>

              {menuId === f.id && (
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 4px)", right: 0,
                    minWidth: 150, background: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.6)", zIndex: 200,
                    overflow: "hidden",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {f.type === "graph" && (
                    <MenuItem
                      label="Open in Studio"
                      onClick={() => { onOpen?.(f.id); setMenuId(null); }}
                    />
                  )}
                  <MenuItem
                    label="Rename"
                    onClick={() => { onRename?.(f.id); setMenuId(null); }}
                  />
                  <MenuItem
                    label="Delete"
                    danger
                    onClick={() => { onDelete?.(f.id); setMenuId(null); }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="fileBody_list">
            <div className="fileTitle_list">{f.title}</div>
            <div className="fileSub_list">{f.subtitle ?? ""}</div>
          </div>

          <div className="fileBottom_list">
            <div className="bar_list">
              <div className="barFill_list" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block", width: "100%", textAlign: "left",
        padding: "8px 14px", fontSize: 12,
        background: "none", border: "none", cursor: "pointer",
        color: danger ? "#f87171" : "#ddd",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {label}
    </button>
  );
}
