const footerLinks = [
  { name: "콘텐츠 제작", href: "/contact" },
  { name: "광고 · PPL", href: "/contact" },
  { name: "섭외", href: "/contact" },
];

export const Footer = () => {
  return (
    <footer className="flex justify-between mt-[200px] py-[50px] px-[170px] border-t border-white/10">
      <div className="flex flex-col gap-[70px]">
        <p className="text-[14px] text-[#9A99A2]">
          음악과 아티스트를 기록하는 콘텐츠 스튜디오
        </p>
        <p className="text-[12px] text-[#5B5A62]">© 2026 The Artist Canvas</p>
      </div>
      <div className="flex flex-col items-end gap-[61px]">
        <div className="flex gap-[60px]">
          <span className="text-[14px] font-semibold text-[#5B5A62]">
            CONTACT
          </span>
          <ul className="flex gap-[54px]">
            {footerLinks.map((link, index) => (
              <li className="text-[14px] text-[#EAEAEC]">{link.name}</li>
            ))}
          </ul>
        </div>
        <div className="flex gap-[10px]">
          <div className="rounded-full border flex justify-center items-center border-white/10 w-[34px] h-[34px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M10.6667 2H5.33333C3.49238 2 2 3.49238 2 5.33333V10.6667C2 12.5076 3.49238 14 5.33333 14H10.6667C12.5076 14 14 12.5076 14 10.6667V5.33333C14 3.49238 12.5076 2 10.6667 2Z"
                stroke="#EAEAEC"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8.00065 10.6673C9.47341 10.6673 10.6673 9.47341 10.6673 8.00065C10.6673 6.52789 9.47341 5.33398 8.00065 5.33398C6.52789 5.33398 5.33398 6.52789 5.33398 8.00065C5.33398 9.47341 6.52789 10.6673 8.00065 10.6673Z"
                stroke="#EAEAEC"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="11.6667" cy="4.33268" r="0.666667" fill="#EAEAEC" />
            </svg>
          </div>
          <div className="rounded-full border flex justify-center items-center border-white/10 w-[34px] h-[34px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M11.3333 4H4.66667C3.19391 4 2 5.19391 2 6.66667V9.33333C2 10.8061 3.19391 12 4.66667 12H11.3333C12.8061 12 14 10.8061 14 9.33333V6.66667C14 5.19391 12.8061 4 11.3333 4Z"
                stroke="#EAEAEC"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7.33398 6.33398L10.0007 8.00065L7.33398 9.66732V6.33398Z"
                stroke="#EAEAEC"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
};
