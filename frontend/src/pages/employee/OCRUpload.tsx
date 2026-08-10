import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import api from "@/lib/api"

type OCRResult = {
  extracted_text: string
  sap_module: string
  possible_error: string
  confidence_score: number
  pages_processed?: number
}

export default function OCRUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0]
      setFile(selected)
      setResult(null)
      setError(null)
      setPreviewUrl(selected.type.startsWith("image/") ? URL.createObjectURL(selected) : null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  const processFile = async () => {
    if (!file) return

    setIsProcessing(true)
    setError(null)
    
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await api.post("/api/ocr", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during OCR processing.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInvestigate = () => {
    if (result?.possible_error) {
      navigate("/chat", { state: { initialMessage: `I have an SAP error in module ${result.sap_module}: ${result.possible_error}. How can I fix this?` } })
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 text-white relative z-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">OCR Document Upload</h1>
        <p className="text-slate-400 mt-2 text-xs sm:text-sm">
          Upload a screenshot or PDF of an SAP error message for automatic module parsing and error isolation.
        </p>
      </div>

      <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 md:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              isDragActive ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 hover:border-indigo-500/50 hover:bg-slate-900/60"
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-12 w-12 text-slate-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium text-indigo-300">Drop the file here ...</p>
            ) : (
              <div className="space-y-1.5">
                <p className="text-lg font-medium text-slate-200">Drag & drop a file here, or click to select</p>
                <p className="text-xs text-slate-500">Supports PNG, JPEG, and PDF (Max 5MB)</p>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] items-center p-4 bg-slate-950/60 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null)
                    setResult(null)
                    setError(null)
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(null)
                    }
                  }}
                >
                  Remove
                </Button>
                <Button onClick={processFile} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    "Extract Text"
                  )}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {previewUrl && (
        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
          <CardHeader>
            <CardTitle>Image Preview</CardTitle>
            <CardDescription className="text-slate-400">Review the screenshot before extraction.</CardDescription>
          </CardHeader>
          <CardContent>
            <img src={previewUrl} alt="OCR preview" className="w-full max-h-96 rounded-3xl object-contain" />
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="grid gap-5 sm:gap-6 grid-cols-1 xl:grid-cols-2">
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                AI Module Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl bg-slate-950/70 p-4 border border-white/5">
                <p className="text-xs text-slate-400">Detected SAP Module</p>
                <p className="mt-1 text-xl font-semibold text-white">{result.sap_module}</p>
              </div>
              {result.pages_processed !== undefined && (
                <div className="rounded-3xl bg-slate-950/70 p-4 border border-white/5">
                  <p className="text-xs text-slate-400">Pages Processed</p>
                  <p className="mt-1 text-sm font-semibold text-white">{result.pages_processed} page(s)</p>
                </div>
              )}
              <div className="rounded-3xl bg-slate-950/70 p-4 border border-white/5">
                <p className="text-xs text-slate-400">Isolated Error Code / Message</p>
                <p className="mt-1 text-sm font-semibold text-red-400">{result.possible_error}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-4 border border-white/5">
                <p className="text-xs text-slate-400">OCR Parsing Accuracy Confidence</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${result.confidence_score * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{(result.confidence_score * 100).toFixed(0)}%</span>
                </div>
              </div>
              <Button onClick={handleInvestigate} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                Investigate with AI Copilot
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md text-white shadow-xl">
            <CardHeader>
              <CardTitle>Raw OCR Document Text</CardTitle>
              <CardDescription className="text-slate-400">Text extracted from the uploaded image or PDF.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950/80 p-4 rounded-3xl border border-white/5 h-[300px] overflow-y-auto text-xs font-mono whitespace-pre-wrap text-slate-300">
                {result.extracted_text}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
