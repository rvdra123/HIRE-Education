import "server-only";
import { randomUUID } from "node:crypto";
import { database, initDatabase } from "./db";
import { canonicalUrl, fingerprint, qualityNotes, statusFor } from "./quality";
import type {
  NormalizedListing,
  Opportunity,
  SourceConfig,
  SourceHealth,
} from "./types";
const decode = (data: unknown) => JSON.parse(String(data)) as Opportunity;
export async function getOpportunity(id: string, includeHidden = false) {
  await initDatabase();
  const result = await database().execute({
    sql: `SELECT data FROM opportunities WHERE id=? ${includeHidden ? "" : "AND status IN ('active','expiring-soon') AND last_verified_at >= ?"}`,
    args: includeHidden
      ? [id]
      : [id, new Date(Date.now() - 72 * 3600000).toISOString()],
  });
  return result.rows[0] ? decode(result.rows[0].data) : null;
}
export async function saveOpportunity(
  item: NormalizedListing,
  source: SourceConfig,
  now = new Date(),
) {
  await initDatabase();
  const stamp = now.toISOString();
  const fp = fingerprint(item);
  const applicationUrl = canonicalUrl(item.applicationUrl);
  const found = await database().execute({
    sql: "SELECT data FROM opportunities WHERE fingerprint=? OR (json_extract(data,'$.applicationUrl')=? AND type=? AND title=? AND organization=? AND (type<>'event' OR json_extract(data,'$.startDate')=?)) LIMIT 1",
    args: [
      fp,
      applicationUrl,
      item.opportunityType,
      item.title,
      item.organization,
      item.startDate || "",
    ],
  });
  const old = found.rows[0] ? decode(found.rows[0].data) : null;
  const priority = {
    government: 4,
    official: 4,
    "reputable-organization": 3,
    aggregator: 1,
  };
  const preferOld = old && priority[old.sourceType] > priority[source.trust];
  const base = preferOld ? old : { ...item, applicationUrl };
  const notes = qualityNotes(base);
  if (
    !preferOld &&
    (!source.allowedHosts.includes(new URL(base.sourceUrl).hostname) ||
      !source.allowedHosts.includes(new URL(base.applicationUrl).hostname))
  )
    notes.push("Source or application host has not been approved");
  const valid = notes.length === 0;
  const record: Opportunity = {
    ...base,
    id: old?.id || randomUUID(),
    sourceId: preferOld ? old.sourceId : source.id,
    sourceName: preferOld ? old.sourceName : source.name,
    sourceType: preferOld ? old.sourceType : source.trust,
    fingerprint: old?.fingerprint || fp,
    firstSeenAt: old?.firstSeenAt || stamp,
    lastSeenAt: stamp,
    lastVerifiedAt: valid && !preferOld ? stamp : old?.lastVerifiedAt || null,
    verified: valid,
    status:
      statusFor(base, now) === "expired"
        ? "expired"
        : notes.length
          ? "needs-review"
          : statusFor(base, now),
    missingCount: 0,
    verificationFailures: 0,
    qualityNotes: notes,
    lastLinkCheckedAt: old?.lastLinkCheckedAt,
    linkFailures: old?.linkFailures,
  };
  await persist(record);
  await database().execute({
    sql: "INSERT INTO opportunity_sources(opportunity_id,source_id,last_seen_at,missing_count) VALUES(?,?,?,0) ON CONFLICT(opportunity_id,source_id) DO UPDATE SET last_seen_at=excluded.last_seen_at,missing_count=0",
    args: [record.id, source.id, stamp],
  });
  return { record, added: !old };
}
export async function persist(r: Opportunity) {
  await database().execute({
    sql: `INSERT INTO opportunities(id,fingerprint,source_id,title,organization,type,category,city,location,remote,paid,commitment,status,deadline,first_seen_at,last_seen_at,last_verified_at,search_text,data) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET source_id=excluded.source_id,title=excluded.title,organization=excluded.organization,type=excluded.type,category=excluded.category,city=excluded.city,location=excluded.location,remote=excluded.remote,paid=excluded.paid,commitment=excluded.commitment,status=excluded.status,deadline=excluded.deadline,last_seen_at=excluded.last_seen_at,last_verified_at=excluded.last_verified_at,search_text=excluded.search_text,data=excluded.data`,
    args: [
      r.id,
      r.fingerprint,
      r.sourceId,
      r.title,
      r.organization,
      r.opportunityType,
      r.category,
      r.city,
      r.location,
      r.remote ? 1 : 0,
      r.paid,
      r.commitment,
      r.status,
      r.applicationDeadline,
      r.firstSeenAt,
      r.lastSeenAt,
      r.lastVerifiedAt,
      `${r.title} ${r.organization} ${r.description} ${r.category} ${r.skills.join(" ")} ${r.location}`.toLowerCase(),
      JSON.stringify(r),
    ],
  });
}
export async function reconcileMissing(
  source: SourceConfig,
  seen: string[],
  _now = new Date(),
) {
  const result = await database().execute({
    sql: "SELECT o.data FROM opportunities o JOIN opportunity_sources s ON s.opportunity_id=o.id WHERE s.source_id=?",
    args: [source.id],
  });
  for (const row of result.rows) {
    const r = decode(row.data);
    if (seen.includes(r.id)) continue;
    await database().execute({
      sql: "UPDATE opportunity_sources SET missing_count=missing_count+1 WHERE opportunity_id=? AND source_id=?",
      args: [r.id, source.id],
    });
    const other = await database().execute({
      sql: "SELECT MAX(last_seen_at) as latest, MIN(missing_count) as missing FROM opportunity_sources WHERE opportunity_id=?",
      args: [r.id],
    });
    if (Number(other.rows[0].missing) >= 2) {
      r.missingCount = Number(other.rows[0].missing);
      r.status = "unavailable";
      r.verified = false;
      await persist(r);
    }
  }
}
export async function recordSourceFailure(sourceId: string) {
  const result = await database().execute({
    sql: "SELECT data FROM opportunities WHERE source_id=?",
    args: [sourceId],
  });
  for (const row of result.rows) {
    const r = decode(row.data);
    r.verificationFailures++;
    if (r.verificationFailures >= 3) {
      r.status = "needs-review";
      r.verified = false;
    }
    await persist(r);
  }
}
export async function expireAndAge(now = new Date()) {
  await initDatabase();
  const result = await database().execute(
    "SELECT data FROM opportunities WHERE status IN ('active','expiring-soon')",
  );
  for (const row of result.rows) {
    const r = decode(row.data);
    const current = statusFor(r, now);
    if (
      !r.lastVerifiedAt ||
      Date.parse(r.lastVerifiedAt) < now.getTime() - 72 * 3600000
    ) {
      r.status = "needs-review";
      r.verified = false;
    } else r.status = current;
    if (
      r.status !== JSON.parse(String(row.data)).status ||
      r.verified !== JSON.parse(String(row.data)).verified
    )
      await persist(r);
  }
}
export type CatalogQuery = {
  search?: string;
  type?: string;
  location?: string;
  grade?: string;
  category?: string;
  commitment?: string;
  paid?: string;
  sort?: string;
  view?: string;
  page?: number;
  pageSize?: number;
  from?: string;
  until?: string;
  ids?: string[];
};
export async function queryCatalog(q: CatalogQuery = {}, events = false) {
  await initDatabase();
  const where = [
    "status IN ('active','expiring-soon')",
    "last_verified_at >= ?",
    events ? "type='event'" : "type<>'event'",
  ];
  const args: (string | number)[] = [
    new Date(Date.now() - 72 * 3600000).toISOString(),
  ];
  const add = (sql: string, value: string) => {
    where.push(sql);
    args.push(value);
  };
  if (q.from) add("json_extract(data,'$.startDate')>=?", q.from);
  if (q.until) add("json_extract(data,'$.startDate')<?", q.until);
  if (q.search)
    add(
      "search_text LIKE ? ESCAPE '\\'",
      `%${q.search.toLowerCase().replace(/[\\%_]/g, "\\$&")}%`,
    );
  if (q.type) add("type=?", q.type);
  if (q.location && q.location !== "nearby") {
    if (q.location === "Remote") where.push("remote=1");
    else if (q.location === "Peel Region")
      where.push(
        "(city IN ('Brampton','Mississauga','Caledon') OR location LIKE '%Peel%')",
      );
    else {
      add("(city=? OR location LIKE ?)", q.location);
      args.push(`%${q.location}%`);
    }
  }
  if (q.location === "nearby")
    where.push(
      "(city IN ('Brampton','Mississauga','Caledon') OR location LIKE '%Peel%' OR remote=1)",
    );
  if (q.grade) {
    where.push(
      "(json_array_length(json_extract(data,'$.eligibleGrades'))=0 OR EXISTS (SELECT 1 FROM json_each(data,'$.eligibleGrades') WHERE value=?))",
    );
    args.push(Number(q.grade));
  }
  if (q.category) add("category=?", q.category);
  if (q.commitment) add("commitment=?", q.commitment);
  if (q.paid) add("paid=?", q.paid);
  if (q.view === "new")
    add("first_seen_at>=?", new Date(Date.now() - 7 * 86400000).toISOString());
  if (q.view === "closing") where.push("status='expiring-soon'");
  if (q.view === "saved") {
    if (!q.ids?.length) where.push("1=0");
    else {
      where.push(`id IN (${q.ids.map(() => "?").join(",")})`);
      args.push(...q.ids);
    }
  }
  const clause = where.join(" AND ");
  const count = await database().execute({
    sql: `SELECT COUNT(*) as total FROM opportunities WHERE ${clause}`,
    args,
  });
  const size = Math.max(1, Math.min(24, q.pageSize || 24));
  const total = Number(count.rows[0].total);
  const page = Math.max(1, Math.min(Math.ceil(total / size) || 1, q.page || 1));
  const order =
    q.sort === "newest"
      ? "first_seen_at DESC"
      : q.sort === "deadline"
        ? "deadline IS NULL,deadline ASC"
        : events
          ? "json_extract(data,'$.startDate') ASC"
          : "CASE WHEN city='Brampton' THEN 0 WHEN city IN ('Mississauga','Caledon') THEN 1 WHEN remote=1 THEN 2 ELSE 3 END, CASE WHEN json_extract(data,'$.sourceType') IN ('government','official') THEN 0 ELSE 1 END, CASE WHEN status='expiring-soon' THEN 0 ELSE 1 END, CASE WHEN json_extract(data,'$.minimumAge') IS NOT NULL THEN 0 ELSE 1 END,first_seen_at DESC";
  const rows = await database().execute({
    sql: `SELECT data FROM opportunities WHERE ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`,
    args: [...args, size, (page - 1) * size],
  });
  const health = await sourceHealth();
  return {
    items: rows.rows.map((r) => decode(r.data)),
    total,
    page,
    pageSize: size,
    lastSuccessfulSync:
      health
        .map((h) => h.lastSuccessfulRun)
        .filter((x): x is string => !!x)
        .sort()
        .at(-1) || null,
  };
}
export async function sourceHealth(): Promise<SourceHealth[]> {
  await initDatabase();
  const result = await database().execute("SELECT data FROM source_health");
  return result.rows.map((r) => JSON.parse(String(r.data)));
}
export async function setSourceHealth(health: SourceHealth) {
  await database().execute({
    sql: "INSERT INTO source_health(source,data) VALUES(?,?) ON CONFLICT(source) DO UPDATE SET data=excluded.data",
    args: [health.source, JSON.stringify(health)],
  });
}
