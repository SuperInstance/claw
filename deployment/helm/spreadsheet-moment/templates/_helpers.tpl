{{/*
Common template helpers for Spreadsheet Moment Helm Chart
*/}}

{{/*
Expand environment variables from config maps and secrets
*/}}
{{- define "envFromConfig" -}}
{{- $name := .Values.configMapName | default (printf "spreadsheet-moment-config") -}}
{{- $key := .key -}}
{{- $value := .value -}}
- name: {{ $name }}
  valueFrom:
    configMapKeyRef:
      name: {{ $name }}
      key: {{ $key }}
{{- end -}}

{{- define "envFromSecret" -}}
{{- $name := .Values.secretName | default (printf "spreadsheet-moment-secrets") -}}
{{- $key := .key -}}
{{- $value := .value -}}
- name: {{ $name }}
  valueFrom:
    secretKeyRef:
      name: {{ $name }}
      key: {{ $key }}
{{- end -}}

{{/*
Generate labels for resources
*/}}
{{- define "labels.standard" -}}
app.kubernetes.io/name: {{ include "spreadsheet-moment.chart.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
{{- end -}}

{{/*
Generate selector labels
*/}}
{{- define "labels.selector" -}}
app: {{ .Values.app | default .Chart.Name }}
{{- end -}}

{{/*
Generate resource requests and limits
*/}}
{{- define "resources" -}}
{{- if .resources }}
resources:
  requests:
    cpu: {{ .resources.requests.cpu | default "100m" }}
    memory: {{ .resources.requests.memory | default "128Mi" }}
  limits:
    cpu: {{ .resources.limits.cpu | default "500m" }}
    memory: {{ .resources.limits.memory | default "512Mi" }}
{{- end }}
{{- end -}}

{{/*
Generate affinity rules
*/}}
{{- define "affinity.podAntiAffinity" -}}
{{- if .Values.affinity }}
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchLabels:
            {{- include "labels.selector" . | nindent 12 }}
        topologyKey: kubernetes.io/hostname
{{- end }}
{{- end -}}

{{/*
Generate tolerations
*/}}
{{- define "tolerations" -}}
{{- if .tolerations }}
tolerations:
{{- toYaml .tolerations | nindent 2 }}
{{- end }}
{{- end -}}

{{/*
Generate node selector
*/}}
{{- define "nodeSelector" -}}
{{- if .nodeSelector }}
nodeSelector:
{{- toYaml .nodeSelector | nindent 2 }}
{{- end }}
{{- end -}}

{{/*
Generate security context for pods
*/}}
{{- define "podSecurityContext" -}}
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  fsGroup: 1001
  seccompProfile:
    type: RuntimeDefault
{{- end -}}

{{/*
Generate security context for containers
*/}}
{{- define "containerSecurityContext" -}}
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL
{{- end -}}

{{/*
Generate health check probes
*/}}
{{- define "probes.http" -}}
{{- $path := .path | default "/health" -}}
{{- $port := .port | default 4000 -}}
{{- $initialDelay := .initialDelaySeconds | default 30 -}}
livenessProbe:
  httpGet:
    path: {{ $path }}
    port: {{ $port }}
  initialDelaySeconds: {{ $initialDelay }}
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
readinessProbe:
  httpGet:
    path: {{ $path | default "/ready" }}
    port: {{ $port }}
  initialDelaySeconds: {{ add $initialDelay -20 }}
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
{{- end -}}
