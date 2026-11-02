import { createWebSocketVpsPipelineModule } from './websocket-vps-pipeline-module.js'

const statusElement = document.getElementById('status')
const vpsAnchor = document.getElementById('vps-anchor')

const setStatus = (text) => {
  if (statusElement) statusElement.textContent = text
}

const applyPose = (pose) => {
  if (!vpsAnchor || !pose) return

  const { position, rotation, confidence } = pose
  vpsAnchor.setAttribute('position', `${position.x} ${position.y} ${position.z}`)
  vpsAnchor.setAttribute('rotation', `${rotation.x} ${rotation.y} ${rotation.z}`)

  setStatus(`WebSocket: verbunden | VPS confidence=${confidence.toFixed(2)}`)
}

const waitForXr8AndStart = () => {
  if (!window.XR8) {
    window.setTimeout(waitForXr8AndStart, 300)
    return
  }

  const pipelineModule = createWebSocketVpsPipelineModule({
    backendUrl: 'ws://localhost:8088/vps',
    onPose: applyPose,
    onStateChange: setStatus,
    frameIntervalMs: 250,
  })

  window.XR8.addCameraPipelineModules([pipelineModule])
  window.XR8.run({ canvas: document.querySelector('canvas') })
}

window.addEventListener('load', waitForXr8AndStart)
