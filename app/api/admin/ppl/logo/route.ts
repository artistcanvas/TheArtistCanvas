import { assertAdminPassword } from "../../_lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = "ppl-logos";

function getExtension(file: File) {
  const fromName = file.name.split(".").pop();

  if (fromName && /^[a-z0-9]+$/i.test(fromName)) {
    return fromName.toLowerCase();
  }

  return file.type.split("/").pop() || "png";
}

export async function POST(request: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { error: "Supabase admin environment variables are not configured." },
      { status: 500 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const password = formData?.get("password");
  const file = formData?.get("file");

  const adminError = await assertAdminPassword(password);

  if (adminError) {
    return adminError;
  }

  if (!(file instanceof File)) {
    return Response.json({ error: "Logo file is required." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Only image files are allowed." }, { status: 400 });
  }

  const filename = `${crypto.randomUUID()}.${getExtension(file)}`;
  const uploadUrl = new URL(
    `/storage/v1/object/${bucketName}/${filename}`,
    supabaseUrl
  );

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: file,
  });

  if (!response.ok) {
    return Response.json(
      { error: await response.text() },
      { status: response.status }
    );
  }

  const publicUrl = new URL(
    `/storage/v1/object/public/${bucketName}/${filename}`,
    supabaseUrl
  );

  return Response.json({ logoUrl: publicUrl.toString() });
}
