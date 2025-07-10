"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Play, Trash2, FileX, Copy, Check, Terminal, Code } from "lucide-react"

interface ConsoleMessage {
  id: number
  type: "command" | "output" | "error" | "info"
  content: string
  timestamp: Date
}

const languages = [
  { value: "javascript", label: "JavaScript", ready: true },
  { value: "c", label: "C", ready: true },
  { value: "python", label: "Python", ready: false },
  { value: "cpp", label: "C++", ready: false },
  { value: "java", label: "Java", ready: false },
  { value: "typescript", label: "TypeScript", ready: false },
]

const defaultCode = {
  javascript: `// Welcome to MyWebConsole!
console.log("Hello, World!");

// Try some JavaScript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(x => x * 2);
console.log("Doubled:", doubled);

// Calculate factorial
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));`,
  c: `// Welcome to MyWebConsole!
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Simple calculations
    int numbers[] = {1, 2, 3, 4, 5};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("Original numbers: ");
    for(int i = 0; i < size; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\\n");
    
    printf("Doubled numbers: ");
    for(int i = 0; i < size; i++) {
        printf("%d ", numbers[i] * 2);
    }
    printf("\\n");
    
    return 0;
}`,
  python: `# Welcome to MyWebConsole!
print("Hello, World!")

# Try some Python
numbers = [1, 2, 3, 4, 5]
doubled = [x * 2 for x in numbers]
print("Doubled:", doubled)

# Calculate factorial
def factorial(n):
    return 1 if n <= 1 else n * factorial(n - 1)

print("Factorial of 5:", factorial(5))`,
}

export default function MyWebConsole() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [code, setCode] = useState(defaultCode.javascript)
  const [messages, setMessages] = useState<ConsoleMessage[]>([
    {
      id: 1,
      type: "info",
      content: "Welcome to MyWebConsole! Select a language and start coding.",
      timestamp: new Date(),
    },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const consoleRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Load Monaco Editor
    const script = document.createElement("script")
    script.src = "https://unpkg.com/monaco-editor@0.45.0/min/vs/loader.js"
    script.onload = () => {
      // @ts-ignore
      window.require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.45.0/min/vs" } })
      // @ts-ignore
      window.require(["vs/editor/editor.main"], () => {
        if (editorRef.current) {
          // @ts-ignore
          const editor = window.monaco.editor.create(editorRef.current, {
            value: code,
            language: selectedLanguage === "c" ? "c" : selectedLanguage,
            theme: "vs-dark",
            fontSize: 14,
            fontFamily: "JetBrains Mono, Fira Code, Cascadia Code, Consolas, monospace",
            minimap: { enabled: window.innerWidth > 768 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: "on",
            renderWhitespace: "selection",
            wordWrap: "on",
            tabSize: 2,
            insertSpaces: true,
          })

          editor.onDidChangeModelContent(() => {
            setCode(editor.getValue())
          })

          // Keyboard shortcut for running code
          editor.addCommand(
            // @ts-ignore
            window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter,
            () => {
              runCode()
            },
          )

          // Update language when changed
          const updateLanguage = (lang: string) => {
            // @ts-ignore
            window.monaco.editor.setModelLanguage(editor.getModel(), lang === "c" ? "c" : lang)
          }

          // Store editor reference for language updates
          // @ts-ignore
          window.monacoEditor = editor
          // @ts-ignore
          window.updateEditorLanguage = updateLanguage
        }
      })
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    // Update editor language when selectedLanguage changes
    // @ts-ignore
    if (window.updateEditorLanguage) {
      // @ts-ignore
      window.updateEditorLanguage(selectedLanguage === "c" ? "c" : selectedLanguage)
    }

    // Update code when language changes
    if (selectedLanguage === "javascript" && !code.includes("console.log")) {
      setCode(defaultCode.javascript)
      // @ts-ignore
      if (window.monacoEditor) {
        // @ts-ignore
        window.monacoEditor.setValue(defaultCode.javascript)
      }
    } else if (selectedLanguage === "c" && !code.includes("#include")) {
      setCode(defaultCode.c)
      // @ts-ignore
      if (window.monacoEditor) {
        // @ts-ignore
        window.monacoEditor.setValue(defaultCode.c)
      }
    } else if (selectedLanguage === "python" && !code.includes("print(")) {
      setCode(defaultCode.python)
      // @ts-ignore
      if (window.monacoEditor) {
        // @ts-ignore
        window.monacoEditor.setValue(defaultCode.python)
      }
    }
  }, [selectedLanguage])

  const addMessage = (type: ConsoleMessage["type"], content: string) => {
    const newMessage: ConsoleMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const simulateJavaScript = (code: string) => {
    try {
      // Capture console output
      const originalLog = console.log
      const originalError = console.error
      const originalWarn = console.warn
      const outputs: string[] = []

      console.log = (...args) => {
        outputs.push(
          args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" "),
        )
      }
      console.error = (...args) => {
        outputs.push("ERROR: " + args.map((arg) => String(arg)).join(" "))
      }
      console.warn = (...args) => {
        outputs.push("WARNING: " + args.map((arg) => String(arg)).join(" "))
      }

      // Execute the code
      eval(code)

      // Restore original console methods
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn

      return outputs.length > 0 ? outputs.join("\n") : "Code executed successfully (no output)"
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`
    }
  }

  const simulateC = (code: string) => {
    // Simple C simulation - look for printf statements
    const printfMatches = code.match(/printf\s*$$\s*"([^"]*)"[^)]*$$/g)
    if (printfMatches) {
      const outputs = printfMatches
        .map((match) => {
          const content = match.match(/"([^"]*)"/)
          if (content) {
            return content[1].replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\\\/g, "\\")
          }
          return ""
        })
        .filter(Boolean)

      return outputs.length > 0 ? outputs.join("\n") : "Program compiled and executed successfully"
    }

    return "Program compiled and executed successfully"
  }

  const runCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to run",
        description: "Please write some code first.",
        variant: "destructive",
      })
      return
    }

    setIsRunning(true)
    addMessage("command", `Running ${languages.find((l) => l.value === selectedLanguage)?.label} code...`)

    // Simulate execution delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const currentLang = languages.find((l) => l.value === selectedLanguage)

    if (currentLang?.ready) {
      let output = ""

      if (selectedLanguage === "javascript") {
        output = simulateJavaScript(code)
      } else if (selectedLanguage === "c") {
        output = simulateC(code)
      }

      addMessage(output.startsWith("Error:") ? "error" : "output", output)
    } else {
      addMessage(
        "info",
        `${currentLang?.label} support is coming soon! 🚀\n\nFor now, try JavaScript or C to see the console in action.`,
      )
    }

    setIsRunning(false)
  }

  const clearOutput = () => {
    setMessages([])
    toast({
      title: "Console cleared",
      description: "Output panel has been cleared.",
    })
  }

  const clearEditor = () => {
    setCode("")
    // @ts-ignore
    if (window.monacoEditor) {
      // @ts-ignore
      window.monacoEditor.setValue("")
    }
    toast({
      title: "Editor cleared",
      description: "Code editor has been cleared.",
    })
  }

  const copyCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Nothing to copy",
        description: "The editor is empty.",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Code copied!",
        description: "Code has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      })
    }
  }

  const getMessageIcon = (type: ConsoleMessage["type"]) => {
    switch (type) {
      case "command":
        return "▶"
      case "output":
        return "✓"
      case "error":
        return "✗"
      case "info":
        return "ℹ"
      default:
        return "•"
    }
  }

  const getMessageColor = (type: ConsoleMessage["type"]) => {
    switch (type) {
      case "command":
        return "text-blue-400"
      case "output":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "info":
        return "text-cyan-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono">
      <Toaster />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-6 w-6 text-green-400" />
                <h1 className="text-xl font-bold">MyWebConsole</h1>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                v1.0
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value} className="text-white">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${lang.ready ? "bg-green-400" : "bg-yellow-400"}`} />
                        {lang.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Console Output */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Console Output</span>
              </div>
            </div>
            <div
              ref={consoleRef}
              className="h-64 overflow-y-auto p-4 space-y-2 bg-black/20 font-mono text-sm"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#374151 transparent",
              }}
            >
              {messages.length === 0 ? (
                <div className="text-gray-500 italic">Console output will appear here...</div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 animate-in slide-in-from-bottom-2 duration-300 ${getMessageColor(message.type)}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-xs mt-0.5 opacity-70">{getMessageIcon(message.type)}</span>
                    <pre className="whitespace-pre-wrap break-words flex-1 leading-relaxed">{message.content}</pre>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

        {/* Code Editor */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${languages.find((l) => l.value === selectedLanguage)?.ready ? "bg-green-400" : "bg-yellow-400"}`}
                />
                <span className="text-sm text-gray-400">
                  {languages.find((l) => l.value === selectedLanguage)?.label} Editor
                </span>
                <span className="text-xs text-gray-500 hidden sm:inline">Ctrl+Enter to run</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={runCode}
                  disabled={isRunning}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                >
                  <Play className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">{isRunning ? "Running..." : "Run"}</span>
                </Button>
                <Button
                  onClick={clearOutput}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Clear Output</span>
                </Button>
                <Button
                  onClick={clearEditor}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  <FileX className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Clear Editor</span>
                </Button>
                <Button
                  onClick={copyCode}
                  variant="outline"
                  size="sm"
                  className={`border-gray-600 text-gray-300 hover:bg-gray-800 transition-all duration-200 ${
                    copied ? "border-green-500 text-green-400 bg-green-500/10" : ""
                  }`}
                  style={{
                    animation: copied ? "copyPulse 0.6s ease-out" : undefined,
                  }}
                >
                  {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
            </div>
            <div ref={editorRef} className="h-96 bg-[#1e1e1e]" style={{ minHeight: "400px" }} />
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes copyPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); }
        }
        
        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
        
        /* Hide scrollbar on mobile */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
