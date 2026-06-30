import { assertAdmin } from "../_lib/auth";

type SessionRequestBody = {
  password?: unknown;
};

export async function POST(request: Request) {
  let body: SessionRequestBody;

  try {
    body = (await request.json()) as SessionRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const adminError = await assertAdmin(request, body);

  if (adminError) {
    return adminError;
  }

  return Response.json({ ok: true });
}
