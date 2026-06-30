import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

type AdminBody = {
  password?: unknown;
};

type AdminSettingRow = {
  key: string;
  value: string;
};

const scryptAsync = promisify(scrypt);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const fallbackAdminPassword = process.env.ADMIN_PASSWORD;
const passwordSettingKey = "admin_password_hash";

function assertSupabaseConfig() {
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { error: "Supabase admin environment variables are not configured." },
      { status: 500 }
    );
  }

  return null;
}

function getAdminPassword(request: Request, body?: AdminBody) {
  return request.headers.get("x-admin-password") ?? body?.password;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, hash] = passwordHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const savedHash = Buffer.from(hash, "hex");
  const derivedKey = (await scryptAsync(password, salt, savedHash.length)) as Buffer;

  return (
    savedHash.length === derivedKey.length && timingSafeEqual(savedHash, derivedKey)
  );
}

async function supabaseAdminRequest<T>(path: string, init: RequestInit = {}) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are not configured.");
  }

  const response = await fetch(new URL(path, supabaseUrl), {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

async function getSavedPasswordHash() {
  const rows = await supabaseAdminRequest<AdminSettingRow[]>(
    `/rest/v1/admin_settings?key=eq.${passwordSettingKey}&select=key,value&limit=1`
  );

  return rows[0]?.value ?? null;
}

export async function assertAdmin(request: Request, body?: AdminBody) {
  const configError = assertSupabaseConfig();

  if (configError) {
    return configError;
  }

  const password = getAdminPassword(request, body);

  if (typeof password !== "string" || !password) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const savedPasswordHash = await getSavedPasswordHash();

    if (savedPasswordHash) {
      const isValid = await verifyPassword(password, savedPasswordHash);

      if (!isValid) {
        return Response.json({ error: "Unauthorized." }, { status: 401 });
      }

      return null;
    }
  } catch {
    if (!fallbackAdminPassword) {
      return Response.json(
        { error: "Admin password storage is not configured." },
        { status: 500 }
      );
    }
  }

  if (!fallbackAdminPassword || password !== fallbackAdminPassword) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}

export async function assertAdminPassword(password: unknown) {
  const request = new Request("http://localhost", {
    headers: typeof password === "string" ? { "x-admin-password": password } : {},
  });

  return assertAdmin(request);
}

export async function changeAdminPassword({
  currentPassword,
  nextPassword,
}: {
  currentPassword: unknown;
  nextPassword: unknown;
}) {
  const configError = assertSupabaseConfig();

  if (configError) {
    return configError;
  }

  if (typeof nextPassword !== "string" || nextPassword.length < 8) {
    return Response.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const adminError = await assertAdminPassword(currentPassword);

  if (adminError) {
    return adminError;
  }

  const passwordHash = await hashPassword(nextPassword);

  await supabaseAdminRequest("/rest/v1/admin_settings?on_conflict=key", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      key: passwordSettingKey,
      value: passwordHash,
      updated_at: new Date().toISOString(),
    }),
  });

  return null;
}
