import { ImageResponse } from "next/og";

export const alt = "DiffLab — Compare text, code, files & images";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #0f1713 60%, #0a0a0a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "#34d399",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "6px solid #0a0a0a",
                  transform: "rotate(-8deg)",
                }}
              />
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "6px solid #0a0a0a",
                  marginLeft: -10,
                  transform: "rotate(8deg)",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, color: "#fafafa" }}>
            DiffLab
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            color: "#a3a3a3",
            textAlign: "center",
          }}
        >
          Compare text, code, files & images — free and private
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 40,
            padding: "14px 32px",
            borderRadius: 999,
            background: "#34d399",
            color: "#0a0a0a",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          Try it free — no signup →
        </div>
      </div>
    ),
    { ...size }
  );
}
