import { appendReference } from '@/lib/db';

export const POST = async (req: Request) => {
  const { table, attribute} = await req.json();

  if (!table || !attribute) {
    return new Response(JSON.stringify({ error: 'No table or attribute is provided.'}), {
      status: 500,
      headers: { "Content-Type": "application/json"}
    });
  }

  const { id, referenceId, data } = attribute;

  const result = await appendReference(table, { pid: id, mid: referenceId });

  return new Response('', {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
}