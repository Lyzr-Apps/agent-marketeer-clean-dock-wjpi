'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { FiEdit3, FiCopy, FiDownload, FiRefreshCw, FiArrowLeft, FiSearch } from 'react-icons/fi'
import { HiOutlineSparkles, HiOutlineDocumentText, HiOutlineChartBar, HiOutlinePhotograph } from 'react-icons/hi'
import { IoCheckmarkCircle, IoWarning, IoInformationCircle, IoClose, IoAdd } from 'react-icons/io5'
import { BsStars, BsImage } from 'react-icons/bs'
import { MdHistory } from 'react-icons/md'
import { RiPaletteLine } from 'react-icons/ri'

// ---- CONSTANTS ----
const MARKETING_COORDINATOR_ID = '6993476350311a64b998bac5'
const GRAPHIC_DESIGNER_ID = '699347634451bf9cf4bb57a6'
const HISTORY_KEY = 'mcc_history'

// ---- TYPES ----
interface ContentData {
  title: string
  body: string
  meta_description: string
  word_count: number
  key_takeaways: string[]
  cta_text: string
  hashtags: string[]
}

interface OptimizationItem {
  item: string
  status: string
  priority: string
}

interface SeoData {
  overall_score: number
  meta_title: string
  meta_description: string
  primary_keywords: string[]
  secondary_keywords: string[]
  long_tail_keywords: string[]
  heading_structure: string[]
  keyword_density: string
  readability_score: number
  recommended_word_count: number
  optimization_checklist: OptimizationItem[]
  content_structure_suggestions: string[]
  internal_linking_suggestions: string[]
}

interface MarketingPackage {
  package_title: string
  channel_type: string
  content: ContentData
  seo_analysis: SeoData
  quality_notes: string
}

interface ImageAsset {
  file_url: string
  name?: string
  format_type?: string
}

interface ImageMeta {
  image_description: string
  design_notes: string
  suggested_usage: string
}

interface HistoryEntry {
  id: string
  timestamp: string
  brief: BriefData
  packageData: MarketingPackage
  images: ImageAsset[]
  imageMeta: ImageMeta | null
}

interface BriefData {
  channel: string
  topic: string
  audience: string
  keywords: string[]
  tone: string
  notes: string
}

// ---- SAMPLE DATA ----
const SAMPLE_BRIEF: BriefData = {
  channel: 'blog',
  topic: 'AI-Powered Content Marketing Strategies for 2025',
  audience: 'Digital marketing managers and CMOs at mid-size companies',
  keywords: ['AI content marketing', 'content strategy', 'marketing automation', 'AI tools'],
  tone: 'Professional',
  notes: 'Focus on practical, actionable strategies with ROI data. Include case studies if possible.',
}

const SAMPLE_PACKAGE: MarketingPackage = {
  package_title: 'AI-Powered Content Marketing Strategies for 2025',
  channel_type: 'blog',
  content: {
    title: 'The Complete Guide to AI-Powered Content Marketing in 2025',
    body: '## Introduction\n\nArtificial intelligence is no longer a futuristic concept in content marketing -- it is the foundation of modern strategy. In 2025, brands that leverage AI-driven content creation, distribution, and optimization are seeing **3x higher engagement rates** and **40% reduction in content production costs**.\n\n## Why AI Content Marketing Matters\n\nThe content landscape has shifted dramatically. With over **7.5 million blog posts** published daily, standing out requires more than just quality writing. AI tools help marketers:\n\n- **Analyze audience behavior** to create hyper-targeted content\n- **Optimize headlines and CTAs** using predictive analytics\n- **Scale content production** without sacrificing quality\n- **Personalize messaging** across channels in real time\n\n## Key Strategies for 2025\n\n### 1. Predictive Content Planning\n\nAI-powered tools analyze search trends, social signals, and competitor content to predict which topics will resonate. Companies using predictive planning report a **58% increase** in content ROI.\n\n### 2. Automated Content Optimization\n\nFrom meta descriptions to heading structures, AI can optimize every element of your content for maximum search visibility.\n\n### 3. Dynamic Personalization\n\nDeliver the right content to the right audience at the right time. AI enables real-time content adaptation based on user behavior, preferences, and intent.\n\n## Conclusion\n\nThe future of content marketing is intelligent, data-driven, and personalized. By adopting AI tools now, your brand can stay ahead of the curve and deliver exceptional content experiences.',
    meta_description: 'Discover the top AI-powered content marketing strategies for 2025. Learn how AI tools can boost engagement, reduce costs, and personalize your marketing.',
    word_count: 1250,
    key_takeaways: [
      'AI-driven brands see 3x higher engagement rates',
      'Predictive content planning increases ROI by 58%',
      'Automated optimization improves search visibility',
      'Dynamic personalization delivers real-time content adaptation',
      'Early AI adoption provides competitive advantage',
    ],
    cta_text: 'Download our free AI Content Marketing Toolkit',
    hashtags: ['#AIMarketing', '#ContentStrategy', '#MarTech', '#AIContent', '#DigitalMarketing'],
  },
  seo_analysis: {
    overall_score: 87,
    meta_title: 'AI-Powered Content Marketing Strategies for 2025 | Complete Guide',
    meta_description: 'Discover the top AI-powered content marketing strategies for 2025. Learn how AI tools can boost engagement, reduce costs, and personalize your marketing.',
    primary_keywords: ['AI content marketing', 'content marketing strategies', 'AI marketing 2025'],
    secondary_keywords: ['content optimization', 'marketing automation', 'predictive analytics'],
    long_tail_keywords: ['how to use AI in content marketing', 'AI tools for content marketers', 'best AI marketing strategies 2025'],
    heading_structure: ['H1: Complete Guide title', 'H2: Introduction', 'H2: Why AI Content Marketing Matters', 'H2: Key Strategies for 2025', 'H3: Predictive Content Planning', 'H3: Automated Content Optimization', 'H3: Dynamic Personalization', 'H2: Conclusion'],
    keyword_density: '2.3% primary, 1.5% secondary -- within optimal range',
    readability_score: 72,
    recommended_word_count: 1500,
    optimization_checklist: [
      { item: 'Primary keyword in title', status: 'pass', priority: 'high' },
      { item: 'Meta description under 160 chars', status: 'pass', priority: 'high' },
      { item: 'Heading hierarchy (H1-H3)', status: 'pass', priority: 'medium' },
      { item: 'Internal links included', status: 'warning', priority: 'medium' },
      { item: 'Image alt text optimized', status: 'info', priority: 'low' },
      { item: 'Schema markup ready', status: 'pass', priority: 'medium' },
    ],
    content_structure_suggestions: [
      'Add a table of contents for better navigation',
      'Include FAQ section for featured snippet opportunities',
      'Add data visualizations to support statistics',
    ],
    internal_linking_suggestions: [
      'Link to /blog/marketing-automation-guide',
      'Link to /resources/ai-tools-comparison',
      'Link to /case-studies/ai-content-roi',
    ],
  },
  quality_notes: 'Content aligns well with the creative brief. Strong use of statistics and actionable advice. SEO optimization is solid with room for improvement in internal linking. Recommend adding 250 more words to hit the ideal word count for competitive keywords.',
}

const SAMPLE_IMAGES: ImageAsset[] = [
  { file_url: 'https://placehold.co/800x450/f97316/fff?text=AI+Marketing+Hero', name: 'hero-image.png', format_type: 'png' },
  { file_url: 'https://placehold.co/600x600/ea580c/fff?text=Social+Graphic', name: 'social-graphic.png', format_type: 'png' },
]

const SAMPLE_IMAGE_META: ImageMeta = {
  image_description: 'A modern, gradient-rich hero image featuring abstract AI neural network patterns with warm sunset tones, overlaid with bold typography for the blog header.',
  design_notes: 'Used the brand color palette with warm oranges and ambers. The abstract AI visualization conveys technology while remaining approachable. Typography is clean and bold for readability at all sizes.',
  suggested_usage: 'Use the hero image as the blog featured image and Open Graph image. The social graphic is sized for LinkedIn and Twitter posts.',
}

// ---- HELPERS ----

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return (
            <h4 key={i} className="font-semibold text-sm mt-3 mb-1 text-foreground">
              {formatInline(line.slice(4))}
            </h4>
          )
        if (line.startsWith('## '))
          return (
            <h3 key={i} className="font-semibold text-base mt-3 mb-1 text-foreground">
              {formatInline(line.slice(3))}
            </h3>
          )
        if (line.startsWith('# '))
          return (
            <h2 key={i} className="font-bold text-lg mt-4 mb-2 text-foreground">
              {formatInline(line.slice(2))}
            </h2>
          )
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <li key={i} className="ml-4 list-disc text-sm text-foreground/80">
              {formatInline(line.slice(2))}
            </li>
          )
        if (/^\d+\.\s/.test(line))
          return (
            <li key={i} className="ml-4 list-decimal text-sm text-foreground/80">
              {formatInline(line.replace(/^\d+\.\s/, ''))}
            </li>
          )
        if (!line.trim()) return <div key={i} className="h-1" />
        return (
          <p key={i} className="text-sm text-foreground/80 leading-relaxed">
            {formatInline(line)}
          </p>
        )
      })}
    </div>
  )
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-500'
}

function getStatusIcon(status: string) {
  const s = status?.toLowerCase() ?? ''
  if (s === 'pass' || s === 'done' || s === 'complete') return <IoCheckmarkCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
  if (s === 'warning' || s === 'warn' || s === 'partial') return <IoWarning className="text-yellow-500 w-5 h-5 flex-shrink-0" />
  return <IoInformationCircle className="text-blue-500 w-5 h-5 flex-shrink-0" />
}

function getPriorityBadge(priority: string) {
  const p = priority?.toLowerCase() ?? ''
  if (p === 'high') return <Badge variant="destructive" className="text-xs">High</Badge>
  if (p === 'medium') return <Badge className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300">Med</Badge>
  return <Badge variant="secondary" className="text-xs">Low</Badge>
}

function parseAgentData(result: any): any {
  let data = result?.response?.result
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      // Not JSON
    }
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const key of Object.keys(data)) {
      if (typeof data[key] === 'string') {
        try {
          const parsed = JSON.parse(data[key])
          if (typeof parsed === 'object') data[key] = parsed
        } catch {
          // keep as string
        }
      }
    }
  }
  return data
}

// ---- COMPONENTS ----

function KeywordChipInput({ keywords, onChange }: { keywords: string[]; onChange: (kw: string[]) => void }) {
  const [inputVal, setInputVal] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputVal.trim()) {
      e.preventDefault()
      if (!keywords.includes(inputVal.trim())) {
        onChange([...keywords, inputVal.trim()])
      }
      setInputVal('')
    }
  }

  const remove = (idx: number) => {
    onChange(keywords.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, i) => (
          <Badge key={i} variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1 text-xs">
            {kw}
            <button type="button" onClick={() => remove(i)} className="ml-1 hover:bg-foreground/10 rounded-full p-0.5 transition-colors">
              <IoClose className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Type a keyword and press Enter"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (inputVal.trim() && !keywords.includes(inputVal.trim())) {
              onChange([...keywords, inputVal.trim()])
              setInputVal('')
            }
          }}
        >
          <IoAdd className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function ScoreCircle({ score, label, size = 'lg' }: { score: number; label: string; size?: 'sm' | 'lg' }) {
  const radius = size === 'lg' ? 42 : 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference
  const dim = size === 'lg' ? 100 : 68

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="transform -rotate-90">
          <circle cx={dim / 2} cy={dim / 2} r={radius} stroke="hsl(var(--muted))" strokeWidth={size === 'lg' ? 8 : 6} fill="none" />
          <circle cx={dim / 2} cy={dim / 2} r={radius} stroke={score >= 70 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#ef4444'} strokeWidth={size === 'lg' ? 8 : 6} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${size === 'lg' ? 'text-xl' : 'text-sm'} ${getScoreColor(score)}`}>{score}</span>
        </div>
      </div>
      <span className={`text-muted-foreground ${size === 'lg' ? 'text-xs' : 'text-[10px]'} font-medium`}>{label}</span>
    </div>
  )
}

function ContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}

function SeoSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

function AgentStatusPanel({ activeAgentId, loading }: { activeAgentId: string | null; loading: boolean }) {
  const agents = [
    { id: MARKETING_COORDINATOR_ID, name: 'Marketing Coordinator', role: 'Orchestrates content + SEO workflow', icon: <BsStars className="w-4 h-4" /> },
    { id: '6993473e50311a64b998babe', name: 'Content Writer', role: 'Generates marketing copy', icon: <HiOutlineDocumentText className="w-4 h-4" /> },
    { id: '6993473e34e9a83c77a88ad7', name: 'SEO Analyst', role: 'Analyzes and optimizes for search', icon: <HiOutlineChartBar className="w-4 h-4" /> },
    { id: GRAPHIC_DESIGNER_ID, name: 'Graphic Designer', role: 'Creates visual assets', icon: <RiPaletteLine className="w-4 h-4" /> },
  ]

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <HiOutlineSparkles className="w-4 h-4 text-primary" />
          Agent Status
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-1.5">
        {agents.map((agent) => {
          const isActive = loading && activeAgentId === agent.id
          const isManager = loading && activeAgentId === MARKETING_COORDINATOR_ID && (agent.id === '6993473e50311a64b998babe' || agent.id === '6993473e34e9a83c77a88ad7')
          return (
            <div key={agent.id} className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-colors ${isActive || isManager ? 'bg-primary/10' : ''}`}>
              <div className={`flex items-center justify-center w-6 h-6 rounded-md ${isActive || isManager ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {agent.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{agent.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
              </div>
              {(isActive || isManager) && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ---- MAIN PAGE ----

export default function Page() {
  // Navigation
  const [activeView, setActiveView] = useState<'brief' | 'results' | 'history'>('brief')

  // Sample data toggle
  const [showSample, setShowSample] = useState(false)

  // Brief form
  const [brief, setBrief] = useState<BriefData>({
    channel: 'blog',
    topic: '',
    audience: '',
    keywords: [],
    tone: 'Professional',
    notes: '',
  })

  // Results
  const [packageData, setPackageData] = useState<MarketingPackage | null>(null)
  const [images, setImages] = useState<ImageAsset[]>([])
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null)

  // Loading / status
  const [contentLoading, setContentLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // Editing mode
  const [isEditing, setIsEditing] = useState(false)
  const [editedBody, setEditedBody] = useState('')

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historySearch, setHistorySearch] = useState('')
  const [historyFilter, setHistoryFilter] = useState<string>('all')

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setHistory(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  // Save history
  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries)
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
    } catch {
      // ignore
    }
  }, [])

  // When sample toggle changes
  useEffect(() => {
    if (showSample) {
      setBrief(SAMPLE_BRIEF)
      setPackageData(SAMPLE_PACKAGE)
      setImages(SAMPLE_IMAGES)
      setImageMeta(SAMPLE_IMAGE_META)
    } else {
      setBrief({ channel: 'blog', topic: '', audience: '', keywords: [], tone: 'Professional', notes: '' })
      setPackageData(null)
      setImages([])
      setImageMeta(null)
    }
    setErrorMessage(null)
    setStatusMessage(null)
  }, [showSample])

  // Generate marketing package
  const handleGenerate = useCallback(async () => {
    if (!brief.topic.trim()) {
      setErrorMessage('Please enter a topic or campaign theme.')
      return
    }

    setContentLoading(true)
    setErrorMessage(null)
    setStatusMessage('Generating your marketing package...')
    setActiveAgentId(MARKETING_COORDINATOR_ID)
    setPackageData(null)
    setImages([])
    setImageMeta(null)

    const message = `Creative Brief:
Channel: ${brief.channel}
Topic: ${brief.topic}
Target Audience: ${brief.audience || 'General audience'}
Keywords: ${brief.keywords.length > 0 ? brief.keywords.join(', ') : 'None specified'}
Tone: ${brief.tone}
Additional Notes: ${brief.notes || 'None'}

Please generate a complete marketing package with optimized content and SEO analysis for this brief.`

    try {
      const result = await callAIAgent(message, MARKETING_COORDINATOR_ID)

      if (result.success) {
        const data = parseAgentData(result)
        if (data) {
          const pkg: MarketingPackage = {
            package_title: data?.package_title ?? brief.topic,
            channel_type: data?.channel_type ?? brief.channel,
            content: {
              title: data?.content?.title ?? '',
              body: data?.content?.body ?? '',
              meta_description: data?.content?.meta_description ?? '',
              word_count: data?.content?.word_count ?? 0,
              key_takeaways: Array.isArray(data?.content?.key_takeaways) ? data.content.key_takeaways : [],
              cta_text: data?.content?.cta_text ?? '',
              hashtags: Array.isArray(data?.content?.hashtags) ? data.content.hashtags : [],
            },
            seo_analysis: {
              overall_score: data?.seo_analysis?.overall_score ?? 0,
              meta_title: data?.seo_analysis?.meta_title ?? '',
              meta_description: data?.seo_analysis?.meta_description ?? '',
              primary_keywords: Array.isArray(data?.seo_analysis?.primary_keywords) ? data.seo_analysis.primary_keywords : [],
              secondary_keywords: Array.isArray(data?.seo_analysis?.secondary_keywords) ? data.seo_analysis.secondary_keywords : [],
              long_tail_keywords: Array.isArray(data?.seo_analysis?.long_tail_keywords) ? data.seo_analysis.long_tail_keywords : [],
              heading_structure: Array.isArray(data?.seo_analysis?.heading_structure) ? data.seo_analysis.heading_structure : [],
              keyword_density: data?.seo_analysis?.keyword_density ?? '',
              readability_score: data?.seo_analysis?.readability_score ?? 0,
              recommended_word_count: data?.seo_analysis?.recommended_word_count ?? 0,
              optimization_checklist: Array.isArray(data?.seo_analysis?.optimization_checklist) ? data.seo_analysis.optimization_checklist : [],
              content_structure_suggestions: Array.isArray(data?.seo_analysis?.content_structure_suggestions) ? data.seo_analysis.content_structure_suggestions : [],
              internal_linking_suggestions: Array.isArray(data?.seo_analysis?.internal_linking_suggestions) ? data.seo_analysis.internal_linking_suggestions : [],
            },
            quality_notes: data?.quality_notes ?? '',
          }
          setPackageData(pkg)
          setStatusMessage('Marketing package generated successfully!')
          setActiveView('results')

          // Save to history
          const entry: HistoryEntry = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            brief: { ...brief },
            packageData: pkg,
            images: [],
            imageMeta: null,
          }
          saveHistory([entry, ...history])
        } else {
          setErrorMessage('Received an unexpected response format. Please try again.')
        }
      } else {
        setErrorMessage(result.error ?? 'Failed to generate marketing package. Please try again.')
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setContentLoading(false)
      setActiveAgentId(null)
      setTimeout(() => setStatusMessage(null), 4000)
    }
  }, [brief, history, saveHistory])

  // Generate graphics
  const handleGenerateGraphics = useCallback(async () => {
    if (!packageData) return

    setImageLoading(true)
    setErrorMessage(null)
    setStatusMessage('Creating visual assets...')
    setActiveAgentId(GRAPHIC_DESIGNER_ID)

    const imagePrompt = `Create a professional marketing graphic for:
Title: ${packageData.content?.title ?? packageData.package_title}
Channel: ${packageData.channel_type}
Theme: ${brief.topic}
Tone: ${brief.tone}
Target Audience: ${brief.audience || 'General audience'}

The graphic should be a hero image suitable for a ${packageData.channel_type} post. Use warm, modern design with clean typography.`

    try {
      const result = await callAIAgent(imagePrompt, GRAPHIC_DESIGNER_ID)

      if (result.success) {
        const artifactFiles = result?.module_outputs?.artifact_files
        if (Array.isArray(artifactFiles) && artifactFiles.length > 0) {
          const newImages: ImageAsset[] = artifactFiles.map((f: any) => ({
            file_url: f?.file_url ?? '',
            name: f?.name ?? 'generated-image',
            format_type: f?.format_type ?? 'png',
          })).filter((img: ImageAsset) => img.file_url)
          setImages(newImages)

          // Update history with images
          if (history.length > 0) {
            const updated = [...history]
            updated[0] = { ...updated[0], images: newImages }
            saveHistory(updated)
          }
        }

        let textData = parseAgentData(result)
        if (textData) {
          const meta: ImageMeta = {
            image_description: textData?.image_description ?? '',
            design_notes: textData?.design_notes ?? '',
            suggested_usage: textData?.suggested_usage ?? '',
          }
          setImageMeta(meta)

          if (history.length > 0) {
            const updated = [...history]
            updated[0] = { ...updated[0], imageMeta: meta }
            saveHistory(updated)
          }
        }

        setStatusMessage('Visual assets generated!')
      } else {
        setErrorMessage(result.error ?? 'Failed to generate graphics. Please try again.')
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred generating graphics.')
    } finally {
      setImageLoading(false)
      setActiveAgentId(null)
      setTimeout(() => setStatusMessage(null), 4000)
    }
  }, [packageData, brief, history, saveHistory])

  // Copy content
  const handleCopy = useCallback(async () => {
    if (!packageData) return
    const text = `${packageData.content?.title ?? ''}\n\n${packageData.content?.body ?? ''}\n\nCTA: ${packageData.content?.cta_text ?? ''}`
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      // fallback
    }
  }, [packageData])

  // Download content as text
  const handleDownloadText = useCallback(() => {
    if (!packageData) return
    const text = `${packageData.content?.title ?? ''}\n\n${packageData.content?.body ?? ''}\n\nMeta Description: ${packageData.content?.meta_description ?? ''}\n\nCTA: ${packageData.content?.cta_text ?? ''}\n\nHashtags: ${(Array.isArray(packageData.content?.hashtags) ? packageData.content.hashtags : []).join(' ')}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(packageData.package_title ?? 'marketing-content').replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [packageData])

  // Load from history
  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setBrief(entry.brief)
    setPackageData(entry.packageData)
    setImages(Array.isArray(entry.images) ? entry.images : [])
    setImageMeta(entry.imageMeta ?? null)
    setActiveView('results')
    setErrorMessage(null)
    setStatusMessage(null)
  }, [])

  // Delete from history
  const deleteFromHistory = useCallback((id: string) => {
    const updated = history.filter((e) => e.id !== id)
    saveHistory(updated)
  }, [history, saveHistory])

  // Filtered history
  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const matchSearch = !historySearch || (entry.packageData?.package_title ?? '').toLowerCase().includes(historySearch.toLowerCase()) || (entry.brief?.topic ?? '').toLowerCase().includes(historySearch.toLowerCase())
      const matchFilter = historyFilter === 'all' || (entry.packageData?.channel_type ?? '') === historyFilter
      return matchSearch && matchFilter
    })
  }, [history, historySearch, historyFilter])

  // Channel options
  const channels = [
    { value: 'blog', label: 'Blog' },
    { value: 'social', label: 'Social Media' },
    { value: 'email', label: 'Email' },
  ]

  const tones = ['Professional', 'Casual', 'Persuasive', 'Educational', 'Witty']

  // Sidebar items
  const navItems = [
    { id: 'brief' as const, label: 'Creative Brief', icon: <FiEdit3 className="w-5 h-5" /> },
    { id: 'results' as const, label: 'Results', icon: <HiOutlineDocumentText className="w-5 h-5" /> },
    { id: 'history' as const, label: 'History', icon: <MdHistory className="w-5 h-5" /> },
  ]

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ backgroundImage: 'linear-gradient(135deg, hsl(30 50% 97%) 0%, hsl(20 45% 95%) 35%, hsl(40 40% 96%) 70%, hsl(15 35% 97%) 100%)' }}>
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-card/80 backdrop-blur-md border-r border-border flex flex-col">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <HiOutlineSparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight leading-tight">Marketing</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">Command Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeView === item.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'text-foreground/70 hover:bg-muted hover:text-foreground'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sample data toggle */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer">Sample Data</Label>
            <Switch id="sample-toggle" checked={showSample} onCheckedChange={setShowSample} />
          </div>
        </div>

        {/* Agent status */}
        <div className="p-3 border-t border-border">
          <AgentStatusPanel activeAgentId={activeAgentId} loading={contentLoading || imageLoading} />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Status / Error bar */}
        {(statusMessage || errorMessage) && (
          <div className={`px-6 py-2.5 text-sm font-medium flex items-center gap-2 ${errorMessage ? 'bg-destructive/10 text-destructive border-b border-destructive/20' : 'bg-primary/10 text-primary border-b border-primary/20'}`}>
            {errorMessage ? <IoWarning className="w-4 h-4 flex-shrink-0" /> : <IoCheckmarkCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{errorMessage ?? statusMessage}</span>
            <button onClick={() => { setErrorMessage(null); setStatusMessage(null) }} className="ml-auto hover:opacity-70 transition-opacity">
              <IoClose className="w-4 h-4" />
            </button>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-6 max-w-7xl mx-auto">
            {/* ============ BRIEF VIEW ============ */}
            {activeView === 'brief' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">Creative Brief</h2>
                  <p className="text-sm text-muted-foreground">Define your marketing campaign details. Our AI agents will create optimized content, SEO analysis, and visual assets.</p>
                </div>

                <Card className="bg-card/80 backdrop-blur-sm border-border shadow-md">
                  <CardContent className="pt-6 space-y-5">
                    {/* Channel selector */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Channel</Label>
                      <div className="flex gap-2">
                        {channels.map((ch) => (
                          <button
                            key={ch.value}
                            onClick={() => setBrief((prev) => ({ ...prev, channel: ch.value }))}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${brief.channel === ch.value ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                          >
                            {ch.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Topic */}
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-sm font-medium">Topic / Campaign Theme *</Label>
                      <Input
                        id="topic"
                        placeholder="Enter your topic or campaign theme"
                        value={brief.topic}
                        onChange={(e) => setBrief((prev) => ({ ...prev, topic: e.target.value }))}
                        className="bg-background/50"
                      />
                    </div>

                    {/* Target Audience */}
                    <div className="space-y-2">
                      <Label htmlFor="audience" className="text-sm font-medium">Target Audience</Label>
                      <Input
                        id="audience"
                        placeholder="e.g., Digital marketing managers at mid-size companies"
                        value={brief.audience}
                        onChange={(e) => setBrief((prev) => ({ ...prev, audience: e.target.value }))}
                        className="bg-background/50"
                      />
                    </div>

                    {/* Keywords */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Keywords</Label>
                      <KeywordChipInput
                        keywords={brief.keywords}
                        onChange={(kw) => setBrief((prev) => ({ ...prev, keywords: kw }))}
                      />
                    </div>

                    {/* Tone */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tone</Label>
                      <Select value={brief.tone} onValueChange={(v) => setBrief((prev) => ({ ...prev, tone: v }))}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tones.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium">Additional Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any specific instructions, reference materials, or constraints..."
                        value={brief.notes}
                        onChange={(e) => setBrief((prev) => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="bg-background/50"
                      />
                    </div>

                    {/* Generate button */}
                    <Button
                      onClick={handleGenerate}
                      disabled={contentLoading || !brief.topic.trim()}
                      className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                    >
                      {contentLoading ? (
                        <span className="flex items-center gap-2">
                          <FiRefreshCw className="w-5 h-5 animate-spin" />
                          Generating Marketing Package...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <BsStars className="w-5 h-5" />
                          Generate Marketing Package
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ============ RESULTS VIEW ============ */}
            {activeView === 'results' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveView('brief')} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <FiArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">{packageData?.package_title ?? 'Results'}</h2>
                      <p className="text-sm text-muted-foreground">Content preview, SEO analysis, and visual assets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setActiveView('brief'); handleGenerate() }} disabled={contentLoading}>
                      <FiRefreshCw className={`w-4 h-4 mr-1.5 ${contentLoading ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadText} disabled={!packageData}>
                      <FiDownload className="w-4 h-4 mr-1.5" />
                      Download
                    </Button>
                  </div>
                </div>

                {contentLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <Card className="lg:col-span-3 bg-card/80 backdrop-blur-sm border-border shadow-md">
                      <CardContent className="pt-6"><ContentSkeleton /></CardContent>
                    </Card>
                    <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border shadow-md">
                      <CardContent className="pt-6"><SeoSkeleton /></CardContent>
                    </Card>
                  </div>
                ) : packageData ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      {/* Content Preview - 60% */}
                      <Card className="lg:col-span-3 bg-card/80 backdrop-blur-sm border-border shadow-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">{packageData.channel_type?.toUpperCase() ?? 'CONTENT'}</Badge>
                              <span className="text-xs text-muted-foreground">{packageData.content?.word_count ?? 0} words</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button variant="ghost" size="sm" onClick={() => { setIsEditing(!isEditing); if (!isEditing) setEditedBody(packageData.content?.body ?? '') }}>
                                <FiEdit3 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={handleCopy}>
                                <FiCopy className="w-4 h-4" />
                                {copySuccess && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-xl leading-tight mt-2">{packageData.content?.title ?? ''}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                          {/* Content body */}
                          {isEditing ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editedBody}
                                onChange={(e) => setEditedBody(e.target.value)}
                                rows={16}
                                className="font-mono text-sm bg-background/50"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => { setPackageData({ ...packageData, content: { ...packageData.content, body: editedBody } }); setIsEditing(false) }}>
                                  Save Changes
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="prose-sm">{renderMarkdown(packageData.content?.body ?? '')}</div>
                          )}

                          <Separator />

                          {/* Meta description */}
                          {packageData.content?.meta_description && (
                            <div className="space-y-1.5">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meta Description</h4>
                              <p className="text-sm text-foreground/70 bg-muted/50 rounded-lg p-3">{packageData.content.meta_description}</p>
                            </div>
                          )}

                          {/* Key Takeaways */}
                          {Array.isArray(packageData.content?.key_takeaways) && packageData.content.key_takeaways.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Takeaways</h4>
                              <ul className="space-y-1.5">
                                {packageData.content.key_takeaways.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <IoCheckmarkCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* CTA */}
                          {packageData.content?.cta_text && (
                            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Call to Action</h4>
                              <p className="text-sm font-medium text-primary">{packageData.content.cta_text}</p>
                            </div>
                          )}

                          {/* Hashtags */}
                          {Array.isArray(packageData.content?.hashtags) && packageData.content.hashtags.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hashtags</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {packageData.content.hashtags.map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs font-normal">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quality Notes */}
                          {packageData.quality_notes && (
                            <div className="space-y-1.5">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quality Assessment</h4>
                              <div className="text-sm text-foreground/70 bg-muted/50 rounded-lg p-3">
                                {renderMarkdown(packageData.quality_notes)}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* SEO Scorecard - 40% */}
                      <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border shadow-md">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <HiOutlineChartBar className="w-5 h-5 text-primary" />
                            SEO Scorecard
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                              <TabsTrigger value="keywords" className="text-xs">Keywords</TabsTrigger>
                              <TabsTrigger value="checklist" className="text-xs">Checklist</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-5">
                              {/* Score circles */}
                              <div className="flex justify-center gap-8">
                                <ScoreCircle score={packageData.seo_analysis?.overall_score ?? 0} label="SEO Score" />
                                <ScoreCircle score={packageData.seo_analysis?.readability_score ?? 0} label="Readability" />
                              </div>

                              {/* Meta title */}
                              {packageData.seo_analysis?.meta_title && (
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Meta Title</h4>
                                  <p className="text-sm bg-muted/50 rounded-lg p-2.5">{packageData.seo_analysis.meta_title}</p>
                                </div>
                              )}

                              {/* Meta description */}
                              {packageData.seo_analysis?.meta_description && (
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Meta Description</h4>
                                  <p className="text-sm bg-muted/50 rounded-lg p-2.5">{packageData.seo_analysis.meta_description}</p>
                                </div>
                              )}

                              {/* Keyword density */}
                              {packageData.seo_analysis?.keyword_density && (
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keyword Density</h4>
                                  <p className="text-sm text-foreground/70">{packageData.seo_analysis.keyword_density}</p>
                                </div>
                              )}

                              {/* Recommended word count */}
                              {(packageData.seo_analysis?.recommended_word_count ?? 0) > 0 && (
                                <div className="space-y-1.5">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Word Count</h4>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm">{packageData.content?.word_count ?? 0} / {packageData.seo_analysis.recommended_word_count} recommended</span>
                                  </div>
                                  <Progress value={Math.min(((packageData.content?.word_count ?? 0) / packageData.seo_analysis.recommended_word_count) * 100, 100)} className="h-2" />
                                </div>
                              )}

                              {/* Heading Structure */}
                              {Array.isArray(packageData.seo_analysis?.heading_structure) && packageData.seo_analysis.heading_structure.length > 0 && (
                                <div className="space-y-1.5">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Heading Structure</h4>
                                  <ul className="space-y-1">
                                    {packageData.seo_analysis.heading_structure.map((h, i) => (
                                      <li key={i} className="text-xs text-foreground/70 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                                        {h}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Content structure suggestions */}
                              {Array.isArray(packageData.seo_analysis?.content_structure_suggestions) && packageData.seo_analysis.content_structure_suggestions.length > 0 && (
                                <div className="space-y-1.5">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Structure Suggestions</h4>
                                  <ul className="space-y-1">
                                    {packageData.seo_analysis.content_structure_suggestions.map((s, i) => (
                                      <li key={i} className="text-xs text-foreground/70 flex items-start gap-1.5">
                                        <IoInformationCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                                        {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Internal linking suggestions */}
                              {Array.isArray(packageData.seo_analysis?.internal_linking_suggestions) && packageData.seo_analysis.internal_linking_suggestions.length > 0 && (
                                <div className="space-y-1.5">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Linking Suggestions</h4>
                                  <ul className="space-y-1">
                                    {packageData.seo_analysis.internal_linking_suggestions.map((l, i) => (
                                      <li key={i} className="text-xs text-foreground/70 flex items-start gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                        {l}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="keywords" className="space-y-4">
                              {/* Primary */}
                              {Array.isArray(packageData.seo_analysis?.primary_keywords) && packageData.seo_analysis.primary_keywords.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Keywords</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {packageData.seo_analysis.primary_keywords.map((kw, i) => (
                                      <Badge key={i} className="bg-primary/10 text-primary border-primary/20 text-xs hover:bg-primary/15">{kw}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Secondary */}
                              {Array.isArray(packageData.seo_analysis?.secondary_keywords) && packageData.seo_analysis.secondary_keywords.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Secondary Keywords</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {packageData.seo_analysis.secondary_keywords.map((kw, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Long tail */}
                              {Array.isArray(packageData.seo_analysis?.long_tail_keywords) && packageData.seo_analysis.long_tail_keywords.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Long-tail Keywords</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {packageData.seo_analysis.long_tail_keywords.map((kw, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs font-normal">{kw}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="checklist" className="space-y-3">
                              {Array.isArray(packageData.seo_analysis?.optimization_checklist) && packageData.seo_analysis.optimization_checklist.length > 0 ? (
                                packageData.seo_analysis.optimization_checklist.map((item, i) => (
                                  <div key={i} className="flex items-center gap-3 py-2 px-3 bg-muted/30 rounded-lg">
                                    {getStatusIcon(item?.status ?? '')}
                                    <span className="text-sm flex-1">{item?.item ?? ''}</span>
                                    {getPriorityBadge(item?.priority ?? '')}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No checklist items available.</p>
                              )}
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Graphics Section */}
                    <Card className="bg-card/80 backdrop-blur-sm border-border shadow-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <HiOutlinePhotograph className="w-5 h-5 text-primary" />
                          Visual Assets
                        </CardTitle>
                        <CardDescription>Generate supporting graphics for your marketing content.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {images.length === 0 && !imageLoading ? (
                          <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                              <BsImage className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">No graphics generated yet</p>
                              <p className="text-xs text-muted-foreground mt-1">Click below to create visual assets matched to your content.</p>
                            </div>
                            <Button onClick={handleGenerateGraphics} disabled={imageLoading} className="shadow-md shadow-primary/20">
                              <RiPaletteLine className="w-4 h-4 mr-2" />
                              Generate Graphics
                            </Button>
                          </div>
                        ) : imageLoading ? (
                          <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                              <FiRefreshCw className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <p className="text-sm font-medium">Creating visual assets...</p>
                            <p className="text-xs text-muted-foreground">This may take a moment.</p>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {/* Image grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {images.map((img, i) => (
                                <div key={i} className="group rounded-xl overflow-hidden border border-border bg-muted/30">
                                  <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                                    {img.file_url ? (
                                      <img src={img.file_url} alt={img.name ?? `Generated image ${i + 1}`} className="w-full h-full object-cover" />
                                    ) : (
                                      <BsImage className="w-12 h-12 text-muted-foreground/30" />
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      {img.file_url && (
                                        <a href={img.file_url} target="_blank" rel="noopener noreferrer" className="bg-white/90 text-foreground px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-white transition-colors">
                                          <FiDownload className="w-3.5 h-3.5" />
                                          Download
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="p-3">
                                    <p className="text-xs font-medium truncate">{img.name ?? `Image ${i + 1}`}</p>
                                    {img.format_type && <p className="text-[10px] text-muted-foreground uppercase">{img.format_type}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Image meta */}
                            {imageMeta && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {imageMeta.image_description && (
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</h4>
                                    <p className="text-sm text-foreground/70">{imageMeta.image_description}</p>
                                  </div>
                                )}
                                {imageMeta.design_notes && (
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Design Notes</h4>
                                    <p className="text-sm text-foreground/70">{imageMeta.design_notes}</p>
                                  </div>
                                )}
                                {imageMeta.suggested_usage && (
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Usage</h4>
                                    <p className="text-sm text-foreground/70">{imageMeta.suggested_usage}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Regenerate button */}
                            <div className="flex justify-center pt-2">
                              <Button variant="outline" size="sm" onClick={handleGenerateGraphics} disabled={imageLoading}>
                                <FiRefreshCw className="w-4 h-4 mr-1.5" />
                                Regenerate Graphics
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                      <HiOutlineDocumentText className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">No results yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Fill out the creative brief and generate your marketing package.</p>
                    </div>
                    <Button onClick={() => setActiveView('brief')} variant="outline">
                      <FiArrowLeft className="w-4 h-4 mr-2" />
                      Go to Creative Brief
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ============ HISTORY VIEW ============ */}
            {activeView === 'history' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">History</h2>
                  <p className="text-sm text-muted-foreground">Browse and reload past marketing packages.</p>
                </div>

                {/* Search + filter */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search packages..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="pl-9 bg-card/80"
                    />
                  </div>
                  <Select value={historyFilter} onValueChange={setHistoryFilter}>
                    <SelectTrigger className="w-[140px] bg-card/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* History list */}
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                      <MdHistory className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">{history.length === 0 ? 'No packages yet' : 'No matches found'}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {history.length === 0 ? 'Create your first marketing package to see it here.' : 'Try adjusting your search or filter.'}
                      </p>
                    </div>
                    {history.length === 0 && (
                      <Button onClick={() => setActiveView('brief')} variant="outline">
                        <FiEdit3 className="w-4 h-4 mr-2" />
                        Create Your First Package
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredHistory.map((entry) => {
                      const entryDate = entry.timestamp ? new Date(entry.timestamp) : null
                      const dateStr = entryDate ? entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
                      const timeStr = entryDate ? entryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''

                      return (
                        <Card key={entry.id} className="bg-card/80 backdrop-blur-sm border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => loadFromHistory(entry)}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] flex-shrink-0">{(entry.packageData?.channel_type ?? 'content').toUpperCase()}</Badge>
                                  {(entry.packageData?.seo_analysis?.overall_score ?? 0) > 0 && (
                                    <div className={`flex items-center gap-1 text-xs font-medium ${getScoreColor(entry.packageData.seo_analysis.overall_score)}`}>
                                      <HiOutlineChartBar className="w-3 h-3" />
                                      {entry.packageData.seo_analysis.overall_score}
                                    </div>
                                  )}
                                </div>
                                <h3 className="text-sm font-medium leading-snug truncate">{entry.packageData?.package_title ?? entry.brief?.topic ?? 'Untitled'}</h3>
                                <p className="text-[11px] text-muted-foreground">{dateStr} {timeStr}</p>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteFromHistory(entry.id) }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 transition-all"
                              >
                                <IoClose className="w-4 h-4 text-destructive" />
                              </button>
                            </div>
                            {Array.isArray(entry.images) && entry.images.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <BsImage className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">{entry.images.length} image{entry.images.length > 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
