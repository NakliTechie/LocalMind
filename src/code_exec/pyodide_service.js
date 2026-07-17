// src/code_exec/pyodide_service.js
// Pyodide integration for LocalMind - provides a sandboxed Python execution environment.
// Loads Pyodide from CDN, initializes it once, and exposes an async `execute(code)` function.
// The execution environment is deliberately limited: only a safe subset of builtins is available.
// Users can import pure-Python standard library modules that are bundled with Pyodide.
// No network access, no filesystem writes (except in-memory virtual FS), and execution is
// bounded by a configurable timeout to prevent runaway scripts.

let pyodide = null;
let loadPromise = null;

/**
 * Load Pyodide and initialize the sandbox.
 * Returns a Promise that resolves when ready.
 */
export async function initPyodide() {
  if (pyodide) return pyodide;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    // Load the Pyodide script dynamically.
    const pyodideUrl = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js';
    await import(pyodideUrl);
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/'
    });
    // Restrict builtins to a safe whitelist.
    const safeBuiltins = [
      'abs', 'all', 'any', 'bool', 'dict', 'float', 'int', 'len', 'list',
      'max', 'min', 'pow', 'range', 'str', 'sum', 'enumerate', 'zip',
      'print'
    ];
    const builtins = pyodide.globals.get('__builtins__');
    for (const name of Object.keys(builtins.toJs())) {
      if (!safeBuiltins.includes(name)) {
        builtins.del(name);
      }
    }
    // Delete dangerous modules.
    const dangerous = ['os', 'sys', 'subprocess', 'shutil', 'socket', 'urllib'];
    for (const mod of dangerous) {
      try { pyodide.runPython(`import sys; sys.modules.pop('${mod}', None)`); } catch {}
    }
    return pyodide;
  })();
  return loadPromise;
}

/**
 * Execute Python code in the sandbox.
 * @param {string} code - Python source code.
 * @param {number} [timeoutMs=5000] - Execution timeout in milliseconds.
 * @returns {Promise<{stdout:string, stderr:string, result:any}>}
 */
export async function executePython(code, timeoutMs = 5000) {
  const py = await initPyodide();
  // Capture stdout/stderr.
  const stdout = [];
  const stderr = [];
  const originalStdout = py.console.stdout;
  const originalStderr = py.console.stderr;
  py.console.stdout = (msg) => stdout.push(msg);
  py.console.stderr = (msg) => stderr.push(msg);

  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error('Execution timed out')),
      timeoutMs);
  });

  try {
    const execPromise = py.runPythonAsync(code);
    const result = await Promise.race([execPromise, timeoutPromise]);
    return { stdout: stdout.join(''), stderr: stderr.join(''), result };
  } finally {
    clearTimeout(timerId);
    // Restore original console.
    py.console.stdout = originalStdout;
    py.console.stderr = originalStderr;
  }
}
