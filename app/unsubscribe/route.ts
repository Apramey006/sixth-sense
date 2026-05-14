import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyUnsubscribeToken } from "@/lib/unsubscribeToken";

export const dynamic = "force-dynamic";

// One-click unsubscribe. The email's footer link includes ?token=<hmac>. We
// verify the signature, insert into email_unsubscribes, and show a tiny HTML
// confirmation page. The handler is intentionally a GET so it works from any
// email client without JS.

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return htmlResponse("Invalid unsubscribe link.", 400);
  }
  const userId = verifyUnsubscribeToken(token);
  if (!userId) {
    return htmlResponse("This unsubscribe link is invalid or has been tampered with.", 400);
  }

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("email_unsubscribes")
    .upsert({ user_id: userId }, { onConflict: "user_id" });
  if (error) {
    return htmlResponse(`Couldn't unsubscribe: ${error.message}`, 500);
  }

  return htmlResponse(
    `<h1 style="font-size:24px;margin:0 0 12px">Unsubscribed.</h1>
     <p>You won't receive any more emails from Sixth Sense. The site still works the same — you can keep taking reps any time at <a href="https://sixth-sense.app">sixth-sense.app</a>.</p>`,
    200,
  );
}

function htmlResponse(inner: string, status: number) {
  const html = `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:48px auto;padding:24px;color:#222;line-height:1.6">
${inner}
</body></html>`;
  return new NextResponse(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
