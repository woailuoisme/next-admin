# Next.js Enterprise Admin Dashboard Helm Chart

Kubernetes Helm chart for deploying the Next.js Enterprise Admin Dashboard (`next-admin`).

## Features

- **Next.js 16 Standalone**: Optimized deployment for standalone Node 24 Alpine runner.
- **Port Mapping**: Service exposed on port 80 (HTTP) mapped to container target port 3500.
- **Probes**: Native HTTP health checks on `/api/health`.
- **Security-First**: Runs as non-root user `node` (UID 1000) with dropped capabilities and privilege escalation disabled.
- **Scalability**: Horizontal Pod Autoscaler (HPA) and Ingress support.
- **Zero Downtime Configuration Updates**: Checksum annotations ensure pods automatically restart on ConfigMap/Secret changes.

## Prerequisites

- Kubernetes 1.24+
- Helm 3.8.0+

## Installing the Chart

### 1. Quick Install with Local Chart

```bash
helm install next-admin ./helm
```

### 2. Install with Custom Ingress and Domain

```bash
helm install next-admin ./helm \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set "ingress.hosts[0].host=admin.example.com" \
  --set "ingress.hosts[0].paths[0].path=/" \
  --set "ingress.hosts[0].paths[0].pathType=ImplementationSpecific"
```

### 3. Install with Custom Image and Tags

```bash
helm install next-admin ./helm \
  --set image.repository=ghcr.io/woailuoisme/next-admin \
  --set image.tag=v0.1.0
```

## Uninstalling the Chart

To uninstall/delete the `next-admin` release:

```bash
helm uninstall next-admin
```

## Configuration Parameters

The following table lists the configurable parameters of the `next-admin` chart and their default values:

| Parameter                                    | Description                                             | Default                                                                                          |
| -------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `replicaCount`                               | Number of pod replicas (ignored when HPA is enabled)    | `1`                                                                                              |
| `image.repository`                           | Image repository                                        | `ghcr.io/woailuoisme/next-admin`                                                                 |
| `image.pullPolicy`                           | Image pull policy                                       | `IfNotPresent`                                                                                   |
| `image.tag`                                  | Image tag (defaults to `.Chart.AppVersion`)             | `""`                                                                                             |
| `image.digest`                               | Image digest algorithm:hash (takes precedence over tag) | `""`                                                                                             |
| `imagePullSecrets`                           | Secrets for private registry authentication             | `[]`                                                                                             |
| `nameOverride`                               | Override chart name                                     | `""`                                                                                             |
| `fullnameOverride`                           | Override full release name                              | `""`                                                                                             |
| `serviceAccount.create`                      | Create a dedicated ServiceAccount                       | `true`                                                                                           |
| `serviceAccount.automount`                   | Automount ServiceAccount API credentials                | `true`                                                                                           |
| `podSecurityContext.runAsNonRoot`            | Enforce non-root execution                              | `true`                                                                                           |
| `podSecurityContext.runAsUser`               | Non-root UID                                            | `1000`                                                                                           |
| `podSecurityContext.fsGroup`                 | Storage group ID                                        | `1000`                                                                                           |
| `securityContext.allowPrivilegeEscalation`   | Disallow privilege escalation                           | `false`                                                                                          |
| `securityContext.capabilities.drop`          | Capabilities to drop                                    | `["ALL"]`                                                                                        |
| `service.type`                               | Service type                                            | `ClusterIP`                                                                                      |
| `service.port`                               | Service port exposed                                    | `80`                                                                                             |
| `service.targetPort`                         | Container target port                                   | `3500`                                                                                           |
| `livenessProbe.httpGet.path`                 | Liveness probe endpoint                                 | `/api/health`                                                                                    |
| `readinessProbe.httpGet.path`                | Readiness probe endpoint                                | `/api/health`                                                                                    |
| `resources.requests.cpu`                     | Requested CPU                                           | `100m`                                                                                           |
| `resources.requests.memory`                  | Requested memory                                        | `256Mi`                                                                                          |
| `resources.limits.cpu`                       | CPU limit                                               | `1000m`                                                                                          |
| `resources.limits.memory`                    | Memory limit                                            | `512Mi`                                                                                          |
| `autoscaling.enabled`                        | Enable Horizontal Pod Autoscaler                        | `false`                                                                                          |
| `autoscaling.minReplicas`                    | Minimum replica count                                   | `2`                                                                                              |
| `autoscaling.maxReplicas`                    | Maximum replica count                                   | `5`                                                                                              |
| `autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage                       | `80`                                                                                             |
| `ingress.enabled`                            | Enable Ingress resource                                 | `false`                                                                                          |
| `ingress.className`                          | Ingress class name (e.g. nginx, traefik)                | `""`                                                                                             |
| `ingress.hosts`                              | List of Ingress host rules                              | `[{"host": "next-admin.local", "paths": [{"path": "/", "pathType": "ImplementationSpecific"}]}]` |
| `configMap.enabled`                          | Create and bind ConfigMap                               | `false`                                                                                          |
| `secret.enabled`                             | Create and bind Secret                                  | `false`                                                                                          |
| `env`                                        | Direct environment variables                            | `[NODE_ENV, PORT, NEXT_TELEMETRY_DISABLED, TZ]`                                                  |

## Testing and Verification

Run chart validation:

```bash
helm lint ./helm --strict
helm template test ./helm --debug
```
