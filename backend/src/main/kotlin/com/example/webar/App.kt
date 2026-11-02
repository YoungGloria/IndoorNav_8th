package com.example.webar

import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.application.install
import io.ktor.server.application.log
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.Frame
import io.ktor.websocket.readBytes
import io.ktor.websocket.readText
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlin.math.sin

@Serializable
data class ClientFrameMetadata(
    val type: String,
    val timestamp: Long,
    val width: Int,
    val height: Int,
    val format: String,
)

@Serializable
data class Position(val x: Double, val y: Double, val z: Double)

@Serializable
data class Rotation(val x: Double, val y: Double, val z: Double, val w: Double)

@Serializable
data class VpsPoseMessage(
    val type: String = "vps-pose",
    val timestamp: Long,
    val confidence: Double,
    val position: Position,
    val rotation: Rotation,
)

fun createDummyPose(now: Long): VpsPoseMessage {
    val phase = now / 1000.0
    return VpsPoseMessage(
        timestamp = now,
        confidence = 0.85,
        position = Position(
            x = sin(phase) * 0.25,
            y = 0.0,
            z = -1.0 + sin(phase * 0.5) * 0.2,
        ),
        rotation = Rotation(
            x = 0.0,
            y = sin(phase * 0.25) * 0.3,
            z = 0.0,
            w = 1.0,
        ),
    )
}

fun Application.module() {
    install(ContentNegotiation) {
        json(Json { ignoreUnknownKeys = true })
    }
    install(WebSockets)

    routing {
        get("/health") {
            call.respondText("ok")
        }

        webSocket("/vps") {
            application.log.info("WebSocket client connected to /vps")
            send(Frame.Text("""{"type":"server-ready","message":"Niantic VPS boilerplate active"}"""))

            for (frame in incoming) {
                when (frame) {
                    is Frame.Text -> {
                        val metadata = runCatching {
                            Json.decodeFromString<ClientFrameMetadata>(frame.readText())
                        }.getOrNull()
                        if (metadata != null) {
                            application.log.info(
                                "Received frame metadata: ts=${metadata.timestamp}, size=${metadata.width}x${metadata.height}, format=${metadata.format}",
                            )
                        }
                    }

                    is Frame.Binary -> {
                        val bytes = frame.readBytes()
                        application.log.info("Received camera frame payload (${bytes.size} bytes)")
                        val pose = createDummyPose(System.currentTimeMillis())
                        send(Frame.Text(Json.encodeToString(VpsPoseMessage.serializer(), pose)))
                    }

                    else -> Unit
                }
            }
            application.log.info("WebSocket client disconnected from /vps")
        }
    }
}

fun main() {
    embeddedServer(Netty, port = 8088, host = "0.0.0.0", module = Application::module).start(wait = true)
}
