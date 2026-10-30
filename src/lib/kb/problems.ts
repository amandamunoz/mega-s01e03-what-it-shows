import { groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day-move' | 'unplaced';

export type ProblemRow = {
  problem: Problem;
  reports: number;
  filedUnder: Problem | null;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function problemRows(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; rows: ProblemRow[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const rows: ProblemRow[] = groups.map((g) => ({
    problem: g.cause,
    reports: g.reports.length,
    filedUnder: null,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
  }));
  for (const g of groups) {
    const moved = g.reports.filter((r) => oneDayMove.includes(r.id));
    if (!moved.length) continue;
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    rows.push({
      problem: 'one-day-move',
      reports: moved.length,
      filedUnder: g.cause,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
    });
  }
  return { merged: merged.length, rows };
}
