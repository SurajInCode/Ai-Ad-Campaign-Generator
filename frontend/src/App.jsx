import { useEffect, useState } from 'react'

const initialForm = {
  productName: '',
  productDescription: '',
  targetAudience: '',
  tone: 'Bold',
  visualStyle: 'Studio',
  background: 'White seamless',
  lighting: 'Soft studio',
  imageEngine: 'local',
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [productImage, setProductImage] = useState(null)
  const [productPreview, setProductPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [campaign, setCampaign] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [localGpuAvailable, setLocalGpuAvailable] = useState(null)

  useEffect(() => {
    fetch('/api/campaigns/local-status')
      .then((res) => res.json())
      .then((payload) => setLocalGpuAvailable(payload.data?.available ?? false))
      .catch(() => setLocalGpuAvailable(false))
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProductImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Product image must be under 5 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setProductImage(reader.result)
      setProductPreview(reader.result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const clearProductImage = () => {
    setProductImage(null)
    setProductPreview('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setCampaign(null)
    setSelectedImageIndex(0)
    setLoading(true)
    setLoadingStep('Writing ad copy with Qwen…')

    try {
      const stepTimer = setTimeout(() => {
        setLoadingStep(
          form.imageEngine === 'local'
            ? 'Generating 2 photorealistic variants on your GPU…'
            : 'Generating image via Hugging Face (FLUX → SDXL fallback)…',
        )
      }, 4000)

      const response = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          productImageBase64: productImage || undefined,
        }),
      })

      clearTimeout(stepTimer)
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to generate campaign')
      }

      setCampaign(payload.data)
      setSelectedImageIndex(payload.data.selectedImageIndex || 0)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setLoadingStep('')
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

  const imageVariants = campaign?.imageVariants?.length
    ? campaign.imageVariants
    : campaign?.generatedImageUrl
      ? [campaign.generatedImageUrl]
      : []

  const activeImage = imageVariants[selectedImageIndex] || campaign?.generatedImageUrl

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">AI Ad-Campaign Generator v2</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Campaign Builder Pro</h1>
              <p className="mt-2 max-w-2xl text-slate-400">
                Two-stage AI prompts, photorealistic controls, local 4GB GPU support, and multi-variant output.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-800/80 px-5 py-4 text-right shadow-lg shadow-slate-950/20">
              <p className="text-sm text-slate-400">Local GPU status</p>
              <p className={`mt-2 text-lg font-semibold ${localGpuAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
                {localGpuAvailable === null
                  ? 'Checking…'
                  : localGpuAvailable
                    ? 'A1111 ready on :7860'
                    : 'A1111 not running'}
              </p>
            </div>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Campaign inputs</p>
              <h2 className="text-2xl font-semibold text-white">Build your next campaign</h2>
              <p className="text-slate-400">
                Add product details, visual style, and optionally upload a real product photo for img2img.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2 text-sm text-slate-300">
                <span className="font-medium text-slate-200">Product Name</span>
                <input
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  required
                  placeholder="Sleek Bottle"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-300">
                <span className="font-medium text-slate-200">Product Description</span>
                <textarea
                  name="productDescription"
                  value={form.productDescription}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="An insulated titanium water bottle that keeps drinks cold for 48 hours."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-300">
                <span className="font-medium text-slate-200">Target Audience</span>
                <input
                  name="targetAudience"
                  value={form.targetAudience}
                  onChange={handleChange}
                  required
                  placeholder="Gym goers and hikers"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-300">
                <span className="font-medium text-slate-200">Tone</span>
                <select
                  name="tone"
                  value={form.tone}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                >
                  <option>Bold</option>
                  <option>Professional</option>
                  <option>Witty</option>
                  <option>Casual</option>
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-300">
                  <span className="font-medium text-slate-200">Visual Style</span>
                  <select
                    name="visualStyle"
                    value={form.visualStyle}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  >
                    <option>Studio</option>
                    <option>Lifestyle</option>
                    <option>Outdoor</option>
                    <option>Flat lay</option>
                  </select>
                </label>

                <label className="block space-y-2 text-sm text-slate-300">
                  <span className="font-medium text-slate-200">Background</span>
                  <select
                    name="background"
                    value={form.background}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  >
                    <option>White seamless</option>
                    <option>Wood table</option>
                    <option>Gym</option>
                    <option>Nature</option>
                    <option>Kitchen</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-2 text-sm text-slate-300">
                <span className="font-medium text-slate-200">Lighting</span>
                <select
                  name="lighting"
                  value={form.lighting}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                >
                  <option>Soft studio</option>
                  <option>Golden hour</option>
                  <option>Bright daylight</option>
                  <option>Dramatic</option>
                </select>
              </label>

              <label className="block space-y-2 text-sm text-slate-300">
                <span className="font-medium text-slate-200">Image Engine</span>
                <select
                  name="imageEngine"
                  value={form.imageEngine}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                >
                  <option value="local">Local GPU (4GB — 2 variants, recommended)</option>
                  <option value="huggingface">Hugging Face Cloud (FLUX / SDXL)</option>
                </select>
                <p className="text-xs text-slate-500">
                  Local mode needs Automatic1111 running with <code className="text-sky-400">--api --medvram</code>
                </p>
              </label>

              <div className="space-y-2 text-sm text-slate-300">
                <span className="font-medium text-slate-200">Product Photo (optional — enables img2img)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageChange}
                  className="w-full rounded-2xl border border-dashed border-slate-700 bg-slate-950 px-4 py-3 text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
                />
                {productPreview && (
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-3">
                    <img src={productPreview} alt="Product reference" className="h-16 w-16 rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={clearProductImage}
                      className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full justify-center rounded-2xl bg-sky-500 px-5 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Generating campaign…' : 'Generate Campaign'}
              </button>
            </form>

            {error && (
              <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            {notice && (
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {notice}
              </div>
            )}

            {loading && (
              <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-sm text-sky-400">{loadingStep || 'Starting AI pipeline…'}</p>
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-800"></div>
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-800"></div>
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-800"></div>
              </div>
            )}
          </section>

          <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Campaign dashboard</p>
                <h2 className="text-2xl font-semibold text-white">Generated assets</h2>
              </div>
              <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-400">
                {campaign ? 'Ready' : 'Awaiting input'}
              </span>
            </div>

            {!campaign ? (
              <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/70 p-8 text-center text-slate-500">
                <p className="text-lg font-medium text-slate-300">Your campaign preview will show here after generation.</p>
                <p className="mt-2 text-sm">Tip: upload a product photo + use Local GPU for the most realistic results on 4GB VRAM.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
                  <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 shadow-lg shadow-slate-950/20">
                    <img
                      src={activeImage}
                      alt="Generated campaign visual"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-lg shadow-slate-950/20">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Generated image</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Creative asset</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Engine: {campaign.imageEngine === 'local' ? 'Local SD 1.5' : 'Hugging Face'}
                        {campaign.hasProductReference ? ' · img2img' : ''}
                      </p>
                    </div>

                    {imageVariants.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-sm text-slate-400">Pick a variant</p>
                        <div className="flex gap-3">
                          {imageVariants.map((variant, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedImageIndex(index)}
                              className={`overflow-hidden rounded-xl border-2 transition ${
                                selectedImageIndex === index
                                  ? 'border-sky-400 ring-2 ring-sky-400/30'
                                  : 'border-slate-700 hover:border-slate-500'
                              }`}
                            >
                              <img src={variant} alt={`Variant ${index + 1}`} className="h-20 w-20 object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <a
                      href={activeImage}
                      download="campaign-image.png"
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                    >
                      Download Selected Image
                    </a>

                    <details className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
                      <summary className="cursor-pointer font-medium text-slate-300">View image prompt</summary>
                      <p className="mt-3 whitespace-pre-wrap text-slate-400">{campaign.imagePrompt}</p>
                    </details>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Ad variants</h3>
                  <div className="grid gap-4">
                    {campaign.marketingCopy.adVariants.map((variant, index) => (
                      <div key={index} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-lg shadow-slate-950/20">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-slate-400">Variant {index + 1}</p>
                          <button
                            type="button"
                            onClick={() => handleCopy(variant)}
                            className="rounded-2xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="mt-4 text-slate-100">{variant}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-lg shadow-slate-950/20">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">LinkedIn post</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Structured share copy</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(campaign.marketingCopy.linkedinPost)}
                      className="rounded-2xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                    >
                      Copy post
                    </button>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-slate-200">{campaign.marketingCopy.linkedinPost}</p>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
