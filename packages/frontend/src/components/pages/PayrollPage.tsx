'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Download, Calendar, DollarSign, TrendingUp, FileText, ChevronLeft, ChevronRight, Bot, Sparkles } from 'lucide-react'

type MonthKey = `${number}-${number}` // e.g. 2025-10

const months = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
]

const formatCurrency = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function PayrollPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>(`${now.getFullYear()}-${now.getMonth()+1}`)
  const [simBonus, setSimBonus] = useState(0)
  const [simInvest, setSimInvest] = useState(0)

  const data = useMemo(() => {
    // Mocked per-month data; in real app this comes from API
    const base = 6800
    const allowances = 1200
    const tax = Math.max(0, Math.round((base + allowances + simBonus - simInvest * 0.2) * 0.18))
    const pf = 400
    const other = 150
    const gross = base + allowances + simBonus
    const deductions = tax + pf + other - Math.min(0, simInvest) // prevent negative
    const net = gross - deductions
    return { base, allowances, tax, pf, other, gross, deductions, net }
  }, [selectedMonth, simBonus, simInvest])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll</h1>
          <p className="text-gray-600 dark:text-gray-400">Accurate, automated and compliant payroll</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-lg bg-white/10 dark:bg-white/10 text-gray-700 dark:text-white border border-white/20 hover:bg-white/20 backdrop-blur">
            <Calendar className="w-4 h-4 inline mr-2" />
            {months[Number(selectedMonth.split('-')[1]) - 1]} {selectedMonth.split('-')[0]}
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
            <CreditCard className="w-4 h-4" />
            <span>Process Payroll</span>
          </button>
        </div>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Summary + Chart + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Month Summary */}
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current cycle</p>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{months[Number(selectedMonth.split('-')[1]) - 1]} {selectedMonth.split('-')[0]}</h2>
              </div>
              <div className="flex gap-6">
                <Stat label="Gross" value={data.gross} tone="emerald" />
                <Stat label="Deductions" value={data.deductions} tone="rose" />
                <Stat label="Net Pay" value={data.net} tone="cyan" />
              </div>
            </div>
          </div>

          {/* Visual Salary Breakdown */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Salary Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DonutChart
                segments={[
                  { label: 'Base Pay', value: data.base, color: 'fill-emerald-500' },
                  { label: 'Allowances', value: data.allowances, color: 'fill-sky-500' },
                  { label: 'Tax', value: data.tax, color: 'fill-rose-500' },
                  { label: 'Provident Fund', value: data.pf, color: 'fill-indigo-500' },
                  { label: 'Other', value: data.other, color: 'fill-amber-500' },
                ]}
                centerLabel="Net"
                centerValue={data.net}
              />

              {/* Hover-to-learn details */}
              <div className="space-y-3">
                <HoverRow label="Base Pay" value={data.base} info="Fixed monthly component based on your CTC."/>
                <HoverRow label="Allowances" value={data.allowances} info="Benefits like HRA, transport, meal cards, etc."/>
                <HoverRow label="Tax (TDS)" value={data.tax} info="Tax deducted based on your taxable income and declarations."/>
                <HoverRow label="Provident Fund" value={data.pf} info="Your and employer's contribution to long-term savings."/>
                <HoverRow label="Other Deductions" value={data.other} info="Professional tax, insurance, or company recoveries."/>
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <HoverRow label="Net Take-home" value={data.net} info="Amount credited to your bank account this cycle." emphasis/>
                </div>
              </div>
            </div>
          </div>

          {/* Historical timeline selector */}
          <div className="card p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">History</h3>
              <div className="flex items-center gap-2">
                <button className="icon-btn" onClick={() => shiftMonth(-1)}><ChevronLeft className="w-4 h-4"/></button>
                <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 backdrop-blur text-gray-800 dark:text-white">
                  {months[Number(selectedMonth.split('-')[1]) - 1]} {selectedMonth.split('-')[0]}
                </span>
                <button className="icon-btn" onClick={() => shiftMonth(1)}><ChevronRight className="w-4 h-4"/></button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Quickly browse previous payslips. Selecting a month updates the view.</p>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <button className="w-full justify-between btn-glass">
              <span className="flex items-center gap-2"><Download className="w-4 h-4"/>Download Payslip (PDF)</span>
              <span className="text-xs text-white/70">Password-protected</span>
            </button>
            <button className="w-full btn-glass"><FileText className="w-4 h-4 mr-2"/>Declare Taxes (IT)</button>
            <button className="w-full btn-glass"><Sparkles className="w-4 h-4 mr-2"/>Salary & Tax Simulator</button>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">What‑If Simulator</h3>
            <div className="space-y-3">
              <LabeledInput label="Hypothetical Bonus" value={simBonus} onChange={setSimBonus}/>
              <LabeledInput label="Investments (80C/80D)" value={simInvest} onChange={setSimInvest}/>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Impact: Net becomes <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.net)}</span></div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Payroll Buddy</h3>
              <Bot className="w-5 h-5 text-primary-500"/>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Ask about your payslips, components, or policies.</p>
            <button className="mt-4 w-full btn-glass">Open Assistant</button>
          </div>
        </div>
      </div>

      {/* Admin Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guided Payroll Run</h3>
          <ol className="space-y-3">
            <WorkflowStep n={1} title="Sync Data" desc="Pull attendance and leave data, auto-flag gaps." actionLabel="Sync now"/>
            <WorkflowStep n={2} title="Process Inputs" desc="Add one-time earnings or deductions." actionLabel="Add items"/>
            <WorkflowStep n={3} title="Validate with AI" desc="Detect anomalies before processing." actionLabel="Run validation" highlight/>
            <WorkflowStep n={4} title="Finalize & Process" desc="Generate payslips and complete run." actionLabel="Run payroll"/>
          </ol>
          <div className="mt-6 rounded-xl border border-white/20 bg-white/10 backdrop-blur p-4 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium mb-2">AI Anomaly Detection</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Alert: John Doe's overtime pay is 300% higher than average. Confirm?</li>
              <li>Warning: Jane Smith is marked as resigned but included in this run.</li>
              <li>Flag: Employee ID #123 has no attendance data this month.</li>
            </ul>
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reports & Compliance</h3>
          <button className="w-full btn-glass">Salary Register</button>
          <button className="w-full btn-glass">Bank Transfer File</button>
          <button className="w-full btn-glass">PF/ESI/TDS Reports</button>
        </div>
      </div>
    </div>
  )

  function shiftMonth(delta: number) {
    const [y, m] = selectedMonth.split('-').map(Number)
    const date = new Date(y, m - 1 + delta, 1)
    setSelectedMonth(`${date.getFullYear()}-${date.getMonth() + 1}` as MonthKey)
  }
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'emerald'|'rose'|'cyan' }) {
  const color = tone === 'emerald' ? 'text-emerald-500 bg-emerald-500/10' : tone === 'rose' ? 'text-rose-500 bg-rose-500/10' : 'text-cyan-500 bg-cyan-500/10'
  return (
    <div className="flex items-center gap-3">
      <div className={`h-8 w-8 rounded-lg ${color}`}></div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(value)}</p>
      </div>
    </div>
  )
}

function DonutChart({ segments, centerLabel, centerValue }: { segments: { label: string; value: number; color: string }[]; centerLabel: string; centerValue: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  let cumulative = 0
  const arcs = segments.map((s) => {
    const start = (cumulative / total) * 2 * Math.PI
    cumulative += s.value
    const end = (cumulative / total) * 2 * Math.PI
    const large = end - start > Math.PI ? 1 : 0
    const r = 70
    const cx = 80, cy = 80
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end)
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
    return { d, color: s.color, label: s.label, value: s.value }
  })
  return (
    <div className="flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow">
        {arcs.map((a, i) => (
          <path key={i} d={a.d} className={a.color} opacity={0.9} />
        ))}
        <circle cx="80" cy="80" r="45" className="fill-white/80 dark:fill-gray-900/80 backdrop-blur" />
        <text x="80" y="75" textAnchor="middle" className="fill-gray-700 dark:fill-white text-xs">{centerLabel}</text>
        <text x="80" y="95" textAnchor="middle" className="fill-gray-900 dark:fill-white text-sm font-semibold">{formatCurrency(centerValue)}</text>
      </svg>
    </div>
  )
}

function HoverRow({ label, value, info, emphasis }: { label: string; value: number; info: string; emphasis?: boolean }) {
  return (
    <div className={`group flex items-center justify-between p-3 rounded-xl border ${emphasis ? 'border-emerald-400/50' : 'border-white/20'} bg-white/10 hover:bg-white/20 backdrop-blur transition-colors`}>
      <div className="text-gray-800 dark:text-white font-medium">{label}</div>
      <div className={`text-gray-900 dark:text-white ${emphasis ? 'font-bold' : 'font-semibold'}`}>{formatCurrency(value)}</div>
      <div className="pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity">
        {/* reserved for future portal */}
      </div>
      <div className="hidden group-hover:block absolute translate-y-10 right-0 z-10">
        <div className="max-w-xs text-xs p-3 rounded-lg bg-gray-900 text-white shadow-lg">{info}</div>
      </div>
    </div>
  )
}

function LabeledInput({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value || 0))} className="mt-1 w-full px-3 py-2 rounded-xl border border-white/40 bg-white/15 backdrop-blur text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-teal-400" placeholder="0"/>
    </label>
  )
}

function WorkflowStep({ n, title, desc, actionLabel, highlight }: { n: number; title: string; desc: string; actionLabel: string; highlight?: boolean }) {
  return (
    <li className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${highlight ? 'border-cyan-400/50 bg-cyan-400/5' : 'border-white/20 bg-white/10'} backdrop-blur`}>
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-sm font-semibold text-gray-900 dark:text-white">{n}</div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
        </div>
      </div>
      <button className="btn-glass whitespace-nowrap">{actionLabel}</button>
    </li>
  )
}
