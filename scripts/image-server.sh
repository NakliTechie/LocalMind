#!/usr/bin/env bash
# image-server.sh — run a local image-generation server for LocalMind's Image mode.
#
# LocalMind's "Local server" image engine talks to stable-diffusion.cpp's `sd-server`
# (https://github.com/leejet/stable-diffusion.cpp). This script gets you one running:
#
#   1. finds `sd-server` on PATH, or downloads the prebuilt release for this platform
#      into ./.cache/sdcpp (macOS arm64 = Metal, Linux x86_64 = CPU or Vulkan, Windows = CUDA/Vulkan/CPU)
#   2. takes your model files as flags or env vars — or, with none given, downloads a stock
#      Qwen-Image 2.1 recipe with the `hf` CLI (about 10 GB: Q4_K diffusion model, Qwen3-VL-8B
#      Q4_K_M text encoder + its mmproj, and the 2.1 VAE)
#   3. starts the server on 127.0.0.1:7860 with CORS enabled. Then in LocalMind pick
#      Image → Model "Local server", leave the URL at http://127.0.0.1:7860, and Send a prompt.
#
# Any model sd.cpp supports works the same way (FLUX.2, Z-Image, Qwen-Image, SD3, …):
#
#   scripts/image-server.sh --dit path/to/model.gguf --vae path/to/vae.safetensors --llm path/to/text-encoder.gguf
#
# Flags / env:
#   --dit  PATH   | SD_DIT          diffusion model (.gguf or .safetensors)      [required, or use the stock download]
#   --vae  PATH   | SD_VAE          VAE
#   --llm  PATH   | SD_LLM          text encoder / LLM (Qwen-Image, Z-Image, FLUX.2 …)
#   --llm-vision PATH | SD_LLM_VISION  the encoder's vision projector (mmproj); needed for image editing only
#   --port N      | SD_PORT         listen port (default 7860)
#   --steps N     | SD_STEPS        default sample steps (default 20; LocalMind sends its own per request)
#   --cfg X       | SD_CFG          default CFG scale (default 6.0 — Qwen-Image 2.1's documented setting)
#   --models-dir DIR | SD_MODELS_DIR  where the stock download lands (default ~/.cache/localmind/image-models)
#   --dry-run                        print the sd-server command and exit
#   any further arguments are passed straight to sd-server (e.g. --offload-to-cpu, --fa, -t 8)
#
# Licences: the Qwen-Image 2.1 diffusion weights are under the Qwen Research Licence
# (non-commercial by default); Qwen3-VL-8B-Instruct is Apache-2.0. Check before shipping anything.
set -euo pipefail

DIT="${SD_DIT:-}"; VAE="${SD_VAE:-}"; LLM="${SD_LLM:-}"; LLM_VISION="${SD_LLM_VISION:-}"
PORT="${SD_PORT:-7860}"; STEPS="${SD_STEPS:-20}"; CFG="${SD_CFG:-6.0}"
MODELS_DIR="${SD_MODELS_DIR:-$HOME/.cache/localmind/image-models}"
DRY=0; EXTRA=()
while [ $# -gt 0 ]; do
  case "$1" in
    --dit) DIT="$2"; shift 2;;  --vae) VAE="$2"; shift 2;;  --llm) LLM="$2"; shift 2;;
    --llm-vision) LLM_VISION="$2"; shift 2;;  --port) PORT="$2"; shift 2;;
    --steps) STEPS="$2"; shift 2;;  --cfg) CFG="$2"; shift 2;;  --models-dir) MODELS_DIR="$2"; shift 2;;
    --dry-run) DRY=1; shift;;  -h|--help) sed -n '2,32p' "$0"; exit 0;;
    *) EXTRA+=("$1"); shift;;
  esac
done

HERE="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="$HERE/.cache/sdcpp"

# ── 1. sd-server ────────────────────────────────────────────────────────────────
find_sd_server() {
  if [ -n "${SD_SERVER:-}" ] && [ -x "$SD_SERVER" ]; then echo "$SD_SERVER"; return; fi
  if command -v sd-server >/dev/null 2>&1; then command -v sd-server; return; fi
  if [ -x "$CACHE/sd-server" ]; then echo "$CACHE/sd-server"; return; fi
  echo ""
}
SD="$(find_sd_server)"
if [ -z "$SD" ]; then
  os="$(uname -s)"; arch="$(uname -m)"
  case "$os-$arch" in
    Darwin-arm64) pat="Darwin-macOS-.*-arm64";;
    Linux-x86_64) pat="Linux-Ubuntu-.*-x86_64${SD_LINUX_FLAVOUR:+-$SD_LINUX_FLAVOUR}.zip"; [ -z "${SD_LINUX_FLAVOUR:-}" ] && pat="Linux-Ubuntu-[0-9.]*-x86_64.zip";;
    *) echo "No prebuilt sd-server for $os-$arch. Build stable-diffusion.cpp from source and put sd-server on PATH (or set SD_SERVER=/path/to/sd-server)."; exit 1;;
  esac
  echo "sd-server not found — downloading the latest stable-diffusion.cpp release for $os-$arch …"
  mkdir -p "$CACHE"
  api="https://api.github.com/repos/leejet/stable-diffusion.cpp/releases/latest"
  url="$(curl -fsSL "$api" | grep -o '"browser_download_url": *"[^"]*"' | grep -E "$pat" | head -1 | sed 's/.*"\(https[^"]*\)"/\1/')"
  [ -n "$url" ] || { echo "Could not find a release asset matching $pat at $api"; exit 1; }
  curl -fL "$url" -o "$CACHE/sd.zip"
  ( cd "$CACHE" && unzip -oq sd.zip && rm sd.zip )
  chmod +x "$CACHE/sd-server" "$CACHE/sd-cli" 2>/dev/null || true
  SD="$CACHE/sd-server"
  [ -x "$SD" ] || { echo "Download unpacked but no sd-server inside $CACHE"; exit 1; }
  echo "  → $SD"
fi

# ── 2. models ───────────────────────────────────────────────────────────────────
if [ -z "$DIT" ]; then
  command -v hf >/dev/null 2>&1 || { echo "No --dit given and no 'hf' CLI to download the stock recipe: pip install -U huggingface_hub  (or pass --dit/--vae/--llm)"; exit 1; }
  echo "No model given — downloading the stock Qwen-Image 2.1 recipe (~10 GB) into $MODELS_DIR …"
  if [ "$DRY" = 1 ]; then
    echo "  (dry run) would fetch: leejet/Qwen-Image-2.1-GGUF qwen_image_2.1-Q4_K.gguf · Comfy-Org/Qwen-Image-2.1 vae/qwen_image_2.1_vae_bf16.safetensors · Qwen/Qwen3-VL-8B-Instruct-GGUF Qwen3VL-8B-Instruct-Q4_K_M.gguf + mmproj-Qwen3VL-8B-Instruct-F16.gguf"
    exit 0
  fi
  mkdir -p "$MODELS_DIR"
  dl() { hf download "$1" "$2" --local-dir "$MODELS_DIR/$3" >/dev/null; echo "$MODELS_DIR/$3/$2"; }
  DIT="$(dl leejet/Qwen-Image-2.1-GGUF qwen_image_2.1-Q4_K.gguf qwen-image-2.1)"
  VAE="${VAE:-$(dl Comfy-Org/Qwen-Image-2.1 vae/qwen_image_2.1_vae_bf16.safetensors qwen-image-2.1)}"
  LLM="${LLM:-$(dl Qwen/Qwen3-VL-8B-Instruct-GGUF Qwen3VL-8B-Instruct-Q4_K_M.gguf qwen3-vl-8b)}"
  LLM_VISION="${LLM_VISION:-$(dl Qwen/Qwen3-VL-8B-Instruct-GGUF mmproj-Qwen3VL-8B-Instruct-F16.gguf qwen3-vl-8b)}"
fi
for f in "$DIT" ${VAE:+"$VAE"} ${LLM:+"$LLM"} ${LLM_VISION:+"$LLM_VISION"}; do
  [ -f "$f" ] || { echo "Model file not found: $f"; exit 1; }
done

# ── 3. serve ────────────────────────────────────────────────────────────────────
CMD=("$SD" --diffusion-model "$DIT" --listen-ip 127.0.0.1 --listen-port "$PORT" --steps "$STEPS" --cfg-scale "$CFG")
[ -n "$VAE" ] && CMD+=(--vae "$VAE")
[ -n "$LLM" ] && CMD+=(--llm "$LLM")
[ -n "$LLM_VISION" ] && CMD+=(--llm_vision "$LLM_VISION")
[ ${#EXTRA[@]} -gt 0 ] && CMD+=("${EXTRA[@]}")
echo "sd-server: ${CMD[*]}"
echo "LocalMind: Image → Model 'Local server' → http://127.0.0.1:$PORT"
[ "$DRY" = 1 ] && exit 0
exec "${CMD[@]}"
