"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AccountCard } from "./account-card"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AccountsCarousel({ accounts, onDelete }) {
  const [emblaApi, setEmblaApi] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState([])

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  // ─────────────────────────────
  // TRACK CAROUSEL STATE
  // ─────────────────────────────
  useEffect(() => {
    if (!emblaApi) return

    setScrollSnaps(emblaApi.scrollSnapList())
    setSelectedIndex(emblaApi.selectedScrollSnap())

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on("select", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  return (
    <div className="w-full">

      {/* ───────────────── CAROUSEL ───────────────── */}
      <Carousel
        setApi={setEmblaApi}
        opts={{
          align: "start",
          containScroll: "trimSnaps",
          dragFree: false,
          skipSnaps: false,
          slidesToScroll: 1,
        }}
        className="relative overflow-hidden"
      >

        <CarouselContent className="flex-nowrap gap-6">

          {accounts.map((account) => (
            <CarouselItem
              key={account._id}
              className={cn(
                "min-w-0 shrink-0 grow-0",

                // RESPONSIVE VIEWS
                "basis-full sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(33.333%-1rem)]"
              )}
            >
              <AccountCard
                account={account}
                onDelete={onDelete}
              />
            </CarouselItem>
          ))}

        </CarouselContent>
      </Carousel>

      {/* ───────────────── NAV (TRADING STYLE) ───────────────── */}
      <div className="my-6 flex items-center justify-center relative">

        {/* LEFT */}
        <div className="absolute left-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            className="h-5 w-5 rounded-full border border-slate-700/50 bg-slate-950/40 text-slate-200 backdrop-blur-md hover:bg-slate-900/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* CENTER PROGRESS BAR (FIXED) */}
        <div className="flex items-center gap-2">

          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "h-0.5 rounded-full transition-all duration-300",

                selectedIndex === index
                  ? "w-10 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  : "w-6 bg-slate-700/60 hover:bg-slate-500/70"
              )}
            />
          ))}

        </div>

        {/* RIGHT */}
        <div className="absolute right-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            className="h-5 w-5 rounded-full border border-slate-700/50 bg-slate-950/40 text-slate-200 backdrop-blur-md hover:bg-slate-900/60"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

      </div>

    </div>
  )
}