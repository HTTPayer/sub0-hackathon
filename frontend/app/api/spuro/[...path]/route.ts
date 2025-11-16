const API_BASE_URL =
  process.env.SPURO_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://qu01n0u34hdsh6ajci1ie9trq8.ingress.akash-palmito.org";

export const dynamic = "force-dynamic";

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;

  const requestUrl = new URL(request.url);
  const search = requestUrl.search || "";

  const targetUrl = `${API_BASE_URL}/${path.join("/")}${search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      const bodyText = await request.text();
      init.body = bodyText;
    }

    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("transfer-encoding");

    const text = await response.text();

    // Always return JSON on error so spuro-functions can parse it safely
    if (!response.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          status: response.status,
          statusText: response.statusText,
          body: text,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(text, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("[api/spuro proxy] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        status: 500,
        statusText: "Proxy error",
        message: error?.message || "Unexpected proxy error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE, proxy as PATCH, proxy as OPTIONS };


