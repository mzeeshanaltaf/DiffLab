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
        <svg width="112" height="112" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.2">
          <circle cx="5" cy="6" r="3" />
          <path d="M12 6h5a2 2 0 0 1 2 2v7" />
          <path d="m15 9-3-3 3-3" />
          <circle cx="19" cy="18" r="3" />
          <path d="M12 18H7a2 2 0 0 1-2-2V9" />
          <path d="m9 15 3 3-3 3" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
