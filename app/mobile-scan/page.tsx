'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { toast } from 'sonner'

type ScanDay = 'day1' | 'day2'

const DAY_API: Record<ScanDay, string> = {
  day1: '/api/registers/day1',
  day2: '/api/registers/day2',
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ScanResult = {
  type: 'success' | 'error'
  message: string
  name: string
  mobile: string
  note: string
  regNum: string
} | null

export default function QrScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const [activeDay, setActiveDay] = useState<ScanDay | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResult>(null)

  const { data, mutate } = useSWR(
    activeDay
      ? `${process.env.NEXT_PUBLIC_API_URL}${DAY_API[activeDay]}`
      : null,
    fetcher,
  )

  const count = data?.count ?? 0

  const playBeep = (type: 'success' | 'error') => {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.frequency.value = type === 'success' ? 880 : 220
    gain.gain.value = 0.15

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      } catch {}
      scannerRef.current = null
      setIsScanning(false)
    }
  }

  const startScan = async () => {
    if (!activeDay) {
      toast.error('Please select a day before scanning')
      return
    }

    if (isScanning) return

    setResult(null)

    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (decodedText) => {
          await stopScanner()
          await markDelivered(decodedText)
        },
        () => {},
      )

      setIsScanning(true)
    } catch {
      toast.error('Camera permission denied')
    }
  }

  const markDelivered = async (regNum: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${DAY_API[activeDay!]}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regNum }),
        },
      )

      const json = await res.json()
      const attendee = json?.data || {}

      if (!res.ok) {
        throw new Error(json?.message || 'Scan failed')
      }

      if (json.success === true) {
        playBeep('success')
        navigator.vibrate?.(120)

        setResult({
          type: 'success',
          message: json.message,
          name: attendee.name || '-',
          mobile: attendee.mobile || '-',
          note: attendee.note || '-',
          regNum: attendee.regNum || regNum,
        })

        mutate()
      } else {
        playBeep('error')
        navigator.vibrate?.([80, 40, 80])

        setResult({
          type: 'error',
          message: json.message,
          name: attendee.name || '-',
          mobile: attendee.mobile || '-',
          note: attendee.note || '-',
          regNum: attendee.regNum || regNum,
        })
      }
    } catch (err: any) {
      toast.error(err?.message || 'Scan failed')
    }
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* ---------------- BANNER ---------------- */}
      <div className="relative w-full overflow-hidden">
        <Image
          src="https://res.cloudinary.com/dymanaa1j/image/upload/v1772339421/ChatGPT_Image_Mar_1_2026_09_57_48_AM_1_nqjcvh.png"
          alt="Wedding Banner"
          width={1536}
          height={380}
          priority
          sizes="100vw"
          className="w-full h-auto object-contain"
        />
        <div className="absolute inset-0 bg-orange-900/30" />
      </div>

      {/* ---------------- DAY SELECT ---------------- */}
      <div className="flex justify-center gap-3">
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

      {/* ---------------- RESULT OVERLAY ---------------- */}
      {result && (
        <div
          className={`relative mx-auto max-w-sm rounded-lg p-4 text-white space-y-2
      ${result.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
    `}
        >
          {/* Close Icon */}
          <button
            onClick={() => setResult(null)}
            className="absolute top-3 right-3 text-white/80 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2">
            {result.type === 'success' ? <CheckCircle2 /> : <XCircle />}
            <span className="font-bold text-base">{result.message}</span>
          </div>

          <div className="mt-4 rounded-xl border bg-muted/40 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Reg No</span>
              <span className="col-span-2 font-semibold">{result.regNum}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Name</span>
              <span className="col-span-2 font-semibold">{result.name}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Mobile</span>
              <span className="col-span-2 font-semibold">{result.mobile}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Note</span>
              <span className="col-span-2 font-semibold">{result.note}</span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SCANNER ---------------- */}
      <div className="mx-auto w-full max-w-sm">
        <div id="qr-reader" className="rounded-xl border overflow-hidden" />
      </div>

      {/* ---------------- ACTION ---------------- */}
      <div className="max-w-sm mx-auto">
        <Button
          onClick={startScan}
          disabled={isScanning}
          className="w-full bg-sky-800 hover:bg-sky-900"
        >
          {isScanning ? 'Scanning…' : 'Start Scan'}
        </Button>
      </div>
    </div>
  )
}
