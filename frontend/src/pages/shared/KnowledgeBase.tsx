import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookOpen, Search, FileText, Download, Eye, Upload, Trash2, Plus, X, CheckCircle2, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

type KBDoc = {
  id: number
  title: string
  category: string
  module: string
  filename: string
  file_size: string
  uploaded_by: string
  uploaded_at: string
}

const CATEGORY_COLORS: Record<string, string> = {
  SOP:   "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  Guide: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  FAQ:   "bg-orange-500/15 text-orange-400 border border-orange-500/20",
  Manual:"bg-green-500/15 text-green-400 border border-green-500/20",
}

export default function KnowledgeBase() {
  const [docs, setDocs] = useState<KBDoc[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [userRole, setUserRole] = useState("employee")
  const [loading, setLoading] = useState(true)

  // Upload form state (admin only)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadCategory, setUploadCategory] = useState("SOP")
  const [uploadModule, setUploadModule] = useState("FI")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState("")
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Preview & Download state
  const [previewDoc, setPreviewDoc] = useState<any | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const fetchDocs = () => {
    api.get("/api/kb/documents")
      .then(res => {
        setDocs(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "employee"
    setUserRole(role)
    fetchDocs()
  }, [])

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) {
      setUploadError("Please select a file to upload.")
      return
    }
    setUploading(true)
    setUploadError("")
    setUploadSuccess("")

    const formData = new FormData()
    formData.append("title", uploadTitle)
    formData.append("category", uploadCategory)
    formData.append("module", uploadModule)
    formData.append("file", uploadFile)

    try {
      await api.post("/api/kb/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setUploadSuccess("Document uploaded successfully!")
      setUploadTitle("")
      setUploadFile(null)
      fetchDocs()
      setTimeout(() => { setShowUploadForm(false); setUploadSuccess("") }, 1500)
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (doc: KBDoc) => {
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return
    try {
      await api.delete(`/api/kb/documents/${doc.id}`)
      setDocs(prev => prev.filter(d => d.id !== doc.id))
    } catch {
      alert("Failed to delete document.")
    }
  }

  const handlePreview = async (doc: KBDoc) => {
    setPreviewLoading(true)
    setPreviewDoc(doc)
    try {
      const res = await api.get(`/api/kb/preview/${doc.id}`)
      if (res.data && typeof res.data === "object") {
        setPreviewDoc({ ...doc, ...res.data })
      }
    } catch (err) {
      console.error("Preview error:", err)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDownload = async (doc: KBDoc) => {
    setDownloadingId(doc.id)
    try {
      const response = await api.get(`/api/kb/download/${doc.id}`, {
        responseType: "blob"
      })
      const blob = new Blob([response.data], { type: String(response.headers["content-type"] || "text/plain") })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const downloadName = doc.filename.endsWith(".pdf") ? doc.filename.replace(".pdf", ".txt") : doc.filename
      link.setAttribute("download", downloadName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to download document:", err)
      alert("Failed to download document. Please check connection.")
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6 text-white relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Knowledge Base
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Centralized directory of SOPs, manuals, guides, and troubleshooting documents.
          </p>
        </div>

        {/* Admin-only Upload Button */}
        {userRole === "admin" && (
          <Button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-10 px-5 font-semibold shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" /> Upload Document
          </Button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search documents or modules..."
            className="pl-9 bg-slate-950/40 border-white/10 text-white placeholder-slate-500 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
          {["All", "SOP", "Guide", "FAQ", "Manual"].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs rounded-xl whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                  : "border-white/10 hover:bg-white/5"
              }`}
              size="sm"
            >
              {cat === "All" ? "All" : `${cat}s`}
            </Button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="border-white/5 bg-slate-900/40 p-6 space-y-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16 bg-slate-800" />
                <Skeleton className="h-5 w-12 bg-slate-800" />
              </div>
              <div className="space-y-2 pt-2">
                <Skeleton className="h-5 w-full bg-slate-800" />
                <Skeleton className="h-5 w-2/3 bg-slate-800" />
              </div>
              <Skeleton className="h-3 w-40 bg-slate-800 mt-2" />
              <div className="flex gap-2 pt-4 border-t border-white/5">
                <Skeleton className="h-8 w-full bg-slate-800 rounded-xl" />
                <Skeleton className="h-8 w-full bg-slate-800 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl hover:border-white/10 hover:shadow-indigo-500/5 transition-all duration-300 group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${CATEGORY_COLORS[doc.category] || "bg-slate-500/15 text-slate-400 border border-slate-500/20"}`}>
                    {doc.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-white/5">
                      {doc.module}
                    </span>
                    {userRole === "admin" && (
                      <button
                        onClick={() => handleDelete(doc)}
                        className="ml-1 p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Delete document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <CardTitle className="text-base mt-3 flex items-start gap-2 font-bold text-slate-200">
                  <FileText className="h-5 w-5 shrink-0 mt-0.5 text-indigo-400" />
                  <span className="line-clamp-2 leading-snug">{doc.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <CardDescription className="text-[11px] text-slate-500">
                  Uploaded: {doc.uploaded_at.split(" ")[0]} | Size: {doc.file_size}
                </CardDescription>
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs flex gap-1 items-center border-white/10 hover:bg-white/5 rounded-xl"
                    onClick={() => handlePreview(doc)}
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </Button>
                  <Button
                    size="sm"
                    disabled={downloadingId === doc.id}
                    className="w-full text-xs flex gap-1 items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50"
                    onClick={() => handleDownload(doc)}
                  >
                    {downloadingId === doc.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredDocs.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No documents found matching the search criteria.</p>
        </div>
      )}

      {/* Admin Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0d1030] p-8 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
                  Upload Document
                </h3>
                <p className="text-xs text-slate-400 mt-1">Add a new document to the Knowledge Base</p>
              </div>
              <button
                onClick={() => { setShowUploadForm(false); setUploadError(""); setUploadSuccess("") }}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {uploadError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{uploadError}</div>
              )}
              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {uploadSuccess}
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1.5">Document Title *</label>
                <Input
                  required
                  placeholder="e.g. SAP Finance Posting SOP"
                  className="bg-slate-950/50 border-white/10 text-white rounded-2xl h-11"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1.5">Category *</label>
                  <select
                    required
                    className="w-full h-11 bg-slate-950/50 border border-white/10 text-white rounded-2xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                  >
                    <option value="SOP">SOP</option>
                    <option value="Guide">Guide</option>
                    <option value="FAQ">FAQ</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1.5">Module *</label>
                  <select
                    required
                    className="w-full h-11 bg-slate-950/50 border border-white/10 text-white rounded-2xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={uploadModule}
                    onChange={(e) => setUploadModule(e.target.value)}
                  >
                    <option value="FI">FI - Finance</option>
                    <option value="MM">MM - Materials</option>
                    <option value="SD">SD - Sales</option>
                    <option value="HR">HR - Human Resources</option>
                    <option value="General">General</option>
                    <option value="PP">PP - Production</option>
                    <option value="QM">QM - Quality</option>
                    <option value="Basis">BASIS - System</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1.5">File (PDF / Word / TXT) *</label>
                <div
                  className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadFile ? (
                    <div className="text-sm text-indigo-300 flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" /> {uploadFile.name}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-slate-600" />
                      <span>Click to select file</span>
                      <span className="text-xs text-slate-600">PDF, DOCX, TXT — Max 20MB</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 rounded-2xl h-11 border border-white/5 hover:bg-white/5 text-slate-400"
                  onClick={() => { setShowUploadForm(false); setUploadError("") }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-11 font-bold disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d1030] shadow-2xl text-white overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 bg-slate-950/60 flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${CATEGORY_COLORS[previewDoc.category] || "bg-slate-500/15 text-slate-400 border border-slate-500/20"}`}>
                    {previewDoc.category}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Module: {previewDoc.module}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">{previewDoc.title}</h3>
                <p className="text-xs text-slate-400">
                  File: {previewDoc.filename} • Size: {previewDoc.file_size} • Uploaded: {previewDoc.uploaded_at}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {previewLoading ? (
                <div className="space-y-3 py-6">
                  <Skeleton className="h-5 w-3/4 bg-slate-800" />
                  <Skeleton className="h-4 w-full bg-slate-800" />
                  <Skeleton className="h-4 w-5/6 bg-slate-800" />
                  <Skeleton className="h-24 w-full bg-slate-800 rounded-xl" />
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 space-y-2">
                    <div className="font-bold text-indigo-300 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Document Synopsis & Guidelines</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {previewDoc.content_summary || `Standard Operating Procedure and troubleshooting guidelines for SAP ${previewDoc.module} module transactions.`}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Standard Resolution Checklist</h4>
                    <ul className="text-xs text-slate-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Verify master data and authorization parameters for {previewDoc.module}.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Execute standard system diagnosis and check posting period status.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>For recurring blocking errors, escalate via AI Copilot to SAP Expert team.</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
              <Button
                variant="outline"
                className="rounded-xl border-white/10 hover:bg-white/5 text-xs text-slate-300"
                onClick={() => setPreviewDoc(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => handleDownload(previewDoc)}
                disabled={downloadingId === previewDoc.id}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {downloadingId === previewDoc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download Copy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
