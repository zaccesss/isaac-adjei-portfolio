"use client"

// Full project detail page layout.
// Shows the back link, title, description, image gallery, optional video embed,
// highlights list, tech stack badges and GitHub/demo links.

import Link from "next/link"
import { ArrowLeft, Github, ExternalLink } from "lucide-react"
import ImageGallery from "./ImageGallery"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { type Project } from "@/data/projects"
import { staggerContainer, fadeUp } from "@/lib/animations"
import ShareButton from "@/components/shared/ShareButton"

export type LabMeasurementPoint = {
  measurement_set: string
  frequency_hz: number
  magnitude_db: number | null
  phase_deg: number | null
}

interface Props {
  project: Project
  // Real hand-logged frequency-response readings for this project only, currently only wired up
  // for the audio amplifier - a Bode plot is genuinely project documentation, not a live/private
  // dashboard stat, so it belongs on the public write-up rather than a dashboard-only chart.
  measurements?: LabMeasurementPoint[]
}

const BODE_COLOURS = ["#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"]

function renderWithCode(text: string) {
  const parts = text.split(/(`[^`]+`)/)
  return parts.map((part, i) =>
    part.startsWith("`") && part.endsWith("`")
      ? <code key={i} className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">{part.slice(1, -1)}</code>
      : part
  )
}

export default function ProjectDetail({ project, measurements }: Props) {
  const sets = measurements?.length ? [...new Set(measurements.map((m) => m.measurement_set))] : []
  const frequencies = measurements?.length ? [...new Set(measurements.map((m) => m.frequency_hz))].sort((a, b) => a - b) : []
  const magnitudeData = frequencies.map((f) => {
    const row: Record<string, number> = { frequency_hz: f }
    for (const s of sets) {
      const p = measurements?.find((m) => m.measurement_set === s && m.frequency_hz === f)
      if (p?.magnitude_db != null) row[s] = p.magnitude_db
    }
    return row
  })
  const phaseData = frequencies.map((f) => {
    const row: Record<string, number> = { frequency_hz: f }
    for (const s of sets) {
      const p = measurements?.find((m) => m.measurement_set === s && m.frequency_hz === f)
      if (p?.phase_deg != null) row[s] = p.phase_deg
    }
    return row
  })
  const hasPhaseData = phaseData.some((row) => Object.keys(row).length > 1)

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="container max-w-3xl py-24 space-y-10"
    >
      <motion.div variants={fadeUp}>
        <Button asChild variant="ghost" size="sm" className="pl-0 mb-6">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>

        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="capitalize">
              {project.category}
            </Badge>
            {project.ongoing && (
              <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 border">
                Ongoing
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">{project.date}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
          <p className="text-lg text-muted-foreground">{project.description}</p>

          <div className="flex items-center gap-3 pt-2">
            {project.github && (
              <Button asChild variant="outline" size="sm">
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </Button>
            )}
            {project.demo && (
              <Button asChild size="sm">
                <a href={project.demo} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Live demo
                </a>
              </Button>
            )}
            <ShareButton title={project.title} />
          </div>
        </div>
      </motion.div>

      <Separator />

      <motion.div variants={fadeUp} className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Overview</h2>
          {project.longDescription.split("\n\n").map((para, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">
              {renderWithCode(para)}
            </p>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Key highlights</h2>
          <ul className="space-y-2">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">·</span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>

      {frequencies.length > 0 && (
        <>
          <Separator />
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-xl font-semibold">Frequency response</h2>
            <p className="text-muted-foreground leading-relaxed">
              Real hand-logged readings across breadboard and PCB builds, plus a theoretical curve
              calculated from the reported component values - the standard Bode plot shape for
              this kind of analogue design.
            </p>
            <div className="border border-border rounded-lg p-4 bg-card">
              <p className="text-sm font-semibold mb-3">Magnitude (dB) vs frequency</p>
              <ResponsiveContainer width="100%" height={260}>
                <RLineChart data={magnitudeData} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="frequency_hz" scale="log" domain={["auto", "auto"]} type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} labelFormatter={(v) => `${v} Hz`} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {sets.map((s, i) => (
                    <Line key={s} type="monotone" dataKey={s} stroke={BODE_COLOURS[i % BODE_COLOURS.length]} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                  ))}
                </RLineChart>
              </ResponsiveContainer>
            </div>
            {hasPhaseData && (
              <div className="border border-border rounded-lg p-4 bg-card">
                <p className="text-sm font-semibold mb-3">Phase (deg) vs frequency</p>
                <ResponsiveContainer width="100%" height={260}>
                  <RLineChart data={phaseData} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="frequency_hz" scale="log" domain={["auto", "auto"]} type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} labelFormatter={(v) => `${v} Hz`} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    {sets.map((s, i) => (
                      <Line key={s} type="monotone" dataKey={s} stroke={BODE_COLOURS[i % BODE_COLOURS.length]} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                    ))}
                  </RLineChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </>
      )}

      {project.images.length > 0 && (
        <>
          <Separator />
          <motion.div variants={fadeUp} className="space-y-4">
            <h2 className="text-xl font-semibold">Gallery</h2>
            <ImageGallery images={project.images} title={project.title} />
            {project.video && (
              // Demo video sits below the gallery with a labelled heading
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-wide text-center">
                  Project demo
                </h3>
                <div className="flex justify-center">
                  <video
                    src={project.video}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-w-2xl rounded-lg aspect-video bg-black"
                    aria-label={`${project.title} demo video`}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}

    </motion.div>
  )
}
