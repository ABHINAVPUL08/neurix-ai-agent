import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { AuditReportExportData, PdfReportSection } from "@/lib/pdf-report/types";
import { CONSULTATION_EMAIL } from "@/lib/consultation";

const C = {
  purple: "#7C3AED",
  violet: "#5B21B6",
  dark: "#0C0618",
  text: "#1E1B2E",
  muted: "#5C5670",
  light: "#F8F7FC",
  border: "#E8E4F0",
  accent: "#A855F7",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  coverPage: {
    backgroundColor: C.white,
    fontFamily: "Helvetica",
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 88,
    paddingHorizontal: 40,
  },
  coverWaveTopRight: {
    position: "absolute",
    top: -20,
    right: -30,
    width: 220,
    height: 120,
    backgroundColor: "#E0E7FF",
    borderRadius: 100,
    opacity: 0.7,
  },
  coverWaveTopRight2: {
    position: "absolute",
    top: 30,
    right: 40,
    width: 140,
    height: 80,
    backgroundColor: "#EDE9FE",
    borderRadius: 80,
    opacity: 0.6,
  },
  coverWaveBottomLeft: {
    position: "absolute",
    bottom: 60,
    left: -40,
    width: 200,
    height: 100,
    backgroundColor: "#F5F3FF",
    borderRadius: 90,
    opacity: 0.8,
  },
  coverWaveBottomLeft2: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 120,
    height: 70,
    backgroundColor: "#EEF2FF",
    borderRadius: 60,
    opacity: 0.7,
  },
  coverLogoWrap: {
    marginTop: 32,
    marginBottom: 28,
    alignItems: "center",
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  coverLogo: {
    width: 420,
    height: 142,
    objectFit: "contain",
  },
  coverLogoFallback: {
    fontSize: 42,
    fontFamily: "Helvetica-Bold",
    color: C.purple,
    letterSpacing: 3,
  },
  coverTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#312E81",
    textAlign: "center",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  coverDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 320,
    marginTop: 22,
    marginBottom: 22,
  },
  coverDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#CBD5E1",
    maxWidth: 140,
  },
  coverDividerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.purple,
    marginHorizontal: 12,
  },
  coverPrepared: {
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    marginBottom: 10,
  },
  coverTagline: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.purple,
    textAlign: "center",
    letterSpacing: 0.2,
    maxWidth: 400,
  },
  coverFooterBar: {
    position: "absolute",
    bottom: 40,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 14,
  },
  coverFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "48%",
  },
  coverFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    maxWidth: "48%",
  },
  coverFooterIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.purple,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  coverFooterIconText: {
    fontSize: 8,
    color: C.white,
    fontFamily: "Helvetica-Bold",
  },
  coverFooterText: {
    fontSize: 9,
    color: C.muted,
  },
  coverFooterTextRight: {
    fontSize: 9,
    color: C.muted,
    textAlign: "right",
  },
  page: {
    paddingTop: 64,
    paddingBottom: 52,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.text,
    backgroundColor: C.white,
  },
  header: {
    position: "absolute",
    top: 22,
    left: 44,
    right: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 8,
  },
  headerLogo: {
    width: 72,
    height: 24,
    objectFit: "contain",
  },
  headerTitle: {
    fontSize: 8,
    color: C.muted,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
    fontSize: 7,
    color: C.muted,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.violet,
    marginBottom: 3,
  },
  sectionSubtitle: {
    fontSize: 8,
    color: C.muted,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 2,
    width: 40,
    backgroundColor: C.accent,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.5,
    color: C.text,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 5,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.accent,
    marginTop: 4,
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: C.text,
  },
  impactCard: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
  },
  impactCardText: {
    fontSize: 9,
    color: C.violet,
    lineHeight: 1.35,
  },
  scorePage: {
    paddingTop: 64,
    paddingBottom: 52,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    backgroundColor: C.light,
  },
  scoreTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: C.violet,
    marginBottom: 16,
  },
  scoreCard: {
    width: "47%",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    marginRight: "3%",
  },
  scoreValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.purple,
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 8,
    color: C.muted,
  },
  phaseRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 8,
  },
  phaseLabel: {
    width: "28%",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: C.violet,
  },
  phaseDuration: {
    width: "22%",
    fontSize: 8,
    color: C.muted,
  },
  phaseFocus: {
    flex: 1,
    fontSize: 8,
    color: C.text,
  },
  execHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.violet,
    marginBottom: 6,
    marginTop: 10,
  },
  execBullet: {
    fontSize: 8,
    color: C.text,
    marginBottom: 3,
    paddingLeft: 6,
  },
  closingBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#F5F3FF",
    borderRadius: 4,
  },
  closingText: {
    fontSize: 8,
    color: C.violet,
    textAlign: "center",
    lineHeight: 1.45,
  },
});

function resolveLogoSrc(data: AuditReportExportData): string | undefined {
  return data.logoPath ?? data.logoDataUrl;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function PageChrome({
  logoSrc,
  showLogoInHeader = false,
  children,
}: {
  logoSrc?: string;
  showLogoInHeader?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <View fixed style={styles.header}>
        {showLogoInHeader && logoSrc ? (
          <Image src={logoSrc} style={styles.headerLogo} />
        ) : (
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              color: C.violet,
              fontSize: 10,
            }}
          >
            NEURIX
          </Text>
        )}
        <Text style={styles.headerTitle}>AI Business Audit Report</Text>
      </View>
      {children}
      <View fixed style={styles.footer}>
        <Text>{CONSULTATION_EMAIL}</Text>
        <Text
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
        <Text>Generated by Neurix Solution</Text>
      </View>
    </>
  );
}

function ReportSectionBlock({ section }: { section: PdfReportSection }) {
  const isImpact = section.variant === "impact";

  return (
    <View style={styles.section} wrap>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.subtitle ? (
        <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
      ) : null}
      <View style={styles.sectionDivider} />
      {section.paragraphs?.map((p, i) => (
        <Text key={`p-${i}`} style={styles.paragraph}>
          {p}
        </Text>
      ))}
      {section.bullets?.map((b, i) =>
        isImpact ? (
          <View key={`b-${i}`} style={styles.impactCard} wrap={false}>
            <Text style={styles.impactCardText}>{b}</Text>
          </View>
        ) : (
          <View key={`b-${i}`} style={styles.bulletRow} wrap={false}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{b}</Text>
          </View>
        ),
      )}
    </View>
  );
}

function CoverPage({ data }: { data: AuditReportExportData }) {
  const logoSrc = resolveLogoSrc(data);
  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverWaveTopRight} />
      <View style={styles.coverWaveTopRight2} />
      <View style={styles.coverWaveBottomLeft} />
      <View style={styles.coverWaveBottomLeft2} />

      <View style={styles.coverLogoWrap}>
        {logoSrc ? (
          <Image src={logoSrc} style={styles.coverLogo} />
        ) : (
          <Text style={styles.coverLogoFallback}>NEURIX</Text>
        )}
      </View>

      <Text style={styles.coverTitle}>AI Business Audit Report</Text>

      <View style={styles.coverDividerRow}>
        <View style={styles.coverDividerLine} />
        <View style={styles.coverDividerDot} />
        <View style={styles.coverDividerLine} />
      </View>

      <Text style={styles.coverPrepared}>Prepared by Neurix Solution</Text>
      <Text style={styles.coverTagline}>
        Intelligent Solutions. Limitless Possibilities.
      </Text>

      <View style={styles.coverFooterBar}>
        <View style={styles.coverFooterLeft}>
          <View style={styles.coverFooterIcon}>
            <Text style={styles.coverFooterIconText}>@</Text>
          </View>
          <Text style={styles.coverFooterText}>{CONSULTATION_EMAIL}</Text>
        </View>
        <View style={styles.coverFooterRight}>
          <View style={styles.coverFooterIcon}>
            <Text style={styles.coverFooterIconText}>◷</Text>
          </View>
          <Text style={styles.coverFooterTextRight}>
            {data.generatedAtDisplay}
          </Text>
        </View>
      </View>
    </Page>
  );
}

function ExecutionPlanSection({ data }: { data: AuditReportExportData }) {
  const { executionPlan } = data;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Neurix Execution Plan</Text>
      <Text style={styles.sectionSubtitle}>
        How Neurix can design, build, and deploy your AI systems
      </Text>
      <View style={styles.sectionDivider} />
      <Text style={styles.execHeading}>AI Systems Neurix Can Build</Text>
      {executionPlan.systems.map((s, i) => (
        <Text key={`sys-${i}`} style={styles.execBullet}>
          • {s}
        </Text>
      ))}
      <Text style={styles.execHeading}>Recommended Integrations</Text>
      {executionPlan.integrations.map((s, i) => (
        <Text key={`int-${i}`} style={styles.execBullet}>
          • {s}
        </Text>
      ))}
      {executionPlan.phases.map((phase) => (
        <View key={phase.phase} wrap={false}>
          <Text style={styles.execHeading}>{phase.phase}</Text>
          {phase.items.map((item, i) => (
            <Text key={`${phase.phase}-${i}`} style={styles.execBullet}>
              • {item}
            </Text>
          ))}
        </View>
      ))}
      <Text style={styles.execHeading}>Deployment Strategy</Text>
      {executionPlan.deployment.map((d, i) => (
        <Text key={`dep-${i}`} style={styles.execBullet}>
          • {d}
        </Text>
      ))}
    </View>
  );
}

function ContentPages({ data }: { data: AuditReportExportData }) {
  const logoSrc = resolveLogoSrc(data);
  const sectionPages = chunk(data.sections, 2);

  return (
    <>
      {sectionPages.map((sections, pageIndex) => (
        <Page key={`sections-${pageIndex}`} size="A4" style={styles.page} wrap>
          <PageChrome logoSrc={logoSrc}>
            {sections.map((section) => (
              <ReportSectionBlock key={section.id} section={section} />
            ))}
          </PageChrome>
        </Page>
      ))}
      <Page size="A4" style={styles.page} wrap>
        <PageChrome logoSrc={logoSrc}>
          <ExecutionPlanSection data={data} />
          <View style={styles.closingBox}>
            <Text style={styles.closingText}>
              This report was generated by Neurix Solution. For a custom implementation
              roadmap and quote, contact {CONSULTATION_EMAIL} or schedule a
              consultation through the Neurix platform.
            </Text>
          </View>
        </PageChrome>
      </Page>
    </>
  );
}

export function NeurixAuditPdfDocument({
  data,
}: {
  data: AuditReportExportData;
}) {
  return (
    <Document
      title="Neurix Solution Business Audit Report"
      author="Neurix Solution"
      subject="AI Business Audit Report"
    >
      <CoverPage data={data} />
      <ContentPages data={data} />
    </Document>
  );
}
