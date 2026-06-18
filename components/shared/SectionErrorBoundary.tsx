"use client"
// I catch render errors in homepage sections so one failing section never crashes the whole page.

import { Component, type ReactNode } from "react"

interface Props { children: ReactNode }
interface State { errored: boolean }

export default class SectionErrorBoundary extends Component<Props, State> {
  state: State = { errored: false }

  static getDerivedStateFromError() {
    return { errored: true }
  }

  render() {
    if (this.state.errored) return null
    return this.props.children
  }
}
