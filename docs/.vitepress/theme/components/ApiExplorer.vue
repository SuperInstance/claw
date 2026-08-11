<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// API endpoint definitions
const apiEndpoints = [
  {
    category: 'Spreadsheets',
    endpoints: [
      { method: 'GET', path: '/v1/spreadsheets', description: 'List all spreadsheets' },
      { method: 'POST', path: '/v1/spreadsheets', description: 'Create a new spreadsheet' },
      { method: 'GET', path: '/v1/spreadsheets/:id', description: 'Get spreadsheet details' },
      { method: 'PUT', path: '/v1/spreadsheets/:id', description: 'Update spreadsheet' },
      { method: 'DELETE', path: '/v1/spreadsheets/:id', description: 'Delete spreadsheet' }
    ]
  },
  {
    category: 'Cells',
    endpoints: [
      { method: 'GET', path: '/v1/spreadsheets/:id/cells', description: 'Get cells' },
      { method: 'POST', path: '/v1/spreadsheets/:id/cells', description: 'Update cell' },
      { method: 'POST', path: '/v1/spreadsheets/:id/cells/batch', description: 'Batch update cells' },
      { method: 'DELETE', path: '/v1/spreadsheets/:id/cells/:cellId', description: 'Delete cell' }
    ]
  },
  {
    category: 'Formulas',
    endpoints: [
      { method: 'POST', path: '/v1/spreadsheets/:id/calculate', description: 'Execute formula' },
      { method: 'GET', path: '/v1/spreadsheets/:id/formulas', description: 'List formulas' },
      { method: 'POST', path: '/v1/spreadsheets/:id/formulas', description: 'Add formula' }
    ]
  },
  {
    category: 'Webhooks',
    endpoints: [
      { method: 'GET', path: '/v1/webhooks', description: 'List webhooks' },
      { method: 'POST', path: '/v1/webhooks', description: 'Create webhook' },
      { method: 'GET', path: '/v1/webhooks/:id', description: 'Get webhook details' },
      { method: 'DELETE', path: '/v1/webhooks/:id', description: 'Delete webhook' }
    ]
  }
]

const exampleRequests = {
  'POST /v1/spreadsheets': {
    name: 'Sales Data 2024',
    rows: 100,
    columns: 10,
    description: 'Monthly sales tracking'
  },
  'POST /v1/spreadsheets/:id/cells': {
    cellId: 'A1',
    value: 'Revenue',
    format: {
      bold: true,
      backgroundColor: '#4CAF50'
    }
  },
  'POST /v1/spreadsheets/:id/cells/batch': {
    updates: [
      { cellId: 'A1', value: 'Product' },
      { cellId: 'B1', value: 'Price' },
      { cellId: 'C1', value: 'Quantity' },
      { cellId: 'D1', value: 'Total' }
    ]
  },
  'POST /v1/spreadsheets/:id/calculate': {
    formula: '=SUM(A1:A10)',
    range: 'A1:A10'
  },
  'POST /v1/webhooks': {
    url: 'https://your-app.com/webhooks/spreadsheet',
    events: ['cell.changed', 'row.added'],
    spreadsheetId: 'sheet_abc123',
    secret: 'your_webhook_secret'
  }
}

// State
const apiKey = ref('')
const selectedEndpoint = ref('')
const requestBody = ref('')
const requestHeaders = ref('{"Authorization": "Bearer YOUR_API_KEY", "Content-Type": "application/json"}')
const responseBody = ref('')
const responseStatus = ref('')
const responseTime = ref('')
const isLoading = ref(false)
const selectedTab = ref('headers')
const codeLanguage = ref('javascript')

// Computed
const currentEndpoint = computed(() => {
  if (!selectedEndpoint.value) return null
  for (const category of apiEndpoints) {
    const endpoint = category.endpoints.find(
      e => `${e.method} ${e.path}` === selectedEndpoint.value
    )
    if (endpoint) return endpoint
  }
  return null
})

const generatedCode = computed(() => {
  if (!currentEndpoint.value) return ''

  const endpoint = currentEndpoint.value
  const baseUrl = 'https://api.spreadsheetmoment.com'
  const path = endpoint.path.replace(':id', 'spreadsheet_abc123').replace(':cellId', 'A1')

  switch (codeLanguage.value) {
    case 'javascript':
      return `const response = await fetch('${baseUrl}${path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${requestBody.value ? `,
  body: JSON.stringify(${requestBody.value})` : ''}
});

const data = await response.json();
console.log(data);`

    case 'python':
      return `import requests

response = requests.${endpoint.method.toLowerCase()}(
    '${baseUrl}${path}',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }${requestBody.value ? `,
    json=${requestBody.value}` : ''}
)

data = response.json()
print(data)`

    case 'curl':
      return `curl -X ${endpoint.method} "${baseUrl}${path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${requestBody.value ? ` \\\n  -d '${requestBody.value}'` : ''}`

    default:
      return ''
  }
})

// Methods
const selectEndpoint = (method: string, path: string) => {
  const key = `${method} ${path}`
  selectedEndpoint.value = key

  // Load example request body if available
  if (exampleRequests[key]) {
    requestBody.value = JSON.stringify(exampleRequests[key], null, 2)
  } else if (method === 'POST' || method === 'PUT') {
    requestBody.value = '{\n  \n}'
  } else {
    requestBody.value = ''
  }

  // Reset response
  responseBody.value = ''
  responseStatus.value = ''
  responseTime.value = ''
}

const executeRequest = async () => {
  if (!apiKey.value) {
    alert('Please enter your API key first')
    return
  }

  if (!currentEndpoint.value) return

  isLoading.value = true
  const startTime = Date.now()

  try {
    const baseUrl = 'https://api.spreadsheetmoment.com'
    const path = currentEndpoint.value.path.replace(':id', 'spreadsheet_abc123').replace(':cellId', 'A1')

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey.value}`,
      'Content-Type': 'application/json'
    }

    const options: RequestInit = {
      method: currentEndpoint.value.method,
      headers
    }

    if (requestBody.value && ['POST', 'PUT', 'PATCH'].includes(currentEndpoint.value.method)) {
      options.body = requestBody.value
    }

    const response = await fetch(`${baseUrl}${path}`, options)
    const data = await response.json()

    responseBody.value = JSON.stringify(data, null, 2)
    responseStatus.value = response.status.toString()
    responseTime.value = `${Date.now() - startTime}ms`
  } catch (error) {
    responseBody.value = JSON.stringify({ error: (error as Error).message }, null, 2)
    responseStatus.value = 'Error'
    responseTime.value = `${Date.now() - startTime}ms`
  } finally {
    isLoading.value = false
  }
}

const formatJson = () => {
  try {
    requestBody.value = JSON.stringify(JSON.parse(requestBody.value), null, 2)
  } catch (e) {
    // Invalid JSON, ignore
  }
}

onMounted(() => {
  // Load API key from localStorage
  const savedKey = localStorage.getItem('spreadsheet_moment_api_key')
  if (savedKey) {
    apiKey.value = savedKey
  }
})

const saveApiKey = () => {
  localStorage.setItem('spreadsheet_moment_api_key', apiKey.value)
}
</script>

<template>
  <div class="api-explorer">
    <!-- Authentication Section -->
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

    <!-- Endpoint Selection -->
    <div class="endpoint-section">
      <h3>Select Endpoint</h3>
      <div class="endpoint-categories">
        <div v-for="category in apiEndpoints" :key="category.category" class="category">
          <h4>{{ category.category }}</h4>
          <div class="endpoints">
            <button
              v-for="endpoint in category.endpoints"
              :key="`${endpoint.method} ${endpoint.path}`"
              :class="[
                'endpoint-btn',
                endpoint.method.toLowerCase(),
                { active: selectedEndpoint === `${endpoint.method} ${endpoint.path}` }
              ]"
              @click="selectEndpoint(endpoint.method, endpoint.path)"
            >
              <span class="method">{{ endpoint.method }}</span>
              <span class="path">{{ endpoint.path }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Builder -->
    <div v-if="currentEndpoint" class="request-section">
      <h3>Request Builder</h3>

      <div class="request-info">
        <div class="method-badge" :class="currentEndpoint.method.toLowerCase()">
          {{ currentEndpoint.method }}
        </div>
        <div class="url">https://api.spreadsheetmoment.com{{ currentEndpoint.path }}</div>
        <button @click="executeRequest" :disabled="isLoading" class="execute-btn">
          {{ isLoading ? 'Sending...' : 'Send Request' }}
        </button>
      </div>

      <!-- Tabs -->
      <div class="request-tabs">
        <button
          :class="{ active: selectedTab === 'body' }"
          @click="selectedTab = 'body'"
          :disabled="!['POST', 'PUT', 'PATCH'].includes(currentEndpoint.method)"
        >
          Body
        </button>
        <button
          :class="{ active: selectedTab === 'headers' }"
          @click="selectedTab = 'headers'"
        >
          Headers
        </button>
        <button
          :class="{ active: selectedTab === 'code' }"
          @click="selectedTab = 'code'"
        >
          Code
        </button>
      </div>

      <!-- Body Tab -->
      <div v-if="selectedTab === 'body'" class="tab-content">
        <textarea
          v-model="requestBody"
          class="code-editor"
          placeholder='{"key": "value"}'
          @blur="formatJson"
        ></textarea>
        <button @click="formatJson" class="format-btn">Format JSON</button>
      </div>

      <!-- Headers Tab -->
      <div v-if="selectedTab === 'headers'" class="tab-content">
        <textarea
          v-model="requestHeaders"
          class="code-editor"
          placeholder='{"Authorization": "Bearer YOUR_API_KEY"}'
        ></textarea>
      </div>

      <!-- Code Tab -->
      <div v-if="selectedTab === 'code'" class="tab-content">
        <div class="code-generator">
          <div class="language-selector">
            <button
              v-for="lang in ['javascript', 'python', 'curl']"
              :key="lang"
              :class="{ active: codeLanguage === lang }"
              @click="codeLanguage = lang"
            >
              {{ lang.charAt(0).toUpperCase() + lang.slice(1) }}
            </button>
          </div>
          <pre class="code-output"><code>{{ generatedCode }}</code></pre>
          <button @click="navigator.clipboard.writeText(generatedCode)" class="copy-btn">
            Copy Code
          </button>
        </div>
      </div>
    </div>

    <!-- Response Section -->
    <div v-if="responseBody" class="response-section">
      <div class="response-header">
        <h3>Response</h3>
        <div class="response-meta">
          <span class="status-badge" :class="{ success: responseStatus.startsWith('2'), error: !responseStatus.startsWith('2') }">
            {{ responseStatus }}
          </span>
          <span class="response-time">{{ responseTime }}</span>
        </div>
      </div>
      <pre class="response-body">{{ responseBody }}</pre>
      <button @click="navigator.clipboard.writeText(responseBody)" class="copy-btn">
        Copy Response
      </button>
    </div>
  </div>
</template>

<style scoped>
.api-explorer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
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

.endpoint-section {
  margin-bottom: 2rem;
}

.endpoint-section h3 {
  margin-bottom: 1rem;
}

.category {
  margin-bottom: 1.5rem;
}

.category h4 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--vp-c-text-1);
}

.endpoints {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.endpoint-btn {
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

.endpoint-btn:hover {
  border-color: var(--vp-c-brand);
}

.endpoint-btn.active {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

.endpoint-btn .method {
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.endpoint-btn.get .method { color: #61affe; }
.endpoint-btn.post .method { color: #49cc90; }
.endpoint-btn.put .method { color: #fca130; }
.endpoint-btn.delete .method { color: #f93e3e; }

.endpoint-btn.active .method {
  color: white;
}

.endpoint-btn .path {
  font-size: 0.85rem;
  font-family: monospace;
}

.request-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.request-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.request-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.method-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.method-badge.get { background: #61affe; color: white; }
.method-badge.post { background: #49cc90; color: white; }
.method-badge.put { background: #fca130; color: white; }
.method-badge.delete { background: #f93e3e; color: white; }

.url {
  flex: 1;
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.execute-btn {
  padding: 0.5rem 1.5rem;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
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
  position: relative;
}

.code-editor {
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  resize: vertical;
}

.format-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.format-btn:hover {
  background: var(--vp-c-brand);
  color: white;
}

.code-generator {
  position: relative;
}

.language-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.language-selector button {
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  cursor: pointer;
}

.language-selector button.active {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

.code-output {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}

.copy-btn {
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.copy-btn:hover {
  background: var(--vp-c-brand);
  color: white;
}

.response-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.response-header h3 {
  margin: 0;
}

.response-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
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
  margin: 0 0 0.5rem 0;
  max-height: 400px;
  overflow-y: auto;
}
</style>
