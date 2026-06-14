import { getContacts } from "@/app/dashboard/actions"
import ContactsClient from "./ContactsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Contacts", robots: "noindex, nofollow" }

export default async function ContactsPage() {
  const contacts = await getContacts()
  return <ContactsClient initial={contacts} />
}
