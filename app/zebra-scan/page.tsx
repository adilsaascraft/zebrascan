'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

type ScanDay = 'day1' | 'day2'

const DAY_API: Record<ScanDay, string> = {
  day1: '/api/registers/day1',
  day2: '/api/registers/day2',
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ZebraGateScanner() {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [activeDay, setActiveDay] = useState<ScanDay | null>(null)
  const [scanValue, setScanValue] = useState('')
  const [processing, setProcessing] = useState(false)
  const [successFlash, setSuccessFlash] = useState(false)

  const { data, mutate } = useSWR(
    activeDay
      ? `${process.env.NEXT_PUBLIC_API_URL}${DAY_API[activeDay]}`
      : null,
    fetcher,
  )

  const count = data?.count ?? 0

  // Keep focus always
  useEffect(() => {
    inputRef.current?.focus()
  }, [activeDay])

  const triggerSuccess = () => {
    setSuccessFlash(true)
    setTimeout(() => setSuccessFlash(false), 800)
  }

  const markAttendance = async (regNum: string) => {
    if (!activeDay) {
      toast.error('Please select a day first')
      return
    }

    if (processing) return

    setProcessing(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${DAY_API[activeDay]}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regNum }),
        },
      )

      const result = await res.json()

      if (!res.ok) throw new Error(result.message)

      triggerSuccess()
      mutate()
      setScanValue('')
      inputRef.current?.focus()
    } catch (err: any) {
      toast.error(err?.message || 'Scan failed')
    } finally {
      setProcessing(false)
    }
  }

  // Zebra auto-enter handler
  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter') {
      const value = scanValue.trim()
      if (!value) return
      await markAttendance(value)
    }
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center transition-colors
        ${successFlash ? 'bg-green-600' : 'bg-background'}
      `}
    >
       {/* ---------------- BANNER ---------------- */}
              <Image
                src="https://res.cloudinary.com/dymanaa1j/image/upload/v1772339421/ChatGPT_Image_Mar_1_2026_09_57_48_AM_1_nqjcvh.png"
                alt="Wedding Banner"
                width={1536}
                height={380}
                priority
                sizes="100vw"
                className="w-full h-auto object-contain"
              />

      {/* ---------------- DAY SELECT ---------------- */}
            <div className="flex justify-center gap-3 m-3 ">
        {(['day1', 'day2'] as ScanDay[]).map((day) => {
          const isActive = activeDay === day
      
          return (
            <Button
              key={day}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => setActiveDay(day)}
              className={
                isActive
                  ? 'bg-sky-800 hover:bg-sky-900 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300'
              }
            >
              {day.toUpperCase()}
              {isActive && (
                <Badge className="ml-2" variant="secondary">
                  {count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* 3️⃣ Visible Input */}
      <div className="w-full max-w-xl space-y-4 p-3">
        <input
          ref={inputRef}
          value={scanValue}
          onChange={(e) => setScanValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scanned Value..."
          className="w-full h-20 text-2xl px-6 rounded-2xl border 
                     shadow-lg focus:ring-2 focus:ring-primary outline-none"
          autoFocus
        />

        {/* 6️⃣ Manual Submit */}
        <Button
          onClick={() => markAttendance(scanValue.trim())}
          disabled={processing}
          className="w-full h-14 text-lg bg-sky-800 hover:bg-sky-900"
        >
          {processing ? 'Submitting...' : 'Submit'}
        </Button>
      </div>

      {/* 8️⃣ Success Tick */}
      {successFlash && (
        <CheckCircle2
          size={180}
          className="text-white fixed inset-0 m-auto"
        />
      )}
    </div>
  )
}