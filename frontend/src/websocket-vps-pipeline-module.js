const toEulerDegrees = (q) => {
  if (!q) return { x: 0, y: 0, z: 0 }

  const x = q.x ?? 0
  const y = q.y ?? 0
  const z = q.z ?? 0
  const w = q.w ?? 1

  const sinrCosp = 2 * (w * x + y * z)
  const cosrCosp = 1 - 2 * (x * x + y * y)
  const roll = Math.atan2(sinrCosp, cosrCosp)

  const sinp = 2 * (w * y - z * x)
  const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * (Math.PI / 2) : Math.asin(sinp)

  const sinyCosp = 2 * (w * z + x * y)
  const cosyCosp = 1 - 2 * (y * y + z * z)
  const yaw = Math.atan2(sinyCosp, cosyCosp)

  const toDeg = (rad) => (rad * 180) / Math.PI

  return {
    x: toDeg(pitch),
    y: toDeg(yaw),
    z: toDeg(roll),
  }
}

export const createWebSocketVpsPipelineModule = ({
  backendUrl,
  onPose,
  onStateChange,
  frameIntervalMs = 250,
}) => {
  let socket = null
  let lastFrameAt = 0
  let sendInFlight = false

  const setState = (text) => {
    if (typeof onStateChange === 'function') onStateChange(text)
  }

  const sendCameraFrame = async (canvas) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !canvas || sendInFlight) return

    sendInFlight = true
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.6))
      if (!blob) return

      const metadata = {
        type: 'camera-frame',
        timestamp: Date.now(),
        width: canvas.width,
        height: canvas.height,
        format: 'jpeg',
      }

      socket.send(JSON.stringify(metadata))
      socket.send(await blob.arrayBuffer())
    } finally {
      sendInFlight = false
    }
  }

  const connect = () => {
    if (!backendUrl) {
      setState('WebSocket: backendUrl fehlt')
      return
    }

    socket = new WebSocket(backendUrl)
    socket.binaryType = 'arraybuffer'

    socket.onopen = () => setState('WebSocket: verbunden')
    socket.onclose = () => {
      setState('WebSocket: getrennt, Reconnect in 2s')
      window.setTimeout(connect, 2000)
    }
    socket.onerror = () => setState('WebSocket: Fehler')
    socket.onmessage = (event) => {
      if (typeof event.data !== 'string') return
      try {
        const payload = JSON.parse(event.data)
        if (payload?.type === 'vps-pose' && typeof onPose === 'function') {
          const euler = toEulerDegrees(payload.rotation)
          onPose({
            position: payload.position ?? { x: 0, y: 0, z: 0 },
            rotation: euler,
            confidence: payload.confidence ?? 0,
            timestamp: payload.timestamp ?? Date.now(),
          })
        }
      } catch (_error) {
        setState('WebSocket: Ungültige Nachricht')
      }
    }
  }

  return {
    name: 'websocket-vps-pipeline-module',
    onStart: () => connect(),
    onDetach: () => {
      if (socket) {
        socket.close()
      }
      socket = null
    },
    onProcessCpu: () => {
      const now = Date.now()
      if (now - lastFrameAt < frameIntervalMs) return
      lastFrameAt = now

      const canvas = document.querySelector('canvas')
      if (canvas) sendCameraFrame(canvas)
    },
  }
}
