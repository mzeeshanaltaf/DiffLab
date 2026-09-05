import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              border: "2px solid #0a0a0a",
              transform: "rotate(-8deg)",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              border: "2px solid #0a0a0a",
              marginLeft: -3,
              transform: "rotate(8deg)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
