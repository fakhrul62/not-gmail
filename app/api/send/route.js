const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

function errorResponse(message, status) {
  return Response.json({ success: false, message }, { status });
}

export async function POST(request) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

  if (!accessKey) {
    return errorResponse("Email delivery is not configured.", 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const to = String(payload.to || "").trim();
  const subject = String(payload.subject || "").trim() || "(no subject)";
  const message = String(payload.message || "").trim();

  if (!to) {
    return errorResponse("Add at least one recipient.", 400);
  }

  if (to.length > 320 || subject.length > 200 || message.length > 20_000) {
    return errorResponse("The message is too large to send.", 400);
  }

  try {
    const web3formsResponse = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        access_key: accessKey,
        from_name: "Not Gmail",
        subject: `[Not Gmail] ${subject}`,
        intended_recipient: to,
        message: message || "(empty message)",
        botcheck: ""
      })
    });

    const result = await web3formsResponse.json().catch(() => null);

    if (!web3formsResponse.ok || !result?.success) {
      return errorResponse(result?.message || "Web3Forms rejected the message.", 502);
    }

    return Response.json({ success: true, message: "Message delivered." });
  } catch {
    return errorResponse("Unable to reach the email delivery service.", 502);
  }
}
