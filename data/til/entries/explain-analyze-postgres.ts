import type { TILEntry } from "../index"

const _explain_analyze_postgres: TILEntry = {
    id: "explain-analyze-postgres",
    title: "`EXPLAIN ANALYZE` shows the difference between what PostgreSQL planned and what actually ran",
    date: "2026-07-11",
    category: "Database",
    published: true,
    body: "[PostgreSQL's query planner](https://www.postgresql.org/docs/current/sql-explain.html) estimates row counts before running a query. `EXPLAIN` shows the plan and estimates; `EXPLAIN ANALYZE` actually runs the query and shows both estimated and actual row counts. When the planner estimates 10 rows but 100,000 rows actually come back, it has chosen a nested loop where a hash join would have been far better. This mismatch usually means stale table statistics: running `ANALYZE tablename` lets the planner re-sample and produce better estimates.",
    detail: [
      {
        type: "code",
        lang: "sql",
        code: `-- I run EXPLAIN ANALYZE to see estimated vs actual row counts
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, COUNT(o.id) as order_count
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2026-01-01'
GROUP BY u.id;

-- Look for: rows=X (estimated) vs actual rows=Y
-- Large gaps mean stale statistics
-- Also look at: Seq Scan vs Index Scan choices

-- Fix stale statistics
ANALYZE users;
ANALYZE orders;`,
        caption: "The BUFFERS option shows cache hit ratio: useful for identifying I/O-heavy queries",
      },
      {
        type: "link",
        url: "https://www.postgresql.org/docs/current/sql-explain.html",
        label: "PostgreSQL: EXPLAIN",
        description: "Full documentation including all EXPLAIN options and how to interpret the output format.",
      },
    ],
    tags: ["database", "PostgreSQL", "SQL", "performance"],
  }

export default _explain_analyze_postgres
