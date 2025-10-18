export function getHomeVue() {
	return `<template>
  <div class="home">
    <div class="hero">
      <h1>Welcome to Elysia + Vue</h1>
      <p class="subtitle">A modern full-stack TypeScript development framework</p>

      <div class="features">
        <div class="feature-card">
          <h3>🚀 Elysia Backend</h3>
          <p>High-performance, type-safe web framework</p>
        </div>

        <div class="feature-card">
          <h3>⚡ Vue 3 Frontend</h3>
          <p>Modern, responsive user interface</p>
        </div>

        <div class="feature-card">
          <h3>📦 Monorepo</h3>
          <p>Unified code repository and dependency management</p>
        </div>

        <div class="feature-card">
          <h3>🔧 TypeScript</h3>
          <p>End-to-end type safety guarantee</p>
        </div>
      </div>

      <div class="api-test">
        <h2>API Test</h2>
        <input type="text" v-model="inputValue" />
        <button @click="testApi" :disabled="loading">
          {{ loading ? 'Requesting...' : 'Test Backend API' }}
        </button>

        <div v-if="result" class="result">
          <h3>Response Result:</h3>
          <pre>{{ result }}</pre>
        </div>

        <div v-if="error" class="error">
          <h3>Error Message:</h3>
          <pre>{{ error }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useApi } from "../utils/api/handleApi";
const inputValue = ref("1");
const loading = ref(false);
const result = ref<string>("");
const error = ref<string>("");
const api = useApi()

const testApi = async () => {
  loading.value = true;
  result.value = "";
  error.value = "";

  try {
    const res = await api.partners.list(inputValue.value)
    result.value = res?.data || "Request successful";
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Unknown error";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 4rem 0;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.25rem;
  color: #718096;
  margin-bottom: 3rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.feature-card p {
  color: #718096;
  line-height: 1.6;
}

.api-test {
  background: #f7fafc;
  padding: 2rem;
  border-radius: 1rem;
  text-align: left;
}

.api-test h2 {
  color: #2d3748;
  margin-bottom: 1rem;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result, .error {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
}

.result {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  color: #22543d;
}

.error {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  color: #742a2a;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

@media (max-width: 768px) {
  .hero {
    padding: 2rem 0;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .feature-card {
    padding: 1.5rem;
  }
}
</style>`;
}
