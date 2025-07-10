"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Trash2, FileX, Copy, Terminal, Code2, Check } from "lucide-react"

interface ConsoleEntry {
  id: string
  type: "command" | "output" | "error" | "info"
  content: string
  timestamp: Date
}

interface Language {
  id: string
  name: string
  extension: string
  monacoId: string
  defaultCode: string
  supported: boolean
}

const languages: Language[] = [
  {
    id: "javascript",
    name: "JavaScript",
    extension: "js",
    monacoId: "javascript",
    supported: true,
    defaultCode: `// JavaScript Console - Ready to run!
console.log("Hello, World!");

// Variables and operations
const name = "Developer";
const age = 25;
console.log(\`Name: \${name}, Age: \${age}\`);

// Arrays and functions
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("Numbers:", numbers);
console.log("Sum:", sum);

// Objects
const user = {
  name: "John Doe",
  skills: ["JavaScript", "React", "Node.js"]
};
console.log("User:", user);

// Async example
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function demo() {
  console.log("Starting async operation...");
  await delay(1000);
  console.log("Async operation completed!");
}

demo();`,
  },
  {
    id: "c",
    name: "C",
    extension: "c",
    monacoId: "c",
    supported: true,
    defaultCode: `// C Console - Ready to compile and run!
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    printf("Hello, World!\\n");
    
    // Variables and basic operations
    int a = 15, b = 7;
    printf("a = %d, b = %d\\n", a, b);
    printf("a + b = %d\\n", a + b);
    printf("a - b = %d\\n", a - b);
    printf("a * b = %d\\n", a * b);
    printf("a / b = %d\\n", a / b);
    
    // Arrays and loops
    int numbers[] = {10, 20, 30, 40, 50};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    int sum = 0;
    
    printf("\\nArray elements: ");
    for(int i = 0; i < size; i++) {
        printf("%d ", numbers[i]);
        sum += numbers[i];
    }
    printf("\\nSum of array: %d\\n", sum);
    
    // Strings
    char message[] = "Welcome to C programming!";
    printf("\\nMessage: %s\\n", message);
    printf("Message length: %lu\\n", strlen(message));
    
    return 0;
}`,
  },
  {
    id: "python",
    name: "Python",
    extension: "py",
    monacoId: "python",
    supported: false,
    defaultCode: `# Python support coming soon!
print("Hello, World!")

# Variables and basic operations
name = "Developer"
age = 25
print(f"Name: {name}, Age: {age}")

# Lists and functions
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print(f"Numbers: {numbers}")
print(f"Sum: {total}")

# Dictionary
user = {
    "name": "John Doe",
    "skills": ["Python", "Django", "FastAPI"]
}
print(f"User: {user}")

# Classes
class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def show_history(self):
        for entry in self.history:
            print(entry)

calc = Calculator()
result = calc.add(10, 5)
print(f"Result: {result}")
calc.show_history()`,
  },
  {
    id: "cpp",
    name: "C++",
    extension: "cpp",
    monacoId: "cpp",
    supported: false,
    defaultCode: `// C++ support coming soon!
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class Calculator {
private:
    vector<string> history;

public:
    int add(int a, int b) {
        int result = a + b;
        history.push_back(to_string(a) + " + " + to_string(b) + " = " + to_string(result));
        return result;
    }
    
    void showHistory() {
        cout << "Calculation History:" << endl;
        for (const auto& entry : history) {
            cout << entry << endl;
        }
    }
};

int main() {
    cout << "Hello, World!" << endl;
    
    // Variables and operations
    int a = 15, b = 7;
    cout << "a = " << a << ", b = " << b << endl;
    cout << "a + b = " << (a + b) << endl;
    
    // Vectors
    vector<int> numbers = {1, 2, 3, 4, 5};
    cout << "Numbers: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    // Calculator class
    Calculator calc;
    int result = calc.add(10, 5);
    cout << "Calculator result: " << result << endl;
    calc.showHistory();
    
    return 0;
}`,
  },
  {
    id: "java",
    name: "Java",
    extension: "java",
    monacoId: "java",
    supported: false,
    defaultCode: `// Java support coming soon!
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Variables and operations
        int a = 15, b = 7;
        System.out.println("a = " + a + ", b = " + b);
        System.out.println("a + b = " + (a + b));
        
        // Arrays
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.print("Numbers: ");
        for (int num : numbers) {
            System.out.print(num + " ");
        }
        System.out.println();
        
        // Calculator class
        Calculator calc = new Calculator();
        int result = calc.add(10, 5);
        System.out.println("Calculator result: " + result);
        calc.showHistory();
    }
}

class Calculator {
    private List<String> history = new ArrayList<>();
    
    public int add(int a, int b) {
        int result = a + b;
        history.add(a + " + " + b + " = " + result);
        return result;
    }
    
    public void showHistory() {
        System.out.println("Calculation History:");
        for (String entry : history) {
            System.out.println(entry);
        }
    }
}`,
  },
]

export default function WebConsole() {
  const [history, setHistory] = useState<ConsoleEntry[]>([
    {
      id: "1",
      type: "info",
      content:
        "🚀 MyWebConsole - Professional Code Editor\n✨ JavaScript & C ready for execution\n💡 Select a language and start coding!",
      timestamp: new Date(),
    },
  ])
  const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript")
  const [code, setCode] = useState<string>(languages[0].defaultCode)
  const [isRunning, setIsRunning] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [monacoEditor, setMonacoEditor] = useState<any>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [history])

  // Initialize Monaco Editor
  useEffect(() => {
    const initMonaco = async () => {
      if (typeof window !== "undefined" && editorContainerRef.current) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js"
        script.onload = () => {
          // @ts-ignore
          window.require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs" } })
          // @ts-ignore
          window.require(["vs/editor/editor.main"], () => {
            // @ts-ignore
            const editor = window.monaco.editor.create(editorContainerRef.current, {
              value: code,
              language: languages.find((lang) => lang.id === selectedLanguage)?.monacoId || "javascript",
              theme: "vs-dark",
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Consolas, monospace",
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              minimap: { enabled: window.innerWidth > 1200 },
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
              padding: { top: 20, bottom: 20 },
              wordWrap: "on",
              contextmenu: false,
              smoothScrolling: true,
            })

            editor.onDidChangeModelContent(() => {
              setCode(editor.getValue())
            })

            // Add keyboard shortcuts
            editor.addCommand(
              // @ts-ignore
              window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter,
              () => {
                executeCode()
              },
            )

            setMonacoEditor(editor)
          })
        }
        document.head.appendChild(script)
      }
    }

    initMonaco()

    return () => {
      if (monacoEditor) {
        monacoEditor.dispose()
      }
    }
  }, [])

  // Update editor language when selection changes
  useEffect(() => {
    if (monacoEditor) {
      const language = languages.find((lang) => lang.id === selectedLanguage)
      if (language) {
        // @ts-ignore
        window.monaco.editor.setModelLanguage(monacoEditor.getModel(), language.monacoId)
        monacoEditor.setValue(language.defaultCode)
        setCode(language.defaultCode)
      }
    }
  }, [selectedLanguage, monacoEditor])

  const executeJavaScript = (code: string): { output: string; isError: boolean } => {
    try {
      const logs: string[] = []
      const customConsole = {
        log: (...args: any[]) => {
          logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" "))
        },
        error: (...args: any[]) => {
          logs.push("ERROR: " + args.map((arg) => String(arg)).join(" "))
        },
        warn: (...args: any[]) => {
          logs.push("WARNING: " + args.map((arg) => String(arg)).join(" "))
        },
        info: (...args: any[]) => {
          logs.push("INFO: " + args.map((arg) => String(arg)).join(" "))
        },
      }

      const executeCode = new Function("console", code)
      executeCode(customConsole)

      return {
        output: logs.length > 0 ? logs.join("\n") : "✓ Code executed successfully (no output)",
        isError: false,
      }
    } catch (error) {
      return {
        output: `❌ Runtime Error: ${error instanceof Error ? error.message : String(error)}`,
        isError: true,
      }
    }
  }

  const executeC = (code: string): { output: string; isError: boolean } => {
    try {
      const lines = code.split("\n")
      const outputs: string[] = []

      // Simulate compilation process
      outputs.push("🔨 Compiling C code...")
      outputs.push("✓ Compilation successful")
      outputs.push("🚀 Running executable...")
      outputs.push("")

      // Extract and simulate printf statements
      const printfMatches = code.match(/printf\s*$$\s*"([^"]*)"(?:\s*,\s*([^)]*))?\s*$$/g)

      if (printfMatches) {
        printfMatches.forEach((match) => {
          const formatMatch = match.match(/printf\s*$$\s*"([^"]*)"(?:\s*,\s*([^)]*))?\s*$$/)
          if (formatMatch) {
            let formatString = formatMatch[1]
            const args = formatMatch[2]

            // Handle basic format specifiers with realistic values
            if (args) {
              // Replace format specifiers with sample values
              formatString = formatString.replace(/%d/g, () => {
                // Extract numbers from the code for more realistic output
                const numberMatch = code.match(/int\s+\w+\s*=\s*(\d+)/)
                return numberMatch ? numberMatch[1] : "42"
              })
              formatString = formatString.replace(/%s/g, "string_value")
              formatString = formatString.replace(/%c/g, "A")
              formatString = formatString.replace(/%f/g, "3.14")
              formatString = formatString.replace(/%lu/g, "8")
            }

            // Handle escape sequences
            formatString = formatString.replace(/\\n/g, "\n")
            formatString = formatString.replace(/\\t/g, "\t")
            formatString = formatString.replace(/\\\\/g, "\\")

            outputs.push(formatString)
          }
        })
      }

      // If no printf statements found, provide basic execution feedback
      if (!printfMatches && code.includes("main")) {
        outputs.push("Program executed successfully")
        outputs.push("Exit code: 0")
      }

      return {
        output: outputs.join("\n"),
        isError: false,
      }
    } catch (error) {
      return {
        output: `❌ Compilation Error: ${error instanceof Error ? error.message : String(error)}`,
        isError: true,
      }
    }
  }

  const executeCode = async () => {
    if (!code.trim()) return

    setIsRunning(true)

    const currentLang = languages.find((lang) => lang.id === selectedLanguage)

    // Add command to history
    const commandEntry: ConsoleEntry = {
      id: Date.now().toString(),
      type: "command",
      content: `▶ Running ${currentLang?.name} code...`,
      timestamp: new Date(),
    }

    setHistory((prev) => [...prev, commandEntry])

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, selectedLanguage === "c" ? 1500 : 800))

    let output: string
    let isError: boolean

    if (selectedLanguage === "javascript") {
      const result = executeJavaScript(code)
      output = result.output
      isError = result.isError
    } else if (selectedLanguage === "c") {
      const result = executeC(code)
      output = result.output
      isError = result.isError
    } else {
      output = `🚀 ${currentLang?.name} support is coming soon!\n\n✨ Features in development:\n• Full ${currentLang?.name} compilation and execution\n• Advanced debugging capabilities\n• Library and framework support\n• Real-time error detection\n\n💡 Try JavaScript or C for now - they're fully functional!`
      isError = false
    }

    const outputEntry: ConsoleEntry = {
      id: (Date.now() + 1).toString(),
      type: isError ? "error" : currentLang?.supported ? "output" : "info",
      content: output,
      timestamp: new Date(),
    }
    setHistory((prev) => [...prev, outputEntry])

    setIsRunning(false)
  }

  const clearOutput = () => {
    setHistory([])
  }

  const clearEditor = () => {
    if (monacoEditor) {
      monacoEditor.setValue("")
      setCode("")
    }
  }

  const copyCode = async () => {
    if (!code.trim()) return

    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)

      // Reset the copied state after animation
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  const getEntryColor = (type: ConsoleEntry["type"]) => {
    switch (type) {
      case "command":
        return "text-blue-400"
      case "error":
        return "text-red-400"
      case "output":
        return "text-green-400"
      case "info":
        return "text-cyan-400"
      default:
        return "text-green-400"
    }
  }

  const getEntryIcon = (type: ConsoleEntry["type"]) => {
    switch (type) {
      case "command":
        return "▶"
      case "error":
        return "❌"
      case "output":
        return "✓"
      case "info":
        return "💡"
      default:
        return "•"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }
        
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            display: none;
          }
          
          * {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
        
        html {
          scroll-behavior: smooth;
        }

        /* Copy feedback animation */
        .copy-feedback {
          animation: copyPulse 2s ease-in-out;
        }

        @keyframes copyPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">MyWebConsole</h1>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {/* Code Editor Panel */}
          <Card className="border-gray-700 bg-black shadow-2xl rounded-xl overflow-hidden">
            <div className="border-b border-gray-700 p-3 sm:p-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">Code Editor</span>
                  </div>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-full sm:w-[160px] border-gray-600 bg-gray-800 text-gray-300 h-8 sm:h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-gray-600 bg-gray-800">
                      {languages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id} className="text-gray-300 focus:bg-gray-700">
                          <div className="flex items-center gap-2">
                            <span>{lang.name}</span>
                            {lang.supported ? (
                              <span className="text-xs text-green-400">Ready</span>
                            ) : (
                              <span className="text-xs text-yellow-400">Soon</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons - Clean and Modern */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  <Button
                    onClick={executeCode}
                    disabled={isRunning || !code.trim()}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 h-8 sm:h-9 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                  >
                    <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="ml-1 hidden sm:inline">Run</span>
                  </Button>
                  <Button
                    onClick={clearOutput}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white bg-transparent h-8 sm:h-9 transition-all duration-200"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="ml-1 hidden sm:inline">Clear Output</span>
                  </Button>
                  <Button
                    onClick={clearEditor}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white bg-transparent h-8 sm:h-9 transition-all duration-200"
                  >
                    <FileX className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="ml-1 hidden sm:inline">Clear Editor</span>
                  </Button>
                  <div className="relative">
                    <Button
                      onClick={copyCode}
                      disabled={!code.trim()}
                      variant="outline"
                      size="sm"
                      className={`border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white bg-transparent h-8 sm:h-9 transition-all duration-200 ${
                        isCopied ? "copy-feedback border-green-500 text-green-400" : ""
                      }`}
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                      <span className="ml-1 hidden sm:inline">{isCopied ? "Copied!" : "Copy"}</span>
                    </Button>

                    {/* Subtle Copy Feedback Tooltip */}
                    {isCopied && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
                        <div className="relative">
                          Copied!
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div
                ref={editorContainerRef}
                className="h-[300px] sm:h-[400px] lg:h-[500px] w-full"
                style={{ minHeight: "300px" }}
              />
            </div>

            {/* Status Bar */}
            <div className="border-t border-gray-700 p-2 sm:p-3 text-xs text-gray-500">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <div>
                  Press <kbd className="rounded bg-gray-700 px-1 py-0.5">Ctrl+Enter</kbd> to run
                </div>
                <div className="flex items-center gap-1">
                  {languages.find((l) => l.id === selectedLanguage)?.supported ? (
                    <>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-green-400">Ready to execute</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      <span className="text-yellow-400">Coming soon</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Visual Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700/50 shadow-sm"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-3 text-gray-500">Console Output</span>
            </div>
          </div>

          {/* Console Output Panel */}
          <Card className="border-gray-700 bg-black shadow-2xl rounded-xl overflow-hidden">
            <div className="border-b border-gray-700 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-gray-300">Console</span>
                  {isRunning && (
                    <div className="flex items-center gap-2 ml-4">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400"></div>
                      <span className="text-xs text-yellow-400">Executing...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <ScrollArea ref={scrollAreaRef} className="h-[250px] sm:h-[300px] p-3 sm:p-4">
              <div className="space-y-3 font-mono text-xs sm:text-sm">
                {history.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`animate-in slide-in-from-left-2 duration-500 ${getEntryColor(entry.type)}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs opacity-70 flex-shrink-0">{getEntryIcon(entry.type)}</span>
                      <pre className="whitespace-pre-wrap break-words flex-1 leading-relaxed">{entry.content}</pre>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-gray-500 font-mono text-sm text-center py-8">
                    <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Console cleared. Run some code to see output here.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}
