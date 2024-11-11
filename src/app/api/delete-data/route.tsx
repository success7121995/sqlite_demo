import { deleteRowData } from '@/lib/db';

export const DELETE = async (req: Request) => {
  const { table, id } = await req.json();

  if (!table || !id) {
    return new Response(JSON.stringify({ error: 'No table or ID is provided.'}), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const result = await deleteRowData(table, id);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify(err), {
      status: err.status || 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};