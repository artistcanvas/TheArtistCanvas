"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ContactInquiryType } from "../_lib/contact";
import { contactSections } from "../_lib/contact";

type AdminContactEmail = {
  id: string;
  inquiry_type: ContactInquiryType;
  email: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

const defaultInquiryType: ContactInquiryType = "content_production";

type AdminContactFormProps = {
  adminPassword: string;
};

export default function AdminContactForm({
  adminPassword,
}: AdminContactFormProps) {
  const [password, setPassword] = useState(adminPassword);
  const [emails, setEmails] = useState<AdminContactEmail[]>([]);
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [inquiryType, setInquiryType] =
    useState<ContactInquiryType>(defaultInquiryType);
  const [email, setEmail] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPublished, setIsPublished] = useState(true);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = Boolean(editingEmailId);
  const filteredEmails = useMemo(
    () => emails.filter((item) => item.inquiry_type === inquiryType),
    [emails, inquiryType]
  );

  const resetForm = () => {
    setEditingEmailId(null);
    setInquiryType(defaultInquiryType);
    setEmail("");
    setSortOrder("0");
    setIsPublished(true);
    setStatus("Contact 이메일 추가 모드입니다.");
  };

  const loadEmails = async (adminPassword = password) => {
    if (!adminPassword) {
      setStatus("관리자 비밀번호를 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/admin/contact", {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setStatus(data.error ?? "Contact 이메일 목록을 불러오지 못했습니다.");
      return;
    }

    setEmails(data.emails ?? []);
    setStatus("Contact 관리자 연결을 확인했습니다.");
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEmails(adminPassword);
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPassword]);

  const selectEmail = (item: AdminContactEmail) => {
    setEditingEmailId(item.id);
    setInquiryType(item.inquiry_type);
    setEmail(item.email);
    setSortOrder(item.sort_order.toString());
    setIsPublished(item.is_published);
    setStatus("수정할 Contact 이메일을 불러왔습니다.");
  };

  const saveEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password) {
      setStatus("관리자 비밀번호를 입력해 주세요.");
      return;
    }

    if (!email.trim()) {
      setStatus("이메일은 필수입니다.");
      return;
    }

    setIsSaving(true);
    setStatus("");

    const response = await fetch("/api/admin/contact", {
      method: isEditMode ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingEmailId,
        password,
        inquiryType,
        email,
        sortOrder: isEditMode ? sortOrder : filteredEmails.length,
        isPublished,
      }),
    });
    const data = await response.json();

    setIsSaving(false);

    if (!response.ok) {
      setStatus(data.error ?? "Contact 이메일을 저장하지 못했습니다.");
      return;
    }

    setStatus(
      isEditMode ? "Contact 이메일을 수정했습니다." : "Contact 이메일을 저장했습니다."
    );
    await loadEmails(password);

    if (!isEditMode) {
      resetForm();
    }
  };

  const reorderEmails = async (emailId: string, direction: -1 | 1) => {
    const currentIndex = filteredEmails.findIndex((item) => item.id === emailId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= filteredEmails.length) {
      return;
    }

    const nextEmails = [...filteredEmails];
    [nextEmails[currentIndex], nextEmails[nextIndex]] = [
      nextEmails[nextIndex],
      nextEmails[currentIndex],
    ];

    setStatus("Contact 이메일 순서를 저장하는 중입니다.");

    const response = await fetch("/api/admin/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reorder",
        password,
        ids: nextEmails.map((item) => item.id),
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Contact 이메일 순서를 저장하지 못했습니다.");
      return;
    }

    await loadEmails(password);
    setStatus("Contact 이메일 순서를 저장했습니다.");
  };

  const deleteEmail = async (item: AdminContactEmail) => {
    if (!window.confirm(`"${item.email}" 이메일을 삭제할까요?`)) {
      return;
    }

    const response = await fetch("/api/admin/contact", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id: item.id }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Contact 이메일을 삭제하지 못했습니다.");
      return;
    }

    if (editingEmailId === item.id) {
      resetForm();
    }

    await loadEmails(password);
    setStatus("Contact 이메일을 삭제했습니다.");
  };

  return (
    <section className="mx-auto grid w-full max-w-[1280px] gap-8 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
      <aside className="space-y-4 xl:sticky xl:top-[120px] xl:h-fit">
        <div className="border-b border-[#222226] pb-4">
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#8D4CFF]">
            Contact
          </p>
          <h2 className="mt-2 text-[20px] font-bold">등록된 이메일</h2>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[1.4px] text-[#6E6C76]">
            {inquiryType}
          </p>
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-[8px] border border-[#2A2A2E] text-[13px] font-bold text-white transition hover:border-[#8D4CFF]"
        >
          <Plus size={15} />
          이메일 추가
        </button>

        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {filteredEmails.length > 0 ? (
            filteredEmails.map((item, index) => {
              const isActive = item.id === editingEmailId;

              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-[1fr_auto] gap-2 rounded-[8px] border p-3 transition ${
                    isActive
                      ? "border-[#8D4CFF] bg-[#171122]"
                      : "border-[#222226] bg-[#101012] hover:border-[#4C4B52]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectEmail(item)}
                    className="min-w-0 text-left"
                  >
                    <span className="block truncate text-[13px] font-bold text-white">
                      {item.email}
                    </span>
                    <span className="mt-2 block text-[11px] font-semibold text-[#6E6C76]">
                      {item.is_published ? "공개" : "비공개"}
                    </span>
                  </button>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => reorderEmails(item.id, -1)}
                      disabled={index === 0}
                      aria-label={`${item.email} 위로 이동`}
                      className="flex size-7 items-center justify-center rounded-[6px] border border-[#303036] text-[#B9B8C0] transition hover:border-[#8D4CFF] hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => reorderEmails(item.id, 1)}
                      disabled={index === filteredEmails.length - 1}
                      aria-label={`${item.email} 아래로 이동`}
                      className="flex size-7 items-center justify-center rounded-[6px] border border-[#303036] text-[#B9B8C0] transition hover:border-[#8D4CFF] hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEmail(item)}
                      aria-label={`${item.email} 삭제`}
                      className="col-span-2 flex h-7 items-center justify-center rounded-[6px] border border-[#303036] text-[#B9B8C0] transition hover:border-[#FF6B6B] hover:text-[#FF9A9A]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-[8px] border border-[#222226] bg-[#101012] p-4 text-[13px] text-[#8E8D96]">
              비밀번호 확인 후 목록이 표시됩니다.
            </p>
          )}
        </div>
      </aside>

      <form onSubmit={saveEmail} className="space-y-7">
        <div className="flex items-start justify-between gap-4 border-b border-[#222226] pb-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#8D4CFF]">
              Admin
            </p>
            <h1 className="mt-2 text-[28px] font-bold leading-tight md:text-[42px]">
              Contact 관리
            </h1>
          </div>
          {isEditMode ? (
            <span className="inline-flex h-[34px] items-center gap-2 rounded-full border border-[#8D4CFF]/50 px-3 text-[12px] font-bold text-[#C9B3FF]">
              <Pencil size={14} />
              수정 모드
            </span>
          ) : null}
        </div>

        <div className="hidden">
          <label className="block">
            <span className="text-[13px] font-semibold text-[#9A99A2]">
              관리자 비밀번호
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition focus:border-[#8D4CFF]"
            />
          </label>
          <button
            type="button"
            onClick={() => void loadEmails()}
            disabled={isLoading}
            className="mt-auto inline-flex h-[46px] items-center justify-center gap-2 rounded-[8px] bg-white px-5 text-[14px] font-bold text-[#060607] transition hover:bg-[#D7D7DC] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            확인
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {contactSections.map((section) => {
            const isActive = section.inquiryType === inquiryType;

            return (
              <button
                key={section.inquiryType}
                type="button"
                onClick={() => setInquiryType(section.inquiryType)}
                className={`min-h-[52px] rounded-[8px] border px-4 text-left text-[13px] font-bold transition ${
                  isActive
                    ? "border-[#8D4CFF] bg-[#8D4CFF] text-white"
                    : "border-[#2A2A2E] bg-[#101012] text-[#8E8D96] hover:border-[#6E6C76]"
                }`}
              >
                {section.title}
                {section.detail ? (
                  <span className="mt-1 block text-[11px] font-medium opacity-75">
                    {section.detail}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="text-[13px] font-semibold text-[#9A99A2]">
              이메일
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="hello@tac.com"
              className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#8D4CFF]"
            />
          </label>
        </div>

        <label className="flex h-[42px] w-fit items-center gap-3 rounded-[8px] border border-[#2A2A2E] px-4 text-[13px] font-semibold text-[#C7C6CC]">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="size-4 accent-[#8D4CFF]"
          />
          공개
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[8px] bg-[#8D4CFF] px-7 text-[15px] font-bold text-white transition hover:bg-[#7B3EF0] disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isEditMode ? "이메일 수정 저장" : "이메일 저장"}
          </button>
          {isEditMode ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[8px] border border-[#2A2A2E] px-5 text-[14px] font-bold text-[#C7C6CC] transition hover:border-[#8D4CFF] hover:text-white"
            >
              <X size={16} />
              취소
            </button>
          ) : null}
          {status ? (
            <p className="text-[13px] font-semibold text-[#9A99A2]">
              {status}
            </p>
          ) : null}
        </div>
      </form>

      <aside className="space-y-4 xl:sticky xl:top-[120px] xl:h-fit">
        <div className="rounded-[8px] border border-[#222226] bg-[#101012] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#8D4CFF]">
            Contact Preview
          </p>
          <div className="mt-5 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#8D4CFF] text-white">
              <Mail size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[18px] font-bold text-white">
                {
                  contactSections.find(
                    (section) => section.inquiryType === inquiryType
                  )?.title
                }
              </h2>
              <p className="mt-2 break-all text-[14px] leading-[1.6] text-[#A7A6AE]">
                {email || "contact@example.com"}
              </p>
            </div>
          </div>
        </div>

        <a
          href="/contact"
          className="inline-flex h-[42px] items-center gap-2 rounded-[8px] border border-[#2A2A2E] px-4 text-[13px] font-bold text-[#C7C6CC] transition hover:border-[#8D4CFF] hover:text-white"
        >
          <Plus size={15} />
          Contact 보기
        </a>
      </aside>
    </section>
  );
}
