import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const userId = context.clientContext?.user?.sub || "default-user";
    const store = getStore("medications");

    if (req.method === "GET") {
      const data = await store.get(`user_${userId}`, { type: "json" });
      return new Response(JSON.stringify(data || { meds: [], history: [] }), {
        status: 200,
        headers
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { meds, history } = body;

      await store.setJSON(`user_${userId}`, {
        meds: meds || [],
        history: history || [],
        updatedAt: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({ message: "Successfully synced data", timestamp: new Date() }),
        { status: 200, headers }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers
    });
  } catch (error) {
    console.error("Netlify Function Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers }
    );
  }
};