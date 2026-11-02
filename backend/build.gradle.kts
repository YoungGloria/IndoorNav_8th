plugins {
    alias(libs.plugins.kotlin.jvm)
    application
    kotlin("plugin.serialization") version "2.4.10"
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    implementation("io.ktor:ktor-server-core-jvm:2.3.12")
    implementation("io.ktor:ktor-server-netty-jvm:2.3.12")
    implementation("io.ktor:ktor-server-websockets-jvm:2.3.12")
    implementation("io.ktor:ktor-server-content-negotiation-jvm:2.3.12")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm:2.3.12")
    implementation("ch.qos.logback:logback-classic:1.5.18")
    testImplementation("io.ktor:ktor-server-test-host-jvm:2.3.12")
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

application {
    mainClass = "com.example.webar.AppKt"
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}
