package com.example.webar

import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.server.testing.testApplication
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class AppTest {
    @Test
    fun `health endpoint returns ok`() = testApplication {
        application { module() }

        val response = client.get("/health")
        assertEquals("ok", response.bodyAsText())
    }

    @Test
    fun `dummy pose keeps expected shape and bounds`() {
        val pose = createDummyPose(1_700_000_000_000)

        assertEquals("vps-pose", pose.type)
        assertEquals(0.85, pose.confidence)
        assertTrue(pose.position.x in -0.25..0.25)
        assertTrue(pose.position.z in -1.2..-0.8)
        assertEquals(1.0, pose.rotation.w)
    }
}
