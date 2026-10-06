import { cn } from "@/lib/utils"

/** Marca da serraria: topo de uma tora com anéis de crescimento. */
export function Marca({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 shadow-lg shadow-orange-900/30",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[70%]"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <circle cx="12" cy="12" r="5.6" strokeWidth="1.4" strokeOpacity="0.85" />
        <circle cx="12.4" cy="11.7" r="2.4" strokeWidth="1.3" strokeOpacity="0.75" />
        <path d="M12 12 18 7.5" strokeWidth="1.2" strokeOpacity="0.7" />
      </svg>
    </span>
  )
}
