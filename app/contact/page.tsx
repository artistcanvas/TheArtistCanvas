import Contact from "../_components/contact/Contact";
import { getContactData } from "../_lib/contact";

export default async function ContactPage() {
  const contactData = await getContactData();

  return (
    <div className="w-full pt-[clamp(129px,calc((217/1920)*100vw),217px)]">
      <Contact contactData={contactData} />
    </div>
  );
}
