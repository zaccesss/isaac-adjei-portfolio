"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Target, Flame, Dumbbell, Scale, Utensils, TrendingDown, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  logWeight,
  setWeightGoal,
  createNutritionLog,
  deleteNutritionLog,
  createWorkoutLog,
  deleteWorkoutLog,
} from "@/app/dashboard/actions"
import { savedOk } from "@/lib/save-result"

export type WeightGoal = { startWeight: number; targetWeight: number; startDate: string; targetDate: string }
type Weight = { id: string; value: number; date: string }
type Nutrition = { id: string; date: string; meal: string; name: string; calories: number; protein_g: number | null; carbs_g: number | null; fat_g: number | null }
type Workout = { id: string; date: string; type: string; duration_min: number | null; calories: number | null; notes: string | null }
type Strava = { name: string | null; sport_type: string | null; distance_m: number | null; moving_time_s: number | null; calories: number | null; start_date: string | null }

const MEALS = ["breakfast", "lunch", "dinner", "snack"]
const WORKOUT_TYPES = ["gym", "run", "cycle", "swim", "walk", "other"]

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })

// Progress and a projected finish date from the weight history and the goal. The rate uses the oldest
// weigh-in within the last 28 days versus the latest; a date is only projected once that rate is a real
// loss, otherwise I prompt for more weigh-ins instead of guessing.
function progress(goal: WeightGoal, weights: Weight[], nowMs: number) {
  const current = weights[0]?.value ?? null
  if (current == null) return null
  const toLose = goal.startWeight - goal.targetWeight
  const lost = goal.startWeight - current
  const pct = toLose !== 0 ? Math.max(0, Math.min(1, lost / toLose)) : 0
  const remaining = Math.max(0, Math.round((current - goal.targetWeight) * 10) / 10)
  const cutoff = new Date(nowMs - 28 * 86_400_000).toISOString().slice(0, 10)
  const recent = weights.filter((w) => w.date >= cutoff)
  const oldest = recent[recent.length - 1]
  let ratePerWeek: number | null = null
  if (oldest && oldest.date < weights[0].date) {
    const days = (new Date(weights[0].date).getTime() - new Date(oldest.date).getTime()) / 86_400_000
    if (days >= 3) ratePerWeek = Math.round(((oldest.value - current) / days) * 7 * 100) / 100
  }
  let projectedDate: string | null = null
  let onTrack: boolean | null = null
  if (ratePerWeek != null && ratePerWeek > 0 && remaining > 0) {
    const pd = new Date(nowMs + (remaining / ratePerWeek) * 7 * 86_400_000)
    projectedDate = pd.toISOString().slice(0, 10)
    onTrack = pd <= new Date(goal.targetDate)
  }
  return { current, pct, remaining, ratePerWeek, projectedDate, onTrack }
}

export default function WeightLossClient({
  goal,
  weights,
  nutrition,
  workouts,
  strava,
}: {
  goal: WeightGoal | null
  weights: Weight[]
  nutrition: Nutrition[]
  workouts: Workout[]
  strava: Strava[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [nowMs] = useState(() => Date.now())
  const today = new Date(nowMs).toISOString().slice(0, 10)

  const prog = goal ? progress(goal, weights, nowMs) : null
  const current = weights[0]?.value ?? null

  const caloriesIn = nutrition.filter((n) => n.date === today).reduce((a, n) => a + (n.calories ?? 0), 0)
  const caloriesOut =
    workouts.filter((w) => w.date === today).reduce((a, w) => a + (w.calories ?? 0), 0) +
    strava.filter((s) => s.start_date?.slice(0, 10) === today).reduce((a, s) => a + (s.calories ?? 0), 0)

  const [showGoal, setShowGoal] = useState(!goal)
  const [gStart, setGStart] = useState(goal?.startWeight?.toString() ?? current?.toString() ?? "")
  const [gTarget, setGTarget] = useState(goal?.targetWeight?.toString() ?? "")
  const [gDate, setGDate] = useState(goal?.targetDate ?? "")
  const [wVal, setWVal] = useState("")
  const [nMeal, setNMeal] = useState("breakfast")
  const [nName, setNName] = useState("")
  const [nCals, setNCals] = useState("")
  const [nProt, setNProt] = useState("")
  const [woType, setWoType] = useState("gym")
  const [woDur, setWoDur] = useState("")
  const [woCals, setWoCals] = useState("")

  const refresh = () => router.refresh()

  function saveGoal() {
    const s = parseFloat(gStart)
    const t = parseFloat(gTarget)
    if (!s || !t || !gDate) return
    start(async () => {
      if (!savedOk(await setWeightGoal({ startWeight: s, targetWeight: t, startDate: goal?.startDate ?? today, targetDate: gDate }), "Could not save goal")) return
      setShowGoal(false)
      refresh()
    })
  }

  function addWeight() {
    const v = parseFloat(wVal)
    if (!v) return
    start(async () => {
      if (!savedOk(await logWeight(today, v), "Could not log weight")) return
      setWVal("")
      refresh()
    })
  }

  function addFood() {
    const c = parseInt(nCals, 10)
    if (!nName.trim() || isNaN(c)) return
    start(async () => {
      if (!savedOk(await createNutritionLog({ date: today, meal: nMeal, name: nName, calories: c, protein_g: nProt ? parseFloat(nProt) : undefined }), "Could not log food")) return
      setNName("")
      setNCals("")
      setNProt("")
      refresh()
    })
  }

  function addWorkout() {
    if (!woType) return
    start(async () => {
      const res = await createWorkoutLog({
        date: today,
        type: woType,
        duration_min: woDur ? parseInt(woDur, 10) : undefined,
        calories: woCals ? parseInt(woCals, 10) : undefined,
      })
      if (!savedOk(res, "Could not log workout")) return
      setWoDur("")
      setWoCals("")
      refresh()
    })
  }

  const input = "rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
  const todaysFood = nutrition.filter((n) => n.date === today)

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/health" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-primary" /> Weight loss
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Goal, weight, food and workouts</p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/health/weight-loss/analytics">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Analytics
          </Link>
        </Button>
      </div>

      {/* Goal & progress */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Goal
          </h2>
          {goal && !showGoal && (
            <Button variant="ghost" size="sm" onClick={() => setShowGoal(true)}>
              Edit
            </Button>
          )}
        </div>
        {showGoal ? (
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Start kg
              <input className={`${input} w-24`} value={gStart} onChange={(e) => setGStart(e.target.value)} type="number" step="0.1" />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Target kg
              <input className={`${input} w-24`} value={gTarget} onChange={(e) => setGTarget(e.target.value)} type="number" step="0.1" />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              By
              <input className={input} value={gDate} onChange={(e) => setGDate(e.target.value)} type="date" />
            </label>
            <Button size="sm" onClick={saveGoal} disabled={pending}>
              Save
            </Button>
            {goal && (
              <Button variant="ghost" size="sm" onClick={() => setShowGoal(false)}>
                Cancel
              </Button>
            )}
          </div>
        ) : goal && prog ? (
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{prog.current} kg</p>
                <p className="text-xs text-muted-foreground">
                  {goal.startWeight} kg start, {goal.targetWeight} kg goal
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{prog.remaining} kg to go</p>
                {prog.ratePerWeek != null && (
                  <p className="text-xs text-muted-foreground">
                    {prog.ratePerWeek > 0 ? `losing ${prog.ratePerWeek}` : `${prog.ratePerWeek}`} kg/week
                  </p>
                )}
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round(prog.pct * 100)}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{Math.round(prog.pct * 100)}% there</span>
              {prog.projectedDate ? (
                <span className={prog.onTrack ? "text-green-600" : "text-orange-500"}>
                  {prog.onTrack ? "On track" : "Behind"} - projected {fmtDate(prog.projectedDate)} (target {fmtDate(goal.targetDate)})
                </span>
              ) : (
                <span className="text-muted-foreground">Log a few weigh-ins to project a date</span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Set a goal to track your progress.</p>
        )}
      </section>

      {/* Today's calorie balance */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Eaten", value: caloriesIn, icon: <Utensils className="h-4 w-4" />, c: "text-foreground" },
          { label: "Burned", value: caloriesOut, icon: <Flame className="h-4 w-4 text-orange-500" />, c: "text-orange-500" },
          { label: "Net", value: caloriesIn - caloriesOut, icon: <Scale className="h-4 w-4" />, c: caloriesIn - caloriesOut < 0 ? "text-green-600" : "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {s.icon} {s.label} today
            </div>
            <p className={`text-2xl font-bold mt-1 ${s.c}`}>
              {s.value}
              <span className="text-sm font-normal text-muted-foreground"> kcal</span>
            </p>
          </div>
        ))}
      </section>

      {/* Weight log */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" /> Weight
        </h2>
        <div className="flex items-end gap-2">
          <input className={`${input} w-28`} value={wVal} onChange={(e) => setWVal(e.target.value)} type="number" step="0.1" placeholder="kg" />
          <Button size="sm" onClick={addWeight} disabled={pending}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Log today
          </Button>
        </div>
        {weights.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {weights.slice(0, 14).map((w) => (
              <span key={w.id} className="text-xs px-2 py-1 rounded-md bg-muted">
                {w.value}kg <span className="text-muted-foreground">{fmtDate(w.date)}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Food log */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Utensils className="h-4 w-4 text-primary" /> Food today
          <span className="text-sm font-normal text-muted-foreground">({caloriesIn} kcal)</span>
        </h2>
        <div className="flex flex-wrap items-end gap-2">
          <select aria-label="Meal" className={input} value={nMeal} onChange={(e) => setNMeal(e.target.value)}>
            {MEALS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input className={`${input} flex-1 min-w-[140px]`} value={nName} onChange={(e) => setNName(e.target.value)} placeholder="What did you eat?" />
          <input className={`${input} w-24`} value={nCals} onChange={(e) => setNCals(e.target.value)} type="number" placeholder="kcal" />
          <input className={`${input} w-20`} value={nProt} onChange={(e) => setNProt(e.target.value)} type="number" placeholder="protein" />
          <Button size="sm" onClick={addFood} disabled={pending}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="space-y-1">
          {todaysFood.map((n) => (
            <div key={n.id} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0">
              <span>
                <span className="text-muted-foreground text-xs uppercase mr-2">{n.meal}</span>
                {n.name}
              </span>
              <span className="flex items-center gap-2">
                <span>{n.calories} kcal</span>
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={() => start(async () => { if (!savedOk(await deleteNutritionLog(n.id), "Could not delete food")) return; refresh() })}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
          ))}
          {todaysFood.length === 0 && <p className="text-xs text-muted-foreground">Nothing logged today.</p>}
        </div>
      </section>

      {/* Workouts */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" /> Workouts
        </h2>
        <div className="flex flex-wrap items-end gap-2">
          <select aria-label="Workout type" className={input} value={woType} onChange={(e) => setWoType(e.target.value)}>
            {WORKOUT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input className={`${input} w-24`} value={woDur} onChange={(e) => setWoDur(e.target.value)} type="number" placeholder="min" />
          <input className={`${input} w-24`} value={woCals} onChange={(e) => setWoCals(e.target.value)} type="number" placeholder="kcal" />
          <Button size="sm" onClick={addWorkout} disabled={pending}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="space-y-1">
          {workouts.slice(0, 8).map((w) => (
            <div key={w.id} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0">
              <span className="capitalize">
                {w.type}
                <span className="text-muted-foreground text-xs ml-2">{fmtDate(w.date)}</span>
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <span>{[w.duration_min ? `${w.duration_min}m` : "", w.calories ? `${w.calories}kcal` : ""].filter(Boolean).join(" · ")}</span>
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={() => start(async () => { if (!savedOk(await deleteWorkoutLog(w.id), "Could not delete workout")) return; refresh() })}
                  className="hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
          ))}
          {strava.slice(0, 5).map((s, i) => (
            <div key={`strava-${i}`} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0">
              <span className="capitalize">
                {s.sport_type ?? "activity"}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FC4C02]/10 text-[#FC4C02] ml-1">Strava</span>
                <span className="text-muted-foreground text-xs ml-2">{s.start_date ? fmtDate(s.start_date) : ""}</span>
              </span>
              <span className="text-muted-foreground">
                {[s.distance_m ? `${Math.round(s.distance_m / 100) / 10}km` : "", s.calories ? `${s.calories}kcal` : ""].filter(Boolean).join(" · ")}
              </span>
            </div>
          ))}
          {workouts.length === 0 && strava.length === 0 && <p className="text-xs text-muted-foreground">No workouts yet.</p>}
        </div>
      </section>
    </div>
  )
}
