import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { NeurixAuditPdfDocument } from "@/components/pdf/NeurixAuditPdfDocument";
import {
  MAX_EXPORT_PAYLOAD_BYTES,
  validateJsonBodySize,
} from "@/lib/api/limits";
import { logger } from "@/lib/logger";
import { resolveServerLogo } from "@/lib/pdf-report/resolve-server-logo";
import type { AuditReportExportData } from "@/lib/pdf-report/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const sizeError = validateJsonBodySize(rawBody, MAX_EXPORT_PAYLOAD_BYTES);
    if (sizeError) {
      return NextResponse.json(
        { error: sizeError, code: "payload_too_large" },
        { status: 413 },
      );
    }

    const body = JSON.parse(rawBody) as AuditReportExportData;

    if (!body?.sections?.length && !body?.projectName) {
      return NextResponse.json(
        { error: "Invalid report data.", code: "invalid_request" },
        { status: 400 },
      );
    }

    const logo = resolveServerLogo();

    const data: AuditReportExportData = {
      ...body,
      logoPath: logo.logoPath,
      logoDataUrl: logo.logoDataUrl,
    };

    const buffer = await renderToBuffer(
      <NeurixAuditPdfDocument data={data} />,
    );

    if (!buffer.byteLength) {
      return NextResponse.json(
        { error: "Generated PDF is empty.", code: "export_failed" },
        { status: 500 },
      );
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="neurix-ai-report.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error("export-report", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate PDF report.";
    return NextResponse.json(
      { error: message, code: "export_failed" },
      { status: 500 },
    );
  }
}
