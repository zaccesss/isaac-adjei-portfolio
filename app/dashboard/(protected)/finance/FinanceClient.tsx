"use client"
// A savings/spending tracker - income and expense transactions, each tagged with a category.
// Mini-analytics sit right on this page (running balance, income vs expense, category
// breakdown) rather than a separate analytics page, same pattern as Goals/Projects.

import { useState, useMemo, useTransition } from "react"
import {
  createFinanceTransaction, deleteFinanceTransaction, type FinanceTransaction,
} from "../../actions"
import { savedOk } from "@/lib/save-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Wallet, BarChart3, TrendingUp, TrendingDown } from "lucide-react"
import { StatCard, LineChart, Composed, PieChart, Waterfall, DEFAULT_CHART_COLOURS } from "@/components/analytics"

const CATEGORIES = ["Groceries", "Rent", "Transport", "Subscriptions", "Loan", "Job income", "Savings", "Other"]
const TYPES = ["income", "expense"]

const emptyForm = { date: new Date().toISOString().slice(0, 10), type: "expense", category: "Other", amount: "", description: "" }

const fmtGBP = (n: number) => `£${n.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`

export default function FinanceClient({ transactions: initial }: { transactions: FinanceTransaction[] }) {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(initial)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [, startTransition] = useTransition()

  const stats = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    const net = totalIncome - totalExpense

    const byCategory = CATEGORIES
      .map((c) => ({ name: c, value: transactions.filter((t) => t.type === "expense" && t.category === c).reduce((s, t) => s + t.amount, 0) }))
      .filter((d) => d.value > 0)

    const byMonth = new Map<string, { income: number; expense: number }>()
    for (const t of transactions) {
      const month = t.date.slice(0, 7)
      const cur = byMonth.get(month) ?? { income: 0, expense: 0 }
      if (t.type === "income") cur.income += t.amount
      else cur.expense += t.amount
      byMonth.set(month, cur)
    }
    const monthly = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([month, v]) => ({ name: month, income: v.income, expense: v.expense, net: v.income - v.expense }))
    const netByMonth = monthly.map((m) => ({ name: m.name, delta: m.net }))

    // Running balance over time, oldest to newest.
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
    const balance = sorted.reduce<{ date: string; balance: number }[]>((acc, t) => {
      const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0
      const delta = t.type === "income" ? t.amount : -t.amount
      return [...acc, { date: t.date, balance: prevBalance + delta }]
    }, [])

    return { totalIncome, totalExpense, net, byCategory, monthly, netByMonth, balance }
  }, [transactions])

  function handleAdd() {
    const amount = Number(form.amount)
    if (!form.date || !amount) return
    const prev = transactions
    const optimistic: FinanceTransaction = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      date: form.date,
      type: form.type,
      category: form.category,
      amount,
      description: form.description || null,
    }
    setTransactions((t) => [optimistic, ...t])
    setOpen(false)
    startTransition(async () => {
      const res = await createFinanceTransaction({ ...form, amount })
      if (!savedOk(res, "Could not save transaction")) setTransactions(prev)
    })
    setForm({ ...emptyForm, date: form.date })
  }

  function handleDelete(id: string) {
    const prev = transactions
    setTransactions((t) => t.filter((x) => x.id !== id))
    startTransition(async () => { const res = await deleteFinanceTransaction(id); if (!savedOk(res, "Could not delete transaction")) setTransactions(prev) })
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" /> Finance
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Savings and spending, tracked by hand.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add transaction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New transaction</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Amount (£)</label>
                  <Input type="number" step="0.01" min={0} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Description</label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} disabled={!form.date || !Number(form.amount)}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {transactions.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Finance analytics</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Total income" value={fmtGBP(stats.totalIncome)} accentClassName="text-green-600 dark:text-green-400" />
            <StatCard label="Total expense" value={fmtGBP(stats.totalExpense)} accentClassName="text-red-600 dark:text-red-400" />
            <StatCard label="Net savings" value={fmtGBP(stats.net)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-border rounded-xl p-4">
              <p className="text-sm font-medium mb-3">Running balance over time</p>
              <LineChart data={stats.balance} dataKey="balance" xKey="date" valueFormatter={fmtGBP} dots />
            </div>
            {stats.byCategory.length > 0 && (
              <div className="border border-border rounded-xl p-4">
                <p className="text-sm font-medium mb-3 text-center">Spending by category</p>
                <PieChart data={stats.byCategory} colours={DEFAULT_CHART_COLOURS} valueFormatter={fmtGBP} />
              </div>
            )}
          </div>

          {stats.monthly.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-border rounded-xl p-4">
                <p className="text-sm font-medium mb-1">Income vs expense, by month</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full" style={{ background: "#22c55e" }} /> Income</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full" style={{ background: "#ef4444" }} /> Expense</span>
                </div>
                <Composed
                  data={stats.monthly}
                  xKey="name"
                  barKey="income"
                  lineKey="expense"
                  barColour="#22c55e"
                  lineColour="#ef4444"
                  barName="Income"
                  lineName="Expense"
                  barValueFormatter={fmtGBP}
                  lineValueFormatter={fmtGBP}
                />
              </div>
              <div className="border border-border rounded-xl p-4">
                <p className="text-sm font-medium mb-1">Net change, by month</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Net positive</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Net negative</span>
                </div>
                <Waterfall steps={stats.netByMonth} valueFormatter={fmtGBP} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-16 text-center border border-dashed border-border rounded-lg">
            No transactions logged yet. Add one above to start tracking savings and spending.
          </p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 text-sm py-2 border-b border-border/50 last:border-0">
              <span className="w-24 text-xs text-muted-foreground">{t.date}</span>
              <Badge className="text-xs px-2 py-0">{t.category}</Badge>
              <span className="flex-1 text-xs text-muted-foreground truncate">{t.description}</span>
              <span className={`flex items-center gap-1 tabular-nums text-sm font-medium ${t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {t.type === "income" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {fmtGBP(t.amount)}
              </span>
              <button type="button" onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
