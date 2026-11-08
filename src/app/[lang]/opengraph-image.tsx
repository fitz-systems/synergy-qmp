import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { shareImageColors, shareImageSize, siteName } from "@/constants/seo";
import { getDictionaryFor } from "@/i18n/dictionaries";
import { resolveLocale } from "@/lib/helpers/locale";

const [iconSvg, mediumFont, extraBoldFont] = await Promise.all([
  readFile(join(process.cwd(), "src/app/icon.svg"), "base64"),
  readFile(join(process.cwd(), "src/assets/fonts/Inter-Medium.ttf")),
  readFile(join(process.cwd(), "src/assets/fonts/Inter-ExtraBold.ttf"))
]);

export const alt = siteName;

export const size = shareImageSize;

export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { hero } = await getDictionaryFor(resolveLocale((await params).lang));

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: shareImageColors.background, fontFamily: "Inter" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "72px 80px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", borderRadius: 20, border: `2px solid ${shareImageColors.outline}` }}>
              <img src={`data:image/svg+xml;base64,${iconSvg}`} width={80} height={80} alt=""/>
            </div>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 800, color: shareImageColors.text, letterSpacing: -1 }}>
              Synergy<span style={{ color: shareImageColors.brand, marginLeft: 12 }}>QMP</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 64, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2, color: shareImageColors.text }}>
              <span>{hero.titleTop}</span>
              <span style={{ color: shareImageColors.brand }}>{hero.titleBottom}</span>
            </div>
            <div style={{ display: "flex", marginTop: 28, maxWidth: 900, fontSize: 30, fontWeight: 500, lineHeight: 1.4, color: shareImageColors.muted }}>{hero.lead}</div>
          </div>
        </div>
        <div style={{ display: "flex", height: 14, background: shareImageColors.brand }}/>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: mediumFont, weight: 500, style: "normal" },
        { name: "Inter", data: extraBoldFont, weight: 800, style: "normal" }
      ]
    }
  );
}
