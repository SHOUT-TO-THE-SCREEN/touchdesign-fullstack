import { useState, useEffect, useRef } from "react";
import { useReactFlow } from "reactflow";
import { useSearchParams } from "react-router-dom";
import { useStudioStore } from "../state/studioStore";
import { authFetch } from "../../lib/authFetch";
import "./SaveLoadBar.css";

export default function SaveLoadBar() {
  const rf = useReactFlow();
  const loadGraphState = useStudioStore((s) => s.loadGraphState);
  const [searchParams] = useSearchParams();

  const [name, setName] = useState(() => searchParams.get("graph") ?? "my-graph");
  const [list, setList] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // URL ?graph= 파라미터로 자동 불러오기
  useEffect(() => {
    const graphParam = searchParams.get("graph");
    if (!graphParam) return;
    authFetch(`/api/graphs/${encodeURIComponent(graphParam)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return; // 없으면 빈 캔버스로 시작
        rf.setNodes(data.nodes ?? []);
        rf.setEdges(data.edges ?? []);
        loadGraphState(data.paramsById ?? {}, data.nodeKindById ?? {});
        setStatus("불러오기 완료 ✓");
        setTimeout(() => setStatus(null), 2000);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 1회만

  // 목록 불러오기 (Load 드롭다운용 이름만 추출)
  const fetchList = async () => {
    try {
      const res = await authFetch("/api/graphs");
      const items: Array<{ name: string }> = await res.json();
      setList(items.map((item) => item.name));
    } catch {
      setList([]);
    }
  };

  // 드롭다운 열릴 때 목록 갱신
  const toggleDropdown = async () => {
    if (!open) await fetchList();
    setOpen((v) => !v);
  };

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // ── 저장 ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const s = useStudioStore.getState();
    // 뷰어가 켜져 있고 캔버스에 실제 픽셀이 있을 때만 썸네일 캡처
    const vc = s.viewerCanvas;
    const thumbnail =
      s.viewerEnabled && vc && vc.width > 0 && vc.height > 0
        ? vc.toDataURL("image/jpeg", 0.7)
        : null;
    const nodes = rf.getNodes();
    const edges = rf.getEdges();
    const nodeKinds = [...new Set(Object.values(s.nodeKindById))];
    const payload = {
      nodes,
      edges,
      paramsById: s.paramsById,
      nodeKindById: s.nodeKindById,
      thumbnail,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodeKinds,
    };
    try {
      await authFetch(`/api/graphs/${encodeURIComponent(trimmed)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus("저장 완료 ✓");
    } catch {
      setStatus("저장 실패");
    }
    setTimeout(() => setStatus(null), 2000);
  };

  // ── 불러오기 ──────────────────────────────────────────────────────────────
  const handleLoad = async (graphName: string) => {
    setOpen(false);
    try {
      const res = await authFetch(`/api/graphs/${encodeURIComponent(graphName)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      // ReactFlow 노드/엣지 복원
      rf.setNodes(data.nodes ?? []);
      rf.setEdges(data.edges ?? []);
      // Zustand 파라미터 복원
      loadGraphState(data.paramsById ?? {}, data.nodeKindById ?? {});
      setName(graphName);
      setStatus("불러오기 완료 ✓");
    } catch {
      setStatus("불러오기 실패");
    }
    setTimeout(() => setStatus(null), 2000);
  };

  const isErr = status?.includes("실패");

  return (
    <div className="slb">
      <input
        className="slb__input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        placeholder="graph name"
      />

      <button className="slb__btn slb__btn--save" onClick={handleSave}>
        Save
      </button>

      <div className="slb__drop" ref={dropRef}>
        <button className="slb__btn slb__btn--load" onClick={toggleDropdown}>
          Load
          <span className={`slb__chevron${open ? " slb__chevron--open" : ""}`}>▾</span>
        </button>

        {open && (
          <div className="slb__menu">
            {list.length === 0 ? (
              <div className="slb__menuEmpty">No saved graphs</div>
            ) : list.map((g) => (
              <div key={g} className="slb__menuItem" onClick={() => handleLoad(g)}>
                {g}
              </div>
            ))}
          </div>
        )}
      </div>

      {status && (
        <span className={`slb__status${isErr ? " slb__status--err" : " slb__status--ok"}`}>
          {status}
        </span>
      )}
    </div>
  );
}
