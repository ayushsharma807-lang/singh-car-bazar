import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

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
          background: "#ffffff",
          color: "#111111",
          fontSize: 68,
          fontWeight: 800,
          borderRadius: 40,
          border: "8px solid #111111",
          letterSpacing: "-0.08em",
        }}
      >
        SCB
      </div>
    ),
    size,
  );
}
