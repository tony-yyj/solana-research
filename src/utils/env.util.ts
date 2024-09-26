export function getEnv() {
    return 'dev'
    // return HostEnvMap[window.location.hostname] || "prod";
}

export function isProdEnv() {
    return getEnv() === "prod";
}