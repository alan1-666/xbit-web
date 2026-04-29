import { useEffect } from 'react'

/**
 * useUpdateWCModal
 *
 * Ensures ALL <wcm-modal> instances (WalletConnect / Web3Modal)
 * have an accessible name on their internal overlay
 * <div role="dialog" | "alertdialog"> by setting aria-label
 * if it's missing.
 *
 * Usage:
 *   // In a top-level client component that is always mounted:
 *   useUpdateWCModal('Connect your wallet')
 */
export function useUpdateWCModal(label: string = 'Connect your wallet'): void {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateAllModals = () => {
      const modals = document.querySelectorAll<HTMLElement>('wcm-modal')
      if (!modals.length) return

      modals.forEach((modal) => {
        const shadow = (modal as any).shadowRoot as ShadowRoot | null
        if (!shadow) return

        const overlay = shadow.querySelector<HTMLElement>(
          '[role="dialog"], [role="alertdialog"]'
        )

        if (!overlay) return

        const hasLabel =
          overlay.hasAttribute('aria-label') ||
          overlay.hasAttribute('aria-labelledby')

        if (!hasLabel) {
          overlay.setAttribute('aria-label', label)
        }
      })
    }

    // 1) Try immediately (in case modal is already in DOM)
    updateAllModals()

    // 2) Watch DOM changes for future <wcm-modal> inserts / re-renders
    const observer = new MutationObserver(() => {
      updateAllModals()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [label])
}
