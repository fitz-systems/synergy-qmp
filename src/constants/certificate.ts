import { rgb } from "pdf-lib";

export const certificatePage = {
  width: 792,
  height: 612,
  margin: 28,
  contentWidth: 600
}

export const walletCard = {
  width: 243,
  height: 153,
  padding: 14
}

export const certificateColors = {
  brand: rgb(1, 0.714, 0.024),
  brandInk: rgb(0.478, 0.294, 0),
  ink: rgb(0.078, 0.09, 0.11),
  inkMuted: rgb(0.29, 0.322, 0.376),
  inkSubtle: rgb(0.4, 0.439, 0.522),
  lineStrong: rgb(0.816, 0.835, 0.867)
}

export const certificateImages = {
  logo: "logo.png",
  accreditation: "camrt-logo.jpg"
}
