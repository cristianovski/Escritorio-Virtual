import { useToast } from "../../hooks/use-toast"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map(function ({ id, title, description, variant, ...props }) {
        let tone = "text-info"
        let icon = <Info size={19} aria-hidden="true" />

        if (variant === 'success') {
            tone = "text-success"
            icon = <CheckCircle size={19} aria-hidden="true" />
        } else if (variant === 'destructive') {
            tone = "text-danger"
            icon = <AlertCircle size={19} aria-hidden="true" />
        }

        return (
          <ToastPrimitive.Root
            key={id}
            className="toast-root group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-surface bg-card/95 p-4 pr-10 text-foreground shadow-floating ring-1 ring-black/[0.05] backdrop-blur-xl transition-transform data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]"
            {...props}
          >
            <div className="flex gap-3 items-start">
                <div className={`mt-0.5 ${tone}`}>{icon}</div>
                <div className="grid gap-1">
                {title && <ToastPrimitive.Title className="text-sm font-medium">{title}</ToastPrimitive.Title>}
                {description && (
                    <ToastPrimitive.Description className="text-sm leading-5 text-muted-foreground">
                    {description}
                    </ToastPrimitive.Description>
                )}
                </div>
            </div>
            <ToastPrimitive.Close
              aria-label="Fechar notificação"
              className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        )
      })}
      <ToastPrimitive.Viewport className="fixed right-0 top-0 z-[100] flex max-h-screen w-full flex-col-reverse px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-4 md:max-w-[420px]" />
    </ToastPrimitive.Provider>
  )
}
