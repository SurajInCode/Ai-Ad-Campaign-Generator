import { useState } from 'react'

const initialForm = {
  productName: '',
  productDescription: '',
  targetAudience: '',
  tone: 'Bold',
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [campaign, setCampaign] = useState(null)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setCampaign(null)
    setLoading(true)

    try {
      const response = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to generate campaign')
      }

      setCampaign(payload.data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setError('Copied to clipboard!')
      setTimeout(() => setError(''), 2000)
    } catch {
      setError('Unable to copy to clipboard.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">AI Ad-Campaign Generator</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Campaign Builder</h1>
              <p className="mt-2 max-w-2xl text-slate-400">
                Create branded ad copy and a campaign-ready image in one polished workflow.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-800/80 px-5 py-4 text-right shadow-lg shadow-slate-950/20">
              <p className="text-sm text-slate-400">Designed for marketers and product teams</p>
              <p className="mt-2 text-2xl font-semibold text-sky-400">By SurajInCode</p>
            </div>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Campaign inputs</p>
              <h2 className="text-2xl font-semibold text-white">Build your next campaign</h2>
              <p className="text-slate-400">Enter the product details and choose a tone. Then generate a polished campaign instantly.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2 text-sm text-slate-300">
                <span className="font-medium text-slate-200">Product Name</span>
                <input
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
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
                  rows="5"
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

            {loading && (
              <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
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
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
                  <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 shadow-lg shadow-slate-950/20">
                    <img
                      src={campaign.generatedImageUrl}
                      alt="Generated campaign visual"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-lg shadow-slate-950/20">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Generated image</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Creative asset</h3>
                    </div>
                    <a
                      href={campaign.generatedImageUrl}
                      download="campaign-image.png"
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                    >
                      Download Image
                    </a>
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
