// src/pages/list/DetailPanel.tsx
import type { FileItem } from "./mockData";

type DetailPanelProps = {
  selected?: FileItem;
  onOpen?: () => void;
};

export default function DetailPanel({ selected, onOpen }: DetailPanelProps) {
  return (
    <section className="right_list">
      <div className="card_list">
        <div className="preview_list">
          {selected?.type === "graph" && selected.thumbnail ? (
            <img
              src={selected.thumbnail}
              alt={selected.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : selected?.type === "graph" ? (
            <div className="previewPlaceholder_list" style={{ fontSize: 32, opacity: 0.3 }}>⬡</div>
          ) : selected?.previewType === "video" && selected.previewSrc ? (
            <video className="previewMedia_list" src={selected.previewSrc} controls autoPlay muted playsInline />
          ) : (
            <div className="previewPlaceholder_list">Preview</div>
          )}
        </div>

        <div className="detail_list">
          <div className="detailTitle_list">{selected?.title ?? "No selection"}</div>
          <div className="detailSub_list">{selected?.subtitle ?? ""}</div>

          {selected?.type === "graph" && onOpen && (
            <button
              className="btnPrimary_list"
              type="button"
              onClick={onOpen}
              style={{ marginBottom: 12, width: "100%" }}
            >
              Open in Studio
            </button>
          )}

          {selected?.type === "graph" && selected.nodeKinds && selected.nodeKinds.length > 0 && (
            <div className="tags_list">
              {selected.nodeKinds.map((k) => (
                <span className="tag_list" key={k}>{k}</span>
              ))}
            </div>
          )}

          {selected?.type !== "graph" && (
            <div className="tags_list">
              {["3d concept", "futuristic", "purple", "minimalistic", "highly detailed"].map((t) => (
                <span className="tag_list" key={t}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {selected?.type !== "graph" && (
            <div className="section_list">
              <div className="sectionTitle_list">Description</div>
              <p className="desc_list">
                So this is my first attempt with 3D art. I'm trying out Adobe Dimension and curious as to what other
                programs people recommend for 3D modeling.
              </p>
            </div>
          )}

          <div className="section_list">
            <div className="sectionTitle_list">Info</div>
            <div className="kv_list">
              {selected?.type === "graph" ? (
                <>
                  <div className="kvRow_list">
                    <span>Nodes</span>
                    <b>{selected.nodeCount ?? "-"}</b>
                  </div>
                  <div className="kvRow_list">
                    <span>Edges</span>
                    <b>{selected.edgeCount ?? "-"}</b>
                  </div>
                </>
              ) : (
                <div className="kvRow_list">
                  <span>Size</span>
                  <b>3840 × 2160</b>
                </div>
              )}
              <div className="kvRow_list">
                <span>Saved</span>
                <b>
                  {selected?.createdAt
                    ? new Date(selected.createdAt).toLocaleString()
                    : "-"}
                </b>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
