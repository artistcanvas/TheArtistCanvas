"use client";

import { KeyRound, Loader2, LogIn, Plus, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";

export default function AdminAccessGate() {
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    window.localStorage.removeItem("tac-admin-password");
  }, []);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password) {
      setStatus("비밀번호를 입력해 주세요.");
      return;
    }

    setIsLoggingIn(true);
    setStatus("");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();

    setIsLoggingIn(false);

    if (!response.ok) {
      setStatus(data.error ?? "비밀번호를 확인하지 못했습니다.");
      return;
    }

    setIsAuthenticated(true);
    setStatus("");
  };

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPassword) {
      setStatus("현재 비밀번호를 입력해 주세요.");
      return;
    }

    if (nextPassword.length < 8) {
      setStatus("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (nextPassword !== confirmPassword) {
      setStatus("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setIsSavingPassword(true);
    setStatus("");

    const response = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, nextPassword }),
    });
    const data = await response.json();

    setIsSavingPassword(false);

    if (!response.ok) {
      setStatus(data.error ?? "비밀번호를 추가하지 못했습니다.");
      return;
    }

    setPassword("");
    setCurrentPassword("");
    setNextPassword("");
    setConfirmPassword("");
    setIsPasswordFormOpen(false);
    setStatus("새 비밀번호가 저장되었습니다.");
  };

  if (isAuthenticated) {
    return <AdminDashboard adminPassword={password} />;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-220px)] w-full max-w-[520px] items-center">
      <div className="w-full space-y-5 rounded-[8px] border border-[#222226] bg-[#0C0C0E] p-5 md:p-7">
        <header className="border-b border-[#222226] pb-5">
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#8D4CFF]">
            Admin
          </p>
          <h1 className="mt-2 text-[30px] font-bold leading-tight">
            TAC 관리자 로그인
          </h1>
        </header>

        <form onSubmit={login} className="space-y-4">
          <label className="block">
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#9A99A2]">
              <KeyRound size={14} />
              비밀번호
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-[48px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition focus:border-[#8D4CFF]"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              disabled={isLoggingIn}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[8px] bg-white px-5 text-[14px] font-bold text-[#060607] transition hover:bg-[#D7D7DC] disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              로그인
            </button>
            <button
              type="button"
              onClick={() => setIsPasswordFormOpen((isOpen) => !isOpen)}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[8px] border border-[#2A2A2E] px-5 text-[14px] font-bold text-white transition hover:border-[#8D4CFF]"
            >
              <Plus size={16} />
              비밀번호 추가하기
            </button>
          </div>
        </form>

        {isPasswordFormOpen ? (
          <form onSubmit={savePassword} className="space-y-4 border-t border-[#222226] pt-5">
            <label className="block">
              <span className="text-[13px] font-semibold text-[#9A99A2]">
                현재 비밀번호
              </span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition focus:border-[#8D4CFF]"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-semibold text-[#9A99A2]">
                  새 비밀번호
                </span>
                <input
                  type="password"
                  value={nextPassword}
                  onChange={(event) => setNextPassword(event.target.value)}
                  minLength={8}
                  className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition focus:border-[#8D4CFF]"
                />
              </label>

              <label className="block">
                <span className="text-[13px] font-semibold text-[#9A99A2]">
                  새 비밀번호 확인
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition focus:border-[#8D4CFF]"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#8D4CFF] px-5 text-[14px] font-bold text-white transition hover:bg-[#7B3EF0] disabled:opacity-50"
            >
              {isSavingPassword ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              저장
            </button>
          </form>
        ) : null}

        {status ? (
          <p className="text-[13px] font-semibold text-[#9A99A2]">{status}</p>
        ) : null}
      </div>
    </main>
  );
}
