import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselOrientation = "horizontal" | "vertical"

type CarouselApi = {
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: () => boolean
  canScrollNext: () => boolean
}

type CarouselProps = {
  orientation?: CarouselOrientation
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  orientation: CarouselOrientation
  registerViewport: (node: HTMLDivElement | null) => void
  registerContent: (node: HTMLDivElement | null) => void
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  api: CarouselApi
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(({ orientation = "horizontal", setApi, className, children, ...props }, ref) => {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [contentNode, setContentNode] = React.useState<HTMLDivElement | null>(null)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const registerViewport = React.useCallback((node: HTMLDivElement | null) => {
    viewportRef.current = node
  }, [])

  const registerContent = React.useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node
    setContentNode(node)
  }, [])

  const updateScrollState = React.useCallback(() => {
    const node = contentNode
    if (!node) {
      setCanScrollPrev(false)
      setCanScrollNext(false)
      return
    }

    if (orientation === "horizontal") {
      const maxScrollLeft = node.scrollWidth - node.clientWidth
      setCanScrollPrev(node.scrollLeft > 0)
      setCanScrollNext(node.scrollLeft < maxScrollLeft - 1)
    } else {
      const maxScrollTop = node.scrollHeight - node.clientHeight
      setCanScrollPrev(node.scrollTop > 0)
      setCanScrollNext(node.scrollTop < maxScrollTop - 1)
    }
  }, [orientation])

  const scrollPrev = React.useCallback(() => {
    const node = contentRef.current
    if (!node) return

    const amount = orientation === "horizontal" ? node.clientWidth : node.clientHeight
    if (orientation === "horizontal") {
      node.scrollBy({ left: -amount, behavior: "smooth" })
    } else {
      node.scrollBy({ top: -amount, behavior: "smooth" })
    }
  }, [orientation])

  const scrollNext = React.useCallback(() => {
    const node = contentRef.current
    if (!node) return

    const amount = orientation === "horizontal" ? node.clientWidth : node.clientHeight
    if (orientation === "horizontal") {
      node.scrollBy({ left: amount, behavior: "smooth" })
    } else {
      node.scrollBy({ top: amount, behavior: "smooth" })
    }
  }, [orientation])

  React.useEffect(() => {
    const node = contentNode
    if (!node) return

    updateScrollState()

    const handleScroll = () => updateScrollState()
    const handleResize = () => updateScrollState()

    node.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)

    return () => {
      node.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [contentNode, updateScrollState])

  const api = React.useMemo<CarouselApi>(
    () => ({
      scrollPrev,
      scrollNext,
      canScrollPrev: () => canScrollPrev,
      canScrollNext: () => canScrollNext,
    }),
    [scrollPrev, scrollNext, canScrollPrev, canScrollNext]
  )

  React.useEffect(() => {
    if (setApi) {
      setApi(api)
    }
  }, [api, setApi])

  return (
    <CarouselContext.Provider
      value={{
        orientation,
        registerViewport,
        registerContent,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        api,
      }}
    >
      <div
        ref={ref}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
})
Carousel.displayName = "Carousel"

function useCombinedRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return React.useCallback(
    (node: T) => {
      for (const ref of refs) {
        if (!ref) continue
        if (typeof ref === "function") {
          ref(node)
        } else {
          ;(ref as React.MutableRefObject<T>).current = node
        }
      }
    },
    [refs]
  )
}

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { registerViewport, registerContent, orientation } = useCarousel()
  const mergedContentRef = useCombinedRefs<HTMLDivElement | null>(ref, registerContent)

  return (
    <div ref={registerViewport} className="overflow-hidden">
      <div
        ref={mergedContentRef}
        className={cn(
          "flex snap-mandatory",
          orientation === "horizontal" ? "-ml-4 snap-x" : "-mt-4 flex-col snap-y",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full snap-center",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal" ? "left-1 top-1/2 -translate-y-1/2" : "top-1 left-1/2 -translate-x-1/2",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Mostra precedente</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal" ? "right-1 top-1/2 -translate-y-1/2" : "bottom-1 left-1/2 -translate-x-1/2",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Mostra successivo</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
