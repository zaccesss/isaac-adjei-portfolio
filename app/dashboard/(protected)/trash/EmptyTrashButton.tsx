"use client"

import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useTransition } from "react"
import { emptyTrash } from "@/app/dashboard/actions"
import { useRouter } from "next/navigation"

export default function EmptyTrashButton({ count }: { count: number }) {
  const { confirm, dialog } = useConfirmDialog()
  const [, startTransition] = useTransition()
  const router = useRouter()

  async function handleClick() {
    const ok = await confirm({
      title: "Empty trash?",
      description: `This will permanently delete all ${count} item${count !== 1 ? "s" : ""} in the trash. This cannot be undone.`,
      confirmLabel: "Empty trash",
      destructive: true,
    })
    if (!ok) return
    startTransition(async () => {
      await emptyTrash()
      router.refresh()
    })
  }

  return (
    <>
      {dialog}
      <button
        type="button"
        onClick={handleClick}
        className="text-xs text-destructive hover:underline"
      >
        Empty trash
      </button>
    </>
  )
}
