// Finance entries never reach the browser unless the PIN cookie is present - this holds real
// financial data, same standard as Vault. FinanceWrapper on the client handles prompting when
// the PIN is absent.
import { isPinVerified } from "@/lib/pin"
import { getFinanceTransactions } from "../../actions"
import FinanceWrapper from "./FinanceWrapper"

export const metadata = { title: "Finance", robots: "noindex, nofollow" }

export const dynamic = "force-dynamic"

export default async function FinancePage() {
  const pinVerified = await isPinVerified()
  const transactions = pinVerified ? await getFinanceTransactions() : []
  return <FinanceWrapper pinVerified={pinVerified} transactions={transactions} />
}
