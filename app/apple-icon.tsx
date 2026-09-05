import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#34d399",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 15,
              border: "11px solid #0a0a0a",
              transform: "rotate(-8deg)",
            }}
          />
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 15,
              border: "11px solid #0a0a0a",
              marginLeft: -19,
              transform: "rotate(8deg)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
