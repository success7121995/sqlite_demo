import { updateRowData } from '@/lib/db';

export const PUT = async (req: Request) => {
  const { table, attribute } = await req.json();
  
  if (!table || !attribute) {
    return new Response(JSON.stringify({ error: 'No table or attribute is provided.'}), {
      status: 500,
      headers: { "Content-Type": "application/json"}
    });
  }

  try {
    const result = await updateRowData(table, attribute);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json"}
    });
  } catch (err: any) {
    return new Response(JSON.stringify(err), {
      status: err.status || 500,
      headers: { 'Content-Type': 'application/json' }
    });
}};