<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemRows, type Problem } from '#lib/kb/problems';

  type State = { ticket: number; state: string };
  let { ticket, issues, tickets }: { ticket: number; issues: string; tickets: Partial<Record<Problem, State>> } =
    $props();

  const split = $derived(problemRows(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{split.merged}</strong> reports merged into #{ticket} ·
  <strong>{split.rows.length}</strong>
  {split.rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th><th>state</th></tr>
  </thead>
  <tbody>
    {#each split.rows as row (row.problem)}
      {@const t = tickets[row.problem]}
      <tr class:open={t?.state === 'open'}>
        <td><code>{row.problem}</code></td>
        <td>
          <strong>{row.reports}</strong>
          {#if row.filedUnder}<span class="note">counted under <code>{row.filedUnder}</code></span>{/if}
        </td>
        <td>{row.tenants}</td>
        <td>{row.firstSeen} → {row.lastSeen}</td>
        <td>{#if t}<a href="{issues}/{t.ticket}">#{t.ticket}</a>{:else}no ticket yet{/if}</td>
        <td>{t?.state ?? ''}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .open td { background: var(--warn-bg); }
</style>
