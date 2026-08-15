import { getFinanceTransactions } from "../../actions"
import FinanceClient from "./FinanceClient"

export const metadata = { title: "Finance" }

export const dynamic = "force-dynamic"

export default async function FinancePage() {
  const transactions = await getFinanceTransactions()
  return <FinanceClient transactions={transactions} />
}
