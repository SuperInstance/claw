<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: Record<string, any>
  components: {
    schemas: Record<string, any>
    parameters: Record<string, any>
  }
}

const props = defineProps<{
  specUrl?: string
}>()

// State
const apiSpec = ref<OpenAPISpec | null>(null)
const selectedServer = ref(0)
const apiKey = ref('')
const selectedPath = ref('')
const selectedMethod = ref('')
const requestBody = ref('{}')
const requestParams = ref<Record<string, string>>({})
const responseBody = ref('')
const responseStatus = ref('')
const responseTime = ref('')
const isLoading = ref(false)
const selectedTab = ref('params')

// Load OpenAPI spec
const loadSpec = async () => {
  if (!props.specUrl) return

  try {
    const response = await fetch(props.specUrl)
    apiSpec.value = await response.json()
  } catch (error) {
    console.error('Failed to load OpenAPI spec:', error)
  }
}

// Computed properties
const currentServer = computed(() => {
  if (!apiSpec.value) return ''
  return apiSpec.value.servers[selectedServer.value]?.url || ''
})

const paths = computed(() => {
  if (!apiSpec.value) return []
  return Object.entries(apiSpec.value.paths).map(([path, methods]) => ({
    path,
    methods: Object.entries(methods).map(([method, spec]: [string, any]) => ({
      method: method.toUpperCase(),
      spec
    }))
  }))
})

const currentEndpoint = computed(() => {
  if (!selectedPath.value || !selectedMethod.value || !apiSpec.value) return null
  return apiSpec.value.paths[selectedPath.value][selectedMethod.value.toLowerCase()]
})

const endpointParams = computed(() => {
  if (!currentEndpoint.value) return []
  return currentEndpoint.value?.parameters || []
})

const hasRequestBody = computed(() => {
  return ['POST', 'PUT', 'PATCH'].includes(selectedMethod.value) &&
         currentEndpoint.value?.requestBody
})

// Methods
const selectEndpoint = (path: string, method: string) => {
  selectedPath.value = path
  selectedMethod.value = method
  requestBody.value = '{}'
  requestParams.value = {}
  responseBody.value = ''

  // Load example request body if available
  const endpoint = currentEndpoint.value
  if (endpoint?.requestBody?.content?.['application/json']?.example) {
    requestBody.value = JSON.stringify(
      endpoint.requestBody.content['application/json'].example,
      null,
      2
    )
  }
}

const buildUrl = (): string => {
  if (!selectedPath.value) return ''

  let url = selectedPath.value

  // Replace path parameters
  const pathParams = endpointParams.value.filter((p: any) => p.in === 'path')
  pathParams.forEach((param: any) => {
    const value = requestParams.value[param.name] || `{${param.name}}`
    url = url.replace(`{${param.name}}`, value)
  })

  // Add query parameters
  const queryParams = endpointParams.value.filter((p: any) => p.in === 'query')
  const queryParamsString = queryParams
    .filter((p: any) => requestParams.value[p.name])
    .map((p: any) => `${p.name}=${encodeURIComponent(requestParams.value[p.name])}`)
    .join('&')

  if (queryParamsString) {
    url += `?${queryParamsString}`
  }

  return currentServer.value + url
}

const executeRequest = async () => {
  if (!apiKey.value) {
    alert('Please enter your API key first')
    return
  }

  if (!selectedPath.value) return

  isLoading.value = true
  const startTime = Date.now()

  try {
    const url = buildUrl()
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey.value}`,
      'Content-Type': 'application/json'
    }

    const options: RequestInit = {
      method: selectedMethod.value,
      headers
    }

    if (hasRequestBody.value && requestBody.value !== '{}') {
      options.body = requestBody.value
    }

    const response = await fetch(url, options)
    const text = await response.text()

    try {
      const data = JSON.parse(text)
      responseBody.value = JSON.stringify(data, null, 2)
    } catch {
      responseBody.value = text
    }

    responseStatus.value = response.status.toString()
    responseTime.value = `${Date.now() - startTime}ms`
  } catch (error) {
    responseBody.value = JSON.stringify({
      error: (error as Error).message
    }, null, 2)
    responseStatus.value = 'Error'
    responseTime.value = `${Date.now() - startTime}ms`
  } finally {
    isLoading.value = false
  }
}

const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: '#61affe',
    POST: '#49cc90',
    PUT: '#fca130',
    PATCH: '#50e3c2',
    DELETE: '#f93e3e'
  }
  return colors[method] || '#6c757d'
}

onMounted(() => {
  loadSpec()
  const savedKey = localStorage.getItem('superinstance_api_key')
  if (savedKey) {
    apiKey.value = savedKey
  }
})

const saveApiKey = () => {
  localStorage.setItem('superinstance_api_key', apiKey.value)
}
</script>

<template>
  <div class="openapi-explorer">
    <!-- Server Selection -->
    <div v-if="apiSpec?.servers" class="server-section">
      <h3>API Server</h3>
      <div class="server-selector">
        <select v-model="selectedServer" @change="selectedPath = ''">
          <option v-for="(server, index) in apiSpec.servers" :key="index" :value="index">
            {{ server.description || server.url }}
          </option>
        </select>
        <code>{{ currentServer }}</code>
      </div>
    </div>

    <!-- Authentication -->
    <div class="auth-section">
      <h3>Authentication</h3>
      <div class="api-key-input">
        <label for="api-key">API Key:</label>
        <input
          id="api-key"
          v-model="apiKey"
          type="password"
          placeholder="Enter your API key"
          @blur="saveApiKey"
        />
        <button @click="saveApiKey" class="save-btn">Save</button>
      </div>
      <p class="hint">
        Your API key is stored locally in your browser and never sent to our servers.
      </p>
    </div>

    <!-- Endpoints -->
    <div class="endpoints-section">
      <h3>API Endpoints</h3>
      <div class="endpoints-list">
        <div v-for="item in paths" :key="item.path" class="path-item">
          <div class="path">{{ item.path }}</div>
          <div class="methods">
            <button
              v-for="endpoint in item.methods"
              :key="endpoint.method"
              :class="['method-btn', endpoint.method.toLowerCase(), {
                active: selectedPath === item.path && selectedMethod === endpoint.method
              }]"
              :style="{ borderColor: getMethodColor(endpoint.method) }"
              @click="selectEndpoint(item.path, endpoint.method)"
            >
              <span
                class="method-badge"
                :style="{ backgroundColor: getMethodColor(endpoint.method) }"
              >
                {{ endpoint.method }}
              </span>
              <span class="summary">{{ endpoint.spec.summary || endpoint.spec.description }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Builder -->
    <div v-if="currentEndpoint" class="request-section">
      <div class="request-header">
        <h3>{{ currentEndpoint.summary || 'Request Builder' }}</h3>
        <p v-if="currentEndpoint.description" class="description">
          {{ currentEndpoint.description }}
        </p>
      </div>

      <!-- URL Display -->
      <div class="url-display">
        <span
          class="method-badge"
          :style="{ backgroundColor: getMethodColor(selectedMethod) }"
        >
          {{ selectedMethod }}
        </span>
        <code class="url">{{ buildUrl() }}</code>
        <button @click="executeRequest" :disabled="isLoading" class="execute-btn">
          {{ isLoading ? 'Sending...' : 'Send Request' }}
        </button>
      </div>

      <!-- Tabs -->
      <div class="request-tabs">
        <button
          :class="{ active: selectedTab === 'params' }"
          @click="selectedTab = 'params'"
          :disabled="endpointParams.length === 0"
        >
          Parameters
        </button>
        <button
          :class="{ active: selectedTab === 'body' }"
          @click="selectedTab = 'body'"
          :disabled="!hasRequestBody"
        >
          Request Body
        </button>
        <button
          :class="{ active: selectedTab === 'headers' }"
          @click="selectedTab = 'headers'"
        >
          Headers
        </button>
        <button
          :class="{ active: selectedTab === 'response' }"
          @click="selectedTab = 'response'"
          :disabled="!responseBody"
        >
          Response
        </button>
      </div>

      <!-- Parameters Tab -->
      <div v-if="selectedTab === 'params'" class="tab-content">
        <div v-if="endpointParams.length === 0" class="empty-state">
          No parameters for this endpoint
        </div>
        <div v-else class="params-list">
          <div v-for="param in endpointParams" :key="param.name" class="param-item">
            <label>
              <span class="param-name">{{ param.name }}</span>
              <span v-if="param.required" class="required-badge">required</span>
              <span class="param-type">{{ param.schema?.type || 'string' }}</span>
            </label>
            <input
              v-model="requestParams[param.name]"
              :type="param.schema?.type === 'number' ? 'number' : 'text'"
              :placeholder="param.schema?.example || `Enter ${param.name}`"
              :required="param.required"
            />
            <p v-if="param.description" class="param-description">
              {{ param.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Body Tab -->
      <div v-if="selectedTab === 'body'" class="tab-content">
        <div v-if="!hasRequestBody" class="empty-state">
          No request body for this endpoint
        </div>
        <div v-else class="body-editor">
          <textarea
            v-model="requestBody"
            class="code-editor"
            placeholder='{"key": "value"}'
            spellcheck="false"
          ></textarea>
          <div class="body-info">
            <p><strong>Content-Type:</strong> application/json</p>
            <p v-if="currentEndpoint.requestBody?.description">
              <strong>Description:</strong> {{ currentEndpoint.requestBody.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Headers Tab -->
      <div v-if="selectedTab === 'headers'" class="tab-content">
        <div class="headers-list">
          <div class="header-item">
            <code>Authorization</code>
            <span>Bearer {{ apiKey ? '***' : 'YOUR_API_KEY' }}</span>
          </div>
          <div class="header-item">
            <code>Content-Type</code>
            <span>application/json</span>
          </div>
        </div>
      </div>

      <!-- Response Tab -->
      <div v-if="selectedTab === 'response'" class="tab-content">
        <div class="response-meta">
          <span class="status-badge" :class="{
            success: responseStatus.startsWith('2'),
            error: !responseStatus.startsWith('2') && responseStatus !== ''
          }">
            {{ responseStatus || 'No response' }}
          </span>
          <span v-if="responseTime" class="response-time">{{ responseTime }}</span>
        </div>
        <pre v-if="responseBody" class="response-body">{{ responseBody }}</pre>
        <div v-else class="empty-state">
          Send a request to see the response
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.openapi-explorer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 0;
}

.server-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.server-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.server-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.server-selector select {
  padding: 0.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.server-selector code {
  padding: 0.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  font-size: 0.85rem;
  display: block;
}

.auth-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.auth-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.api-key-input {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.api-key-input label {
  font-weight: 600;
  min-width: 70px;
}

.api-key-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  font-size: 0.9rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.save-btn {
  padding: 0.5rem 1rem;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  background: var(--vp-c-brand-dark);
}

.hint {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.endpoints-section {
  margin-bottom: 2rem;
}

.endpoints-section h3 {
  margin-bottom: 1rem;
}

.endpoints-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.path-item {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1rem;
}

.path-item .path {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.methods {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.method-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: all 0.2s;
}

.method-btn:hover {
  border-color: var(--vp-c-brand);
}

.method-btn.active {
  background: var(--vp-c-brand);
  color: white;
}

.method-badge {
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: white;
}

.summary {
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
}

.request-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.request-header h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.description {
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}

.url-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
}

.method-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: white;
  white-space: nowrap;
}

.url {
  flex: 1;
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
  word-break: break-all;
}

.execute-btn {
  padding: 0.5rem 1.5rem;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.execute-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
}

.execute-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.request-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-border);
}

.request-tabs button {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.request-tabs button:hover:not(:disabled) {
  color: var(--vp-c-brand);
}

.request-tabs button.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}

.request-tabs button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-content {
  min-height: 200px;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-text-2);
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.param-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.param-name {
  color: var(--vp-c-text-1);
}

.required-badge {
  padding: 0.15rem 0.5rem;
  background: #f93e3e;
  color: white;
  border-radius: 3px;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.param-type {
  padding: 0.15rem 0.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 3px;
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--vp-c-text-2);
}

.param-item input {
  padding: 0.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  font-size: 0.9rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.param-description {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.body-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.code-editor {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.9rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  resize: vertical;
}

.body-info {
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
}

.body-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.headers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.header-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
}

.header-item code {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--vp-c-brand);
  min-width: 150px;
}

.header-item span {
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.response-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-badge.success {
  background: #49cc90;
  color: white;
}

.status-badge.error {
  background: #f93e3e;
  color: white;
}

.response-time {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.response-body {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
  margin: 0;
  max-height: 500px;
  overflow-y: auto;
}
</style>
