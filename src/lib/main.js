// src/lib/main.js
// Main UI glue for offline LocalMind enhancements:
// - Load local GGUF model files via gguf_loader.js
// - Simple Pyodide sandbox for code execution (placeholder)

import { loadLocalGGUFModel } from "./gguf_loader.js";

// Helper to create a status message area
function setStatus(message) {
  const statusEl = document.getElementById("offline-status");
  if (statusEl) statusEl.textContent = message;
}

// Model loading UI
function initModelLoader() {
  const fileInput = document.getElementById("gguf-file-input");
  const loadBtn = document.getElementById("gguf-load-btn");
  const modelInfo = document.getElementById("gguf-model-info");

  let modelInstance = null;

  loadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      setStatus("Please select a GGUF model file.");
      return;
    }
    setStatus("Loading model…");
    try {
      modelInstance = await loadLocalGGUFModel(file);
      modelInfo.textContent = `Model loaded (${file.name}, ${file.size / 1024 | 0} KB)`;
      setStatus("Model ready.");
    } catch (e) {
      console.error(e);
      setStatus(`Error loading model: ${e.message}`);
    }
  });

  // Simple demo: generate button to test model.generate
  const generateBtn = document.getElementById("gguf-generate-btn");
  const promptInput = document.getElementById("gguf-prompt");
  const outputDiv = document.getElementById("gguf-output");
  generateBtn.addEventListener("click", async () => {
    if (!modelInstance) {
      setStatus("Load a model first.");
      return;
    }
    const prompt = promptInput.value;
    setStatus("Generating…");
    try {
      const result = await modelInstance.generate(prompt);
      outputDiv.textContent = result;
      setStatus("Done.");
    } catch (e) {
      console.error(e);
      setStatus(`Generation error: ${e.message}`);
    }
  });
}

// Pyodide sandbox (very minimal placeholder)
async function initPyodideSandbox() {
  const pyodideStatus = document.getElementById("pyodide-status");
  const runBtn = document.getElementById("pyodide-run-btn");
  const codeInput = document.getElementById("pyodide-code");
  const resultDiv = document.getElementById("pyodide-result");

  // Load Pyodide from a local path – user must host pyodide files under /lib/pyodide/
  let pyodide = null;
  try {
    pyodideStatus.textContent = "Loading Pyodide…";
    pyodide = await loadPyodide({
      indexURL: "./lib/pyodide/",
    });
    pyodideStatus.textContent = "Pyodide ready.";
  } catch (e) {
    console.error(e);
    pyodideStatus.textContent = "Failed to load Pyodide.";
    return;
  }

  runBtn.addEventListener("click", async () => {
    const code = codeInput.value;
    try {
      const res = await pyodide.runPythonAsync(code);
      resultDiv.textContent = String(res);
    } catch (err) {
      resultDiv.textContent = `Error: ${err}`;
    }
  });
}

// Initialise everything when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  initModelLoader();
  initPyodideSandbox();
});
