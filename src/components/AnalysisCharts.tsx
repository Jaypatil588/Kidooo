import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import { Radar, Bar } from 'react-chartjs-2'
import type { AnalysisScores } from '../types'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
)

const SCORE_LABELS: Record<keyof AnalysisScores, string> = {
  communication: 'Communication',
  eyeContact: 'Eye Contact',
  socialEngagement: 'Social Engagement',
  gestures: 'Gestures',
  speechClarity: 'Speech Clarity',
  emotionalResponse: 'Emotional Response',
}

const SCORE_KEYS = Object.keys(SCORE_LABELS) as (keyof AnalysisScores)[]

function getBarColor(score: number): string {
  if (score >= 7) return 'rgba(34, 197, 94, 0.7)'
  if (score >= 4) return 'rgba(251, 191, 36, 0.7)'
  return 'rgba(239, 68, 68, 0.7)'
}

function getBarBorder(score: number): string {
  if (score >= 7) return 'rgba(34, 197, 94, 1)'
  if (score >= 4) return 'rgba(251, 191, 36, 1)'
  return 'rgba(239, 68, 68, 1)'
}

interface AnalysisChartsProps {
  scores: AnalysisScores
  compact?: boolean
}

export default function AnalysisCharts({ scores, compact = false }: AnalysisChartsProps) {
  const labels = SCORE_KEYS.map((k) => SCORE_LABELS[k])
  const values = SCORE_KEYS.map((k) => scores[k])
  const radarData = {
    labels,
    datasets: [
      {
        label: 'Child',
        data: values,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(245, 158, 11, 1)',
        pointRadius: compact ? 2 : 3,
      },
      {
        label: 'Typical',
        data: Array(6).fill(10),
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
      },
    ],
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: !compact, position: 'bottom' as const, labels: { font: { size: 10 } } },
    },
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: { stepSize: 2, font: { size: compact ? 8 : 9 }, display: !compact },
        pointLabels: { font: { size: compact ? 8 : 10 } },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
    },
  }

  if (compact) {
    return (
      <div className="w-full max-w-[200px] mx-auto">
        <Radar data={radarData} options={radarOptions} />
      </div>
    )
  }

  const barData = {
    labels,
    datasets: [
      {
        label: 'Score',
        data: values,
        backgroundColor: values.map(getBarColor),
        borderColor: values.map(getBarBorder),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { min: 0, max: 10, ticks: { stepSize: 2, font: { size: 10 } } },
      x: { ticks: { font: { size: 9 }, maxRotation: 45 } },
    },
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold text-neutral-700 mb-2">Developmental Profile</p>
        <div className="bg-white rounded-xl p-3 border border-neutral-100">
          <Radar data={radarData} options={radarOptions} />
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-neutral-700 mb-2">Score Breakdown</p>
        <div className="bg-white rounded-xl p-3 border border-neutral-100">
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="flex items-center gap-3 mt-2 justify-center">
          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Typical (7-10)
          </span>
          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Mild concern (4-6)
          </span>
          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Significant (1-3)
          </span>
        </div>
      </div>
    </div>
  )
}

export function MiniRadarChart({ scores }: { scores: AnalysisScores }) {
  return <AnalysisCharts scores={scores} compact />
}
