import { changeAdminPassword } from "../_lib/auth";

type PasswordRequestBody = {
  currentPassword?: unknown;
  nextPassword?: unknown;
};

export async function POST(request: Request) {
  let body: PasswordRequestBody;

  try {
    body = (await request.json()) as PasswordRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const error = await changeAdminPassword({
    currentPassword: body.currentPassword,
    nextPassword: body.nextPassword,
  });

  if (error) {
    return error;
  }

  return Response.json({ ok: true });
}
