#!/bin/bash
# Phase 2: Extension Removal Script
# This script removes channel integrations and unused extensions

set -e

cd "$(dirname "$0")/../.."

echo "========================================"
echo "Phase 2: Extension Removal"
echo "========================================"

# Channel Integrations (REMOVE - 40+ extensions)
CHANNEL_EXTENSIONS=(
    "discord"
    "telegram"
    "slack"
    "whatsapp"
    "signal"
    "imessage"
    "feishu"
    "googlechat"
    "msteams"
    "mattermost"
    "matrix"
    "irc"
    "nextcloud-talk"
    "synology-chat"
    "bluebubbles"
    "zalo"
    "zalouser"
    "line"
    "twitch"
    "nostr"
    "tlon"
    "byteplus"
    "volcengine"
    "xiaomi"
)

# Unused Model Providers (REMOVE)
UNUSED_MODEL_PROVIDERS=(
    "kilocode"
    "kimi-coding"
    "moonshot"
    "minimax"
    "minimax-portal-auth"
    "modelstudio"
    "qianfan"
    "qwen-portal-auth"
    "github-copilot"
    "venice"
    "zai"
    "xai"
    "synthetic"
)

# Utility Extensions (REMOVE or INTEGRATE)
UTILITY_EXTENSIONS=(
    "copilot-proxy"
    "device-pair"
    "diagnostics-otel"
    "diffs"
    "llm-task"
    "lobster"
    "phone-control"
    "acpx"
    "open-prose"
    "thread-ownership"
    "voice-call"
    "talk-voice"
)

# Model Gateway Extensions (REMOVE - keep core providers only)
GATEWAY_EXTENSIONS=(
    "vercel-ai-gateway"
)

# Local Model Extensions (EVALUATE)
LOCAL_EXTENSIONS=(
    "sglang"
    "vllm"
)

# Extensions to KEEP (Core Model Providers)
KEEP_EXTENSIONS=(
    "openai"
    "anthropic"
    "google"
    "mistral"
    "ollama"
    "deepseek"
    "cloudflare-ai-gateway"
    "huggingface"
    "openrouter"
    "perplexity"
    "together"
    "brave"
    "nvidia"
    "opencode"
    "opencode-go"
    "memory-core"  # Will convert to equipment
    "test-utils"   # For testing
    "shared"       # Shared utilities
)

echo ""
echo "Extensions to REMOVE:"
echo "====================="
echo "Channel Integrations: ${#CHANNEL_EXTENSIONS[@]}"
echo "Unused Model Providers: ${#UNUSED_MODEL_PROVIDERS[@]}"
echo "Utility Extensions: ${#UTILITY_EXTENSIONS[@]}"
echo "Gateway Extensions: ${#GATEWAY_EXTENSIONS[@]}"
echo "Local Extensions: ${#LOCAL_EXTENSIONS[@]}"
echo ""
echo "Total to Remove: $((${#CHANNEL_EXTENSIONS[@]} + ${#UNUSED_MODEL_PROVIDERS[@]} + ${#UTILITY_EXTENSIONS[@]} + ${#GATEWAY_EXTENSIONS[@]}))"
echo ""
echo "Extensions to KEEP: ${#KEEP_EXTENSIONS[@]}"
echo ""

# Confirm before proceeding
read -p "Proceed with removal? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Removing Channel Integrations..."
for ext in "${CHANNEL_EXTENSIONS[@]}"; do
    if [ -d "extensions/$ext" ]; then
        echo "  Removing: $ext"
        rm -rf "extensions/$ext"
    else
        echo "  Skipped (not found): $ext"
    fi
done

echo ""
echo "Removing Unused Model Providers..."
for ext in "${UNUSED_MODEL_PROVIDERS[@]}"; do
    if [ -d "extensions/$ext" ]; then
        echo "  Removing: $ext"
        rm -rf "extensions/$ext"
    else
        echo "  Skipped (not found): $ext"
    fi
done

echo ""
echo "Removing Utility Extensions..."
for ext in "${UTILITY_EXTENSIONS[@]}"; do
    if [ -d "extensions/$ext" ]; then
        echo "  Removing: $ext"
        rm -rf "extensions/$ext"
    else
        echo "  Skipped (not found): $ext"
    fi
done

echo ""
echo "Removing Gateway Extensions..."
for ext in "${GATEWAY_EXTENSIONS[@]}"; do
    if [ -d "extensions/$ext" ]; then
        echo "  Removing: $ext"
        rm -rf "extensions/$ext"
    else
        echo "  Skipped (not found): $ext"
    fi
done

echo ""
echo "Removing Local Model Extensions..."
for ext in "${LOCAL_EXTENSIONS[@]}"; do
    if [ -d "extensions/$ext" ]; then
        echo "  Removing: $ext"
        rm -rf "extensions/$ext"
    else
        echo "  Skipped (not found): $ext"
    fi
done

echo ""
echo "Removing memory-lancedb (using simple storage instead)..."
if [ -d "extensions/memory-lancedb" ]; then
    rm -rf "extensions/memory-lancedb"
fi

echo ""
echo "========================================"
echo "Extension Removal Complete!"
echo "========================================"
echo ""
echo "Remaining extensions:"
ls -1 extensions/
echo ""
echo "Next steps:"
echo "1. Update package.json dependencies"
echo "2. Update tsconfig.json paths"
echo "3. Update vitest.config.ts"
echo "4. Test TypeScript compilation"
