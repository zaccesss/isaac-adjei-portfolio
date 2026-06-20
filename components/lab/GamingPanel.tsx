"use client"

import { useEffect, useState } from "react"
import { Gamepad2 } from "lucide-react"

type PS5Data = { online: boolean; lastSeen: string | null; game: string | null; gameImage: string | null; lastGame: string | null; lastGameImage: string | null }
type GPCData = { online: boolean; lastSeen: string | null; cpu: number | null; gpu: number | null; game: string | null; game_image?: string | null }

function timeSince(ts: string | null) {
  if (!ts) return null
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function GamingPanel() {
  const [ps5, setPS5] = useState<PS5Data | null>(null)
  const [gpc, setGPC] = useState<GPCData | null>(null)

  useEffect(() => {
    const load = async () => {
      const [r1, r2] = await Promise.all([fetch("/api/ps5"), fetch("/api/gpc")])
      if (r1.ok) setPS5(await r1.json())
      if (r2.ok) setGPC(await r2.json())
    }
    load()
    const iv = setInterval(load, 30_000)
    return () => clearInterval(iv)
  }, [])

  const ps5Game = ps5?.game || ps5?.lastGame || null
  const ps5Art  = ps5?.game ? ps5.gameImage : ps5?.lastGameImage
  const gpcGame = gpc?.game || null
  const gpcArt  = (gpc as any)?.game_image ?? null

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-1.5">
        <Gamepad2 className="h-3 w-3 text-muted-foreground shrink-0" />
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">gaming</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* PS5 */}
        <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
          {ps5Art && (
            <div className="relative h-16 w-full overflow-hidden">
              <img src={ps5Art} alt="" className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
            </div>
          )}
          <div className="p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">PS5</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${ps5?.online ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {ps5?.online ? "online" : ps5 ? `${timeSince(ps5.lastSeen)}` : "—"}
              </span>
            </div>
            {ps5Game ? (
              <p className="text-xs font-mono font-medium leading-tight line-clamp-2">{ps5Game}</p>
            ) : (
              <p className="text-[10px] font-mono text-muted-foreground/50">not gaming</p>
            )}
            {!ps5?.online && ps5?.lastSeen && (
              <p className="text-[9px] font-mono text-muted-foreground/40">last seen {timeSince(ps5.lastSeen)}</p>
            )}
          </div>
        </div>

        {/* GPC */}
        <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
          {gpcArt && (
            <div className="relative h-16 w-full overflow-hidden">
              <img src={gpcArt} alt="" className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
            </div>
          )}
          <div className="p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">PC</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${gpc?.online ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {gpc?.online ? "online" : gpc ? `offline` : "—"}
              </span>
            </div>
            {gpcGame ? (
              <p className="text-xs font-mono font-medium leading-tight line-clamp-2">{gpcGame}</p>
            ) : (
              <p className="text-[10px] font-mono text-muted-foreground/50">{gpc?.online ? "idle" : "offline"}</p>
            )}
            {gpc?.online && (gpc.cpu != null || gpc.gpu != null) && (
              <div className="flex gap-3 pt-0.5">
                {gpc.cpu != null && (
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-mono text-muted-foreground/50">CPU</p>
                    <div className="flex items-center gap-1">
                      <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${gpc.cpu}%` }} />
                      </div>
                      <span className="text-[8px] font-mono text-muted-foreground">{gpc.cpu}%</span>
                    </div>
                  </div>
                )}
                {gpc.gpu != null && (
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-mono text-muted-foreground/50">GPU</p>
                    <div className="flex items-center gap-1">
                      <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500/60 rounded-full" style={{ width: `${gpc.gpu}%` }} />
                      </div>
                      <span className="text-[8px] font-mono text-muted-foreground">{gpc.gpu}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!gpc?.online && gpc?.lastSeen && (
              <p className="text-[9px] font-mono text-muted-foreground/40">last seen {timeSince(gpc.lastSeen)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
