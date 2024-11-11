import { getRowsData, getRowsDataWithReferences } from '@/lib/db';

export const GET = async (req: Request) => {
  const { pathname, search } = new URL(req.url);
  let result: any[] = []
  const params = Object.fromEntries(new URLSearchParams(search));

  // Split the URL path by '/' and get the last part as the table name.
  const table = pathname.split('/').pop();

  if (!table) {
    return new Response(JSON.stringify({ error: 'No table or attribute is provided.'}), {
      status: 500,
      headers: { "Content-Type": "application/json"}
    });
  }

  const { rows } =  Object.keys(params).length > 0 ?
    await getRowsDataWithReferences(params):
    await getRowsData(table);
  

  // Filter out any items with keys 'sid' or 'mid'
  const filteredRows = rows.map(row => {
    const { sid, mid, ...rest } = row;
    return rest;
  });

  try {
    return new Response(JSON.stringify(filteredRows), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch(err) {
    return new Response(JSON.stringify(filteredRows), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }
};