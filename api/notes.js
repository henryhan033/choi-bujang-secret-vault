// This endpoint is intentionally public for this exercise.
// The server-only key must never be returned to the browser or written to logs.
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, private');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    return response.status(500).json({ error: 'SERVER_CONFIGURATION_ERROR' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    return response.status(500).json({ error: 'SERVER_CONFIGURATION_ERROR' });
  }
  if (parsedUrl.protocol !== 'https:') {
    return response.status(500).json({ error: 'SERVER_CONFIGURATION_ERROR' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { data, error } = await supabase
      .from('learning_notes')
      .select('title, content')
      .order('created_at', { ascending: true });

    if (error || !Array.isArray(data)) {
      return response.status(502).json({ error: 'DATA_FETCH_FAILED' });
    }

    const notes = data.map(({ title, content }) => ({ title, content }));
    return response.status(200).json({ notes });
  } catch {
    // Provider errors may contain request details; do not log or return them.
    return response.status(502).json({ error: 'DATA_FETCH_FAILED' });
  }
}
