import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, setCharacterSpacing } from "pdf-lib";
import type { Color, PDFFont, PDFImage, PDFPage } from "pdf-lib";
import { certificateColors, certificateImages, certificatePage, walletCard } from "@/constants/certificate";
import { getDictionaryFor } from "@/i18n/dictionaries";
import { pdfSafeText } from "@/lib/helpers/certificate";
import { interpolate } from "@/lib/helpers/format";
import { certificateDetails } from "@/lib/helpers/student";
import type { StudentCertificate } from "@/types/student";

interface TextStyle {
  font: PDFFont;
  size: number;
  color: Color;
  spacing?: number;
  maxWidth?: number;
}

function fittedSize(text: string, { font, size, spacing = 0, maxWidth }: TextStyle) {
  if (!maxWidth) return size;
  const width = font.widthOfTextAtSize(text, size) + spacing * Math.max(text.length - 1, 0);
  return width > maxWidth ? size * (maxWidth / width) : size;
}

function textWidth(text: string, style: TextStyle) {
  const size = fittedSize(text, style);
  return style.font.widthOfTextAtSize(text, size) + (style.spacing ?? 0) * Math.max(text.length - 1, 0);
}

function drawText(page: PDFPage, value: string, x: number, y: number, style: TextStyle) {
  const text = pdfSafeText(value);
  const size = fittedSize(text, style);
  if (style.spacing) page.pushOperators(setCharacterSpacing(style.spacing));
  page.drawText(text, { x, y, size, font: style.font, color: style.color });
  if (style.spacing) page.pushOperators(setCharacterSpacing(0));
}

function drawCentered(page: PDFPage, value: string, centerX: number, y: number, style: TextStyle) {
  const text = pdfSafeText(value);
  drawText(page, text, centerX - textWidth(text, style) / 2, y, style);
}

function drawImageCentered(page: PDFPage, image: PDFImage, centerX: number, y: number, width: number) {
  const height = width * (image.height / image.width);
  page.drawImage(image, { x: centerX - width / 2, y, width, height });
}

async function loadImages(pdf: PDFDocument) {
  const [logo, accreditation] = await Promise.all([
    readFile(join(process.cwd(), "src", "assets", "images", certificateImages.logo)),
    readFile(join(process.cwd(), "src", "assets", "images", certificateImages.accreditation))
  ]);
  return { logo: await pdf.embedPng(logo), accreditation: await pdf.embedJpg(accreditation) }
}

export async function renderCertificatePdf(certificate: StudentCertificate) {
  const locale = certificate.courseLocale;
  const copy = (await getDictionaryFor(locale)).student.certificate;
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${copy.heading} – ${certificate.studentName}`);
  pdf.setAuthor("Synergy QMP");

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const images = await loadImages(pdf);
  const { width, height, margin, contentWidth } = certificatePage;
  const center = width / 2;
  const colors = certificateColors;
  const muted = { font: regular, size: 13, color: colors.inkMuted }

  const page = pdf.addPage([width, height]);
  page.drawRectangle({ x: margin, y: margin, width: width - margin * 2, height: height - margin * 2, borderColor: colors.brand, borderWidth: 3 });

  drawImageCentered(page, images.logo, center, 505, 150);
  drawCentered(page, copy.heading.toUpperCase(), center, 468, { font: bold, size: 12, color: colors.brandInk, spacing: 2.2 });
  drawCentered(page, copy.certifies, center, 430, muted);
  drawCentered(page, certificate.studentName, center, 386, { font: bold, size: 34, color: colors.ink, maxWidth: contentWidth });
  page.drawLine({ start: { x: center - 160, y: 374 }, end: { x: center + 160, y: 374 }, thickness: 1, color: colors.lineStrong });
  drawCentered(page, copy.completed, center, 348, muted);
  drawCentered(page, copy.course, center, 324, { font: bold, size: 16, color: colors.ink, maxWidth: contentWidth });
  drawCentered(page, certificate.courseTitle, center, 304, { ...muted, maxWidth: contentWidth });

  const details = certificateDetails(certificate, copy, locale);
  const columnWidth = contentWidth / details.length;
  details.forEach((detail, index) => {
    const columnCenter = center - contentWidth / 2 + columnWidth * (index + 0.5);
    drawCentered(page, detail.label.toUpperCase(), columnCenter, 252, { font: bold, size: 8, color: colors.inkSubtle, spacing: 0.8, maxWidth: columnWidth - 16 });
    drawCentered(page, detail.value, columnCenter, 234, { font: bold, size: 13, color: colors.ink, maxWidth: columnWidth - 16 });
  });

  drawCentered(page, interpolate(copy.credits, { credits: certificate.credits.toLocaleString(locale) }), center, 176, { font: regular, size: 10, color: colors.inkMuted });
  drawCentered(page, interpolate(copy.referenceCode, { code: certificate.referenceCode }), center, 160, { font: bold, size: 10, color: colors.ink });
  drawImageCentered(page, images.accreditation, center, 100, 120);

  const wallet = pdf.addPage([width, height]);
  const cardX = center - walletCard.width / 2;
  const cardY = height / 2 - walletCard.height / 2;
  const left = cardX + walletCard.padding;
  const innerWidth = walletCard.width - walletCard.padding * 2;
  const top = cardY + walletCard.height - walletCard.padding;

  drawCentered(wallet, copy.walletHint, center, cardY + walletCard.height + 24, { font: regular, size: 10, color: colors.inkMuted });
  wallet.drawRectangle({ x: cardX, y: cardY, width: walletCard.width, height: walletCard.height, borderColor: colors.inkSubtle, borderWidth: 0.75, borderDashArray: [4, 3] });
  wallet.drawRectangle({ x: cardX + 4, y: cardY + 4, width: walletCard.width - 8, height: walletCard.height - 8, borderColor: colors.brand, borderWidth: 1.5 });
  wallet.drawImage(images.logo, { x: left, y: top - 16, width: 64, height: 64 * (images.logo.height / images.logo.width) });
  drawText(wallet, copy.heading.toUpperCase(), left, top - 32, { font: bold, size: 6.5, color: colors.brandInk, spacing: 0.8, maxWidth: innerWidth });
  drawText(wallet, certificate.studentName, left, top - 50, { font: bold, size: 12, color: colors.ink, maxWidth: innerWidth });
  drawText(wallet, certificate.courseTitle, left, top - 63, { font: regular, size: 8, color: colors.inkMuted, maxWidth: innerWidth });

  details.forEach((detail, index) => {
    const y = top - 84 - index * 11;
    drawText(wallet, interpolate(copy.walletLabel, { label: detail.label }), left, y, { font: regular, size: 7.5, color: colors.inkMuted });
    drawText(wallet, detail.value, left + 72, y, { font: bold, size: 7.5, color: colors.ink, maxWidth: innerWidth - 72 });
  });
  drawText(wallet, interpolate(copy.referenceCode, { code: certificate.referenceCode }), left, cardY + walletCard.padding, { font: regular, size: 6.5, color: colors.inkSubtle, maxWidth: innerWidth });

  return pdf.save();
}
