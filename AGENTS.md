<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Supabase schema notes

- `supabase/works_schema.sql` is the current reference schema for the works/admin data model.
- Historical migration changes are consolidated into `supabase/works_schema.sql`: YouTube/category metadata, unique YouTube indexes, works tab views, the public `ppl-logos` storage bucket, `ppl_partners`, published read policies, and removal of the old `works.is_featured` column.
- Use `supabase/works_schema.sql` when recreating the schema in another Supabase project unless this project later adopts a formal migrations workflow.
