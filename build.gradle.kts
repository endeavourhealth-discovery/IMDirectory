import com.github.gradle.node.pnpm.task.PnpmTask

plugins {
    id("base")
    id("com.github.node-gradle.node")
    id("org.sonarqube").version("6.2.0.5505")
}

if (System.getenv("ENV") == "prod") {
    tasks.build {
        finalizedBy("sonar")
    }
}

sonar {
    properties {
        property("sonar.token", System.getenv("SONAR_LOGIN"))
        property("sonar.host.url", "https://sonarcloud.io")
        property("sonar.organization", "endeavourhealth-discovery")
        property("sonar.projectKey", "IMDirectory")
        property("sonar.projectName", "IMDirectory")
        property("sonar.sources", "src/composables,src/helpers,src/stores,src/services")
        property("sonar.tests", "tests")
        property("sonar.exclusions", "**/index.ts,**/*.d.ts,**/node_modules/**")
        property("sonar.test.inclusions", "**/*.spec.ts,**/*.spec.js")
        property("sonar.javascript.lcov.reportPaths", "coverage/lcov.info")
    }
}

tasks.findByName("pnpmInstall")?.doNotTrackState("Otherwise fails on optional FA Pro dependency")

tasks.register<PnpmTask>("pnpmBuild") {
    dependsOn(tasks.findByName("pnpmInstall"))
    args = listOf("run", "build")
}

tasks.register<PnpmTask>("pnpmTest") {
    dependsOn(tasks.findByName("pnpmInstall"))
    args = listOf("run", "test:coverage")
}

tasks.assemble {
    dependsOn(tasks.findByName("pnpmBuild"))
}

tasks.check {
    dependsOn(tasks.findByName("pnpmTest"))
}

tasks.clean {
    doLast {
        file("coverage").deleteRecursively()
        file("dist").deleteRecursively()
    }
}
