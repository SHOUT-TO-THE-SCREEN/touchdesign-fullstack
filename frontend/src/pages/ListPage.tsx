// src/pages/ListPage.tsx
import "./ListPage.css"; // 또는 "./ListPage.css" 사용 중이면 그걸로 바꾸세요.
import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Topbar from "./list/Topbar";
import FileGrid from "./list/FileGrid";
import DetailPanel from "./list/DetailPanel";
import AddFilePanel from "./list/AddFilePanel";

import { filesSeed } from "./list/mockData";
import type { FileItem, ViewMode } from "./list/mockData";
import { authFetch } from "../lib/authFetch";

export default function ListPage() {
  const navigate = useNavigate();

  // ✅ files는 state로 관리해야 "추가"가 반영됩니다.
  const [filesAll, setFilesAll] = useState<FileItem[]>(filesSeed);

  const [query, setQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<number>(filesSeed[0]?.id ?? 1);

  // New Graph 이름 다이얼로그
  const [showNewGraph, setShowNewGraph] = useState(false);
  const [newGraphName, setNewGraphName] = useState("");

  // Rename 다이얼로그
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // 백엔드에서 저장된 그래프 목록 가져오기
  const fetchGraphs = useCallback(async () => {
    try {
      const res = await authFetch("/api/graphs");
      if (!res.ok) return;
      const items: Array<{
        name: string;
        thumbnail: string | null;
        savedAt: string | null;
        nodeCount: number | null;
        edgeCount: number | null;
        nodeKinds: string[] | null;
      }> = await res.json();
      const graphItems: FileItem[] = items.map((item, i) => ({
        id: -(i + 1),
        type: "graph",
        title: item.name,
        graphName: item.name,
        subtitle: "Studio Graph",
        thumbnail: item.thumbnail ?? undefined,
        createdAt: item.savedAt ?? undefined,
        nodeCount: item.nodeCount ?? undefined,
        edgeCount: item.edgeCount ?? undefined,
        nodeKinds: item.nodeKinds ?? undefined,
      }));
      setFilesAll((prev) => {
        const nonGraphs = prev.filter((f) => f.type !== "graph");
        return [...graphItems, ...nonGraphs];
      });
    } catch {
      // 서버 꺼져 있으면 무시
    }
  }, []);

  useEffect(() => {
    fetchGraphs();
  }, [fetchGraphs]);

  // 그래프 열기
  const handleOpenGraph = useCallback((file: FileItem) => {
    if (file.type === "graph" && file.graphName) {
      navigate(`/visualizer?graph=${encodeURIComponent(file.graphName)}`);
    }
  }, [navigate]);

  // 그래프 삭제
  const handleDelete = useCallback(async (id: number) => {
    const file = filesAll.find((f) => f.id === id);
    if (!file?.graphName) return;
    try {
      await authFetch(`/api/graphs/${encodeURIComponent(file.graphName)}`, { method: "DELETE" });
      await fetchGraphs();
    } catch { /* ignore */ }
  }, [filesAll, fetchGraphs]);

  // 그래프 이름 변경
  const handleRenameSubmit = useCallback(async (newName: string) => {
    if (!renameTarget?.graphName || !newName.trim()) return;
    try {
      await authFetch(`/api/graphs/${encodeURIComponent(renameTarget.graphName)}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName: newName.trim() }),
      });
      await fetchGraphs();
    } catch { /* ignore */ }
    setRenameTarget(null);
  }, [renameTarget, fetchGraphs]);

  const files = useMemo<FileItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filesAll;
    return filesAll.filter((f) => (f.title ?? "").toLowerCase().includes(q));
  }, [query, filesAll]);

  const selected = useMemo<FileItem | undefined>(() => {
    return filesAll.find((f) => f.id === selectedId) ?? files[0];
  }, [filesAll, selectedId, files]);

  const nextId = useMemo<number>(() => {
    const max = filesAll.reduce((m, f) => Math.max(m, f.id), 0);
    return max + 1;
  }, [filesAll]);

  return (
    <div className="page_list">
      <div className="shell_list">
        <div className="layout_list">
          <main className="center_list">
            <div className="card_list">
              <Topbar
                query={query}
                setQuery={setQuery}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onNewGraph={() => { setNewGraphName(""); setShowNewGraph(true); }}
              />

              <div className="cardScroll_list">
                <FileGrid
                  files={files}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  viewMode={viewMode}
                  onOpen={(id) => {
                    const f = filesAll.find((x) => x.id === id);
                    if (f) handleOpenGraph(f);
                  }}
                  onDelete={handleDelete}
                  onRename={(id) => {
                    const f = filesAll.find((x) => x.id === id);
                    if (f) { setRenameTarget(f); setRenameValue(f.title); }
                  }}
                />
              </div>
            </div>
          </main>

          <DetailPanel
            selected={selected}
            onOpen={selected ? () => handleOpenGraph(selected) : undefined}
          />
        </div>
      </div>

      {/* New Graph 이름 다이얼로그 */}
      {showNewGraph && (
        <div
          className="modalOverlay_list"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowNewGraph(false); }}
        >
          <div className="modalCard_list" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHead_list">
              <div className="modalTitle_list">New Graph</div>
              <button className="modalClose_list" type="button" onClick={() => setShowNewGraph(false)}>×</button>
            </div>
            <div className="modalBody_list">
              <label className="field_list">
                <div className="fieldLabel_list">Graph Name</div>
                <input
                  className="fieldInput_list"
                  value={newGraphName}
                  onChange={(e) => setNewGraphName(e.target.value)}
                  placeholder="예: my-graph"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newGraphName.trim()) {
                      navigate(`/visualizer?graph=${encodeURIComponent(newGraphName.trim())}`);
                    }
                    if (e.key === "Escape") setShowNewGraph(false);
                  }}
                />
              </label>
            </div>
            <div className="modalFoot_list">
              <button className="btnGhost_list" type="button" onClick={() => setShowNewGraph(false)}>Cancel</button>
              <button
                className="btnPrimary_list"
                type="button"
                disabled={!newGraphName.trim()}
                onClick={() => navigate(`/visualizer?graph=${encodeURIComponent(newGraphName.trim())}`)}
              >
                Create & Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename 다이얼로그 */}
      {renameTarget && (
        <div
          className="modalOverlay_list"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setRenameTarget(null); }}
        >
          <div className="modalCard_list" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHead_list">
              <div className="modalTitle_list">Rename Graph</div>
              <button className="modalClose_list" type="button" onClick={() => setRenameTarget(null)}>×</button>
            </div>
            <div className="modalBody_list">
              <label className="field_list">
                <div className="fieldLabel_list">New Name</div>
                <input
                  className="fieldInput_list"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && renameValue.trim()) handleRenameSubmit(renameValue);
                    if (e.key === "Escape") setRenameTarget(null);
                  }}
                />
              </label>
            </div>
            <div className="modalFoot_list">
              <button className="btnGhost_list" type="button" onClick={() => setRenameTarget(null)}>Cancel</button>
              <button
                className="btnPrimary_list"
                type="button"
                disabled={!renameValue.trim()}
                onClick={() => handleRenameSubmit(renameValue)}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Add File 모달 */}
      <AddFilePanel
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreate={(payload) => {
          const created: FileItem = { id: nextId, ...payload };

          setFilesAll((prev) => [created, ...prev]);
          setSelectedId(created.id);
          setIsAddOpen(false);

          // ✅ 생성 직후 Visualizer로 이동 (+ state로도 전달)
          navigate(`/visualizer/${created.id}`, { state: { file: created } });
        }}
      />
    </div>
  );
}
