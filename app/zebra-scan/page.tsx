'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle2, XCircle } from 'lucide-react'

type ScanDay = 'day1' | 'day2'

const DAY_API: Record<ScanDay, string> = {
  day1: '/api/registers/day1',
  day2: '/api/registers/day2',
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ScanResult =
  | {
      type: 'success'
      message: string
      name: string
      mobile: string
      note: string
      regNum: string
    }
  | {
      type: 'error'
      message: string
    }
  | null

export default function ZebraGateScanner() {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [activeDay, setActiveDay] = useState<ScanDay | null>(null)
  const [scanValue, setScanValue] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ScanResult>(null)

  const { data, mutate } = useSWR(
    activeDay
      ? `${process.env.NEXT_PUBLIC_API_URL}${DAY_API[activeDay]}`
      : null,
    fetcher,
  )

  const count = data?.count ?? 0

  // Keep input focused always
  useEffect(() => {
    inputRef.current?.focus()
  }, [activeDay, result])

const markAttendance = async (regNum: string) => {
  if (!activeDay) {
    toast.error('Please select a day first', { duration: 2000 })
    return
  }

  if (processing) return

  setProcessing(true)
  setResult(null) // clear previous success panel

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${DAY_API[activeDay]}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNum }),
      },
    )

    const json = await res.json()

    // 🔥 Handle HTTP error
    if (!res.ok) {
      throw new Error(json?.message || 'Scan failed')
    }

    // 🔥 Handle success:false from backend
    if (!json?.success) {
      toast.error(json?.message || 'Scan failed', {
        duration: 2000,
      })

      setScanValue('') // clear input
      inputRef.current?.focus()
      return
    }

    // ✅ SUCCESS CASE
    const attendee = json?.data || {}

    setResult({
      type: 'success',
      message: json?.message || 'Success',
      name: attendee?.name || '-',
      mobile: attendee?.mobile || '-',
      note: attendee?.note || '-',
      regNum: attendee?.regNum || regNum,
    })

    mutate()
    setScanValue('')
  } catch (err: any) {
    toast.error(err?.message || 'Scan failed', {
      duration: 2000,
    })

    setScanValue('')
  } finally {
    setProcessing(false)
    inputRef.current?.focus()
  }
}

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
    <div className="min-h-screen flex flex-col items-center bg-background">

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
      <div className="flex justify-center gap-3 m-4">
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

      {/* ---------------- RESULT PANEL ---------------- */}
      {result && (
        <div
          className={`mx-auto w-full max-w-md rounded-xl p-4 text-white space-y-2 transition-all
          ${result.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
        `}
        >
          <div className="flex items-center gap-2">
            {result.type === 'success' ? <CheckCircle2 /> : <XCircle />}
            <span className="font-bold text-base">
              {result.message}
            </span>
          </div>

          {result.type === 'success' && (
            <div className="mt-4 rounded-xl bg-white/20 p-4 space-y-3 text-sm">

              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium opacity-80">Reg No</span>
                <span className="col-span-2 font-semibold">{result.regNum}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium opacity-80">Name</span>
                <span className="col-span-2 font-semibold">{result.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium opacity-80">Mobile</span>
                <span className="col-span-2 font-semibold">{result.mobile}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium opacity-80">Note</span>
                <span className="col-span-2 font-semibold">{result.note}</span>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ---------------- INPUT ---------------- */}
      <div className="w-full max-w-xl space-y-4 p-4">
        <input
          ref={inputRef}
          value={scanValue}
          onChange={(e) => setScanValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scanned Value..."
          className="w-full h-20 text-2xl px-6 rounded-2xl border shadow-lg focus:ring-2 focus:ring-primary outline-none"
          autoFocus
        />

        <Button
          onClick={() => markAttendance(scanValue.trim())}
          disabled={processing}
          className="w-full h-14 text-lg bg-sky-800 hover:bg-sky-900"
        >
          {processing ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  )
}