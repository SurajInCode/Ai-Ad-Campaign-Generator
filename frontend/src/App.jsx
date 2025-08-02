import { useEffect, useState } from 'react'

const GITHUB_URL = 'https://github.com/SurajInCode'

const DEMO_EXAMPLE = {
  productName: 'HydroVault Pro 32',
  productDescription:
    'Premium double-wall vacuum insulated stainless steel water bottle. Keeps drinks ice-cold for 48 hours and hot for 12 hours. Leak-proof sport lid, sweat-proof matte finish, BPA-free, fits standard cup holders. Available in midnight black and ocean blue. Perfect for gym, office, and outdoor adventures.',
  targetAudience: 'Health-conscious millennials and Gen Z fitness enthusiasts aged 22–35 who value sustainability and premium gear',
  tone: 'Bold',
  visualStyle: 'Lifestyle',
  background: 'Gym',
  lighting: 'Golden hour',
}

const initialForm = {
  productName: '',
  productDescription: '',
  targetAudience: '',
  tone: 'Bold',
  visualStyle: 'Studio',
  background: 'White seamless',
  lighting: 'Soft studio',
}

const LOADING_STEPS = [
  'Writing platform-optimized ad copy…',
  'Crafting photorealistic image prompt…',
  'Generating image via Hugging Face (FLUX → SDXL)…',
  'Enhancing and saving your campaign…',
]

function App() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [campaign, setCampaign] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [hfConfigured, setHfConfigured] = useState(true)
  const [hfHint, setHfHint] = useState('')

  useEffect(() => {
    fetchHistory()
    fetch('/api/health')
      .then((res) => res.json())
      .then((payload) => {
        const configured = payload?.huggingface?.configured ?? false
        setHfConfigured(configured)
        setHfHint(payload?.huggingface?.hint || '')
      })
      .catch(() => {
        setHfConfigured(false)
        setHfHint('Cannot reach backend. Make sure the server is running on port 5000.')
      })
  }, [])

  useEffect(() => {
    if (!loading) return undefined
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [loading])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/campaigns?limit=8')
      const payload = await response.json()
      if (response.ok) setHistory(payload.data || [])
    } catch {
      // History is optional — fail silently
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const loadDemoExample = () => {
    setForm(DEMO_EXAMPLE)
    setError('')
    setNotice('Demo example loaded — click Generate Campaign!')
    setTimeout(() => setNotice(''), 3000)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setCampaign(null)
    setLoading(true)
    setLoadingStep(0)

    try {
      const response = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to generate campaign')
      }

      setCampaign(payload.data)
      setActiveTab('overview')
      fetchHistory()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadCampaign = async (id) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.message || 'Failed to load campaign')
      setCampaign(payload.data)
      setActiveTab('overview')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setNotice('Copied to clipboard!')
      setTimeout(() => setNotice(''), 2000)
    } catch {
      setError('Unable to copy to clipboard.')
    }
  }

  const copyAllAssets = async () => {
    if (!campaign) return
    const mc = campaign.marketingCopy
    const hashtagLine = mc.hashtags?.map((t) => `#${t}`).join(' ') || ''
    const bundle =
      `=== AD VARIANTS ===\n\n` +
      mc.adVariants.map((v, i) => `Variant ${i + 1}:\n${v}`).join('\n\n') +
      `\n\n=== INSTAGRAM ===\n${mc.instagramCaption}\n\n` +
      `=== FACEBOOK ===\n${mc.facebookPost}\n\n` +
      `=== TWITTER/X ===\n${mc.twitterPost}\n\n` +
      `=== LINKEDIN ===\n${mc.linkedinPost}\n\n` +
      `=== CTA ===\n${mc.callToAction}\n\n` +
      `=== HASHTAGS ===\n${hashtagLine}`
    await handleCopy(bundle)
  }

  const exportJson = () => {
    if (!campaign) return
    const blob = new Blob([JSON.stringify(campaign, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `campaign-${campaign.productName.replace(/\s+/g, '-').toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const platformSections = campaign
    ? [
        { key: 'instagram', label: 'Instagram', content: campaign.marketingCopy.instagramCaption },
        { key: 'facebook', label: 'Facebook', content: campaign.marketingCopy.facebookPost },
        { key: 'twitter', label: 'Twitter / X', content: campaign.marketingCopy.twitterPost },
        { key: 'linkedin', label: 'LinkedIn', content: campaign.marketingCopy.linkedinPost },
      ]
    : []

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/80 p-6 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">AI Ad-Campaign Generator</p>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 transition hover:bg-sky-500/20"
                >
                  @SurajInCode
                </a>
              </div>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Campaign Builder Pro</h1>
              <p className="mt-2 max-w-2xl text-slate-400">
                Multi-platform copy, photorealistic visuals, and campaign history — powered by Hugging Face.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500">Copy Engine</p>
                <p className="mt-1 font-semibold text-sky-400">Qwen 2.5</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-5 py-4 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500">Image Engine</p>
                <p className="mt-1 font-semibold text-violet-400">FLUX / SDXL</p>
              </div>
            </div>
          </div>
        </header>

        {!hfConfigured && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            <p className="font-semibold">Hugging Face token not configured</p>
            <p className="mt-1 text-amber-200/90">{hfHint}</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-amber-200/80">
              <li>Go to <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">huggingface.co/settings/tokens</a></li>
              <li>Create a token with <strong>Inference</strong> permission (starts with <code className="text-amber-100">hf_</code>)</li>
              <li>Edit <code className="text-amber-100">backend/.env</code> → set <code className="text-amber-100">HF_TOKEN=hf_your_token</code></li>
              <li>Restart backend: <code className="text-amber-100">cd backend && npm start</code></li>
            </ol>
          </div>
        )}

        <main className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Inputs</p>
                  <h2 className="text-xl font-semibold text-white">New campaign</h2>
                </div>
                <button
                  type="button"
                  onClick={loadDemoExample}
                  className="shrink-0 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-400 transition hover:bg-sky-500/20"
                >
                  Load best example
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {['productName', 'targetAudience'].map((field) => (
                  <label key={field} className="block space-y-1.5 text-sm">
                    <span className="font-medium text-slate-200">
                      {field === 'productName' ? 'Product Name' : 'Target Audience'}
                    </span>
                    <input
                      name={field}
                      value={form[field]}
                      onChange={handleChange}
                      required
                      maxLength={field === 'productName' ? 120 : 200}
                      placeholder={field === 'productName' ? 'HydroVault Pro 32' : 'Health-conscious millennials aged 22–35 who love fitness & sustainability'}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                    />
                  </label>
                ))}

                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-slate-200">Product Description</span>
                  <textarea
                    name="productDescription"
                    value={form.productDescription}
                    onChange={handleChange}
                    required
                    maxLength={2000}
                    rows="4"
                    placeholder="Premium insulated bottle. Keeps drinks cold 48hrs, hot 12hrs. Leak-proof lid, BPA-free, matte finish. Key benefits + materials + use cases."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  />
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-slate-200">Tone</span>
                  <select name="tone" value={form.tone} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-100">
                    <option>Bold</option><option>Professional</option><option>Witty</option><option>Casual</option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-slate-200">Style</span>
                    <select name="visualStyle" value={form.visualStyle} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100">
                      <option>Studio</option><option>Lifestyle</option><option>Outdoor</option><option>Flat lay</option>
                    </select>
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-slate-200">Background</span>
                    <select name="background" value={form.background} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100">
                      <option>White seamless</option><option>Wood table</option><option>Gym</option><option>Nature</option><option>Kitchen</option>
                    </select>
                  </label>
                </div>

                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-slate-200">Lighting</span>
                  <select name="lighting" value={form.lighting} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-100">
                    <option>Soft studio</option><option>Golden hour</option><option>Bright daylight</option><option>Dramatic</option>
                  </select>
                </label>

              <button
                type="submit"
                disabled={loading || !hfConfigured}
                className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
              >
                  {loading ? 'Generating…' : 'Generate Campaign'}
                </button>
              </form>

              {error && <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
              {notice && <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</p>}

              {loading && (
                <div className="mt-4 space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-sm text-sky-400">{LOADING_STEPS[loadingStep]}</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-sky-500" />
                  </div>
                </div>
              )}
            </section>

            {history.length > 0 && (
              <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Recent campaigns</h3>
                <ul className="space-y-2">
                  {history.map((item) => (
                    <li key={item._id}>
                      <button
                        type="button"
                        onClick={() => loadCampaign(item._id)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-left transition hover:border-sky-500/40 hover:bg-slate-900"
                      >
                        <p className="font-medium text-slate-200">{item.productName}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString()} · {item.tone}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            {!campaign ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-8 text-center">
                <p className="text-lg font-medium text-slate-300">Your campaign assets will appear here</p>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Generate ad copy for Instagram, Facebook, Twitter/X, and LinkedIn — plus a photorealistic promo image.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{campaign.productName}</h2>
                    <p className="text-sm text-slate-400">
                      {campaign.imageModel ? `Image: ${campaign.imageModel.split('/').pop()}` : 'Hugging Face'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={copyAllAssets} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-700">Copy all</button>
                    <button type="button" onClick={exportJson} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-700">Export JSON</button>
                  </div>
                </div>

                <div className="flex gap-2 border-b border-slate-800 pb-1">
                  {['overview', 'platforms', 'ads'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                        activeTab === tab ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === 'overview' && (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-2xl border border-slate-800">
                      <img src={campaign.generatedImageUrl} alt="Campaign visual" className="w-full object-cover" />
                    </div>
                    <div className="space-y-4">
                      <a href={campaign.generatedImageUrl} download="campaign-image.png" className="inline-block rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400">
                        Download image
                      </a>
                      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <p className="text-xs uppercase text-slate-500">Call to action</p>
                        <p className="mt-2 text-slate-200">{campaign.marketingCopy.callToAction}</p>
                      </div>
                      {campaign.marketingCopy.hashtags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {campaign.marketingCopy.hashtags.map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-sky-300">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'platforms' && (
                  <div className="space-y-4">
                    {platformSections.map(({ key, label, content }) => (
                      <div key={key} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="font-semibold text-white">{label}</h3>
                          <button type="button" onClick={() => handleCopy(content)} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700">Copy</button>
                        </div>
                        <p className="whitespace-pre-wrap text-slate-300">{content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'ads' && (
                  <div className="space-y-4">
                    {campaign.marketingCopy.adVariants.map((variant, index) => (
                      <div key={index} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm text-slate-400">Variant {index + 1}</span>
                          <button type="button" onClick={() => handleCopy(variant)} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700">Copy</button>
                        </div>
                        <p className="text-slate-200">{variant}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </main>

        <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row">
          <p>Built with React, Node.js, MongoDB & Hugging Face</p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-semibold text-sky-400 transition hover:text-sky-300"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            SurajInCode
          </a>
        </footer>
      </div>
    </div>
  )
}

export default App
