import AdminWorksForm from "./AdminWorksForm";

export default function AdminPage() {
  return (
    <div className="min-h-screen w-full bg-[#060607] px-5 pb-20 pt-[120px] text-white md:px-[clamp(24px,calc((120/1920)*100vw),120px)] md:pt-[150px]">
      <AdminWorksForm />
    </div>
  );
}
