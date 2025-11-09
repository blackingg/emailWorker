export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Only POST allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const body = await request.json();

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Mailer <onboarding@resend.dev>",
          to: [env.DEFAULT_EMAIL_RECEIPIENT, body.to],
          subject: body.subject || "No Subject",
          html: body.html || "<p>No content provided</p>",
        }),
      });

      const data = await res.json();

      return new Response(JSON.stringify({ ok: true, data }), {
        status: res.ok ? 200 : 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: true, details: err.stack || err.toString() }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};
