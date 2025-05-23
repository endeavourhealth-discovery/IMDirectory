pluginManagement {
    plugins {
        id("com.github.node-gradle.node").version("5.0.0")
    }
    repositories {
        mavenCentral()
        gradlePluginPortal()
        maven {
            url = uri("https://artifactory.endhealth.co.uk/repository/maven-releases")
        }
        maven {
            url = uri("https://artifactory.endhealth.co.uk/repository/maven-snapshots")
        }
        mavenLocal()
    }
}

rootProject.name = "IM Directory"
