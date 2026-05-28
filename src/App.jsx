import { useState, useEffect, useRef } from "react";

export default function App() {
  const initialServices = [
    { name: "auth-service", status: "healthy" },
    { name: "payment-service", status: "healthy" },
    { name: "api-gateway", status: "healthy" },
  ];

  const [services, setServices] = useState(initialServices);

  const [logs, setLogs] = useState([
    "[INFO] Production systems online.",
    "[INFO] Monitoring active.",
  ]);

  const [cpu, setCpu] = useState(24);
  const [alert, setAlert] = useState("All systems operational");
  const [deployStatus, setDeployStatus] = useState("Stable");

  const [startTime, setStartTime] = useState(Date.now());

  const timeoutsRef = useRef([]);

  const addTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const resetSimulator = () => {
    clearAllTimeouts();

    setServices(initialServices);

    setLogs([
      "[INFO] Production systems online.",
      "[INFO] Monitoring active.",
    ]);

    setCpu(24);
    setAlert("All systems operational");
    setDeployStatus("Stable");

    setStartTime(Date.now());
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();

    setLogs((prev) => [
      `${timestamp} ${message}`,
      ...prev.slice(0, 14),
    ]);
  };

  useEffect(() => {
    if (deployStatus === "Destroyed") return;

    const interval = setInterval(() => {
      setCpu((prev) => {
        const variation = Math.floor(Math.random() * 8) - 4;

        let next = prev + variation;

        if (next < 10) next = 10;
        if (next > 100) next = 100;

        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [deployStatus]);

  const deployOnFriday = () => {
    setDeployStatus("Deploying...");
    setAlert("Warning: Friday deployment detected");

    addLog("[INFO] Starting Friday deployment...");
    addLog("[WARNING] Deploying before weekend.");

    addTimeout(() => {
      setDeployStatus("Failed");
      setCpu(91);

      setServices((prev) =>
        prev.map((s) =>
          s.name === "payment-service"
            ? { ...s, status: "degraded" }
            : s
        )
      );

      addLog("[ERROR] Payment service failed health check.");
      addLog("[CRITICAL] Rollback initiated.");

      setAlert("Critical deployment failure");
    }, 2000);
  };

  const deleteProduction = () => {
    setServices((prev) =>
      prev.map((s) => ({
        ...s,
        status: "offline",
      }))
    );

    setCpu(3);

    setDeployStatus("Destroyed");

    setAlert("PRODUCTION DELETED");

    addLog("rm -rf /production");
    addLog("[CRITICAL] Database connection lost.");
    addLog("[ERROR] All services unavailable.");
  };

  const restartRandomContainer = () => {
    const randomIndex = Math.floor(
      Math.random() * services.length
    );

    const selected = services[randomIndex];

    setServices((prev) =>
      prev.map((s, i) =>
        i === randomIndex
          ? { ...s, status: "restarting" }
          : s
      )
    );

    addLog(`[WARNING] ${selected.name} exited unexpectedly.`);

    setAlert(`${selected.name} restarting`);

    addTimeout(() => {
      setServices((prev) =>
        prev.map((s, i) =>
          i === randomIndex
            ? { ...s, status: "healthy" }
            : s
        )
      );

      addLog("[INFO] Restart policy triggered.");
      addLog(`[INFO] ${selected.name} recovered.`);

      setAlert("Container recovered");
    }, 2000);
  };

  const pushWithoutTesting = () => {
    setDeployStatus("Live");

    addLog("[WARNING] Tests skipped.");
    addLog("[INFO] Deployment successful.");

    setAlert("Untested code deployed");

    addTimeout(() => {
      setCpu(97);

      setServices((prev) =>
        prev.map((s) =>
          s.name === "api-gateway"
            ? { ...s, status: "degraded" }
            : s
        )
      );

      addLog(
        "[ERROR] Unhandled exception in checkout-service."
      );

      addLog("[CRITICAL] Memory leak detected.");

      setAlert("Production instability detected");
    }, 3000);
  };

  const getStatusColor = (status) => {
    if (status === "healthy") return "bg-green-500";

    if (status === "degraded")
      return "bg-yellow-500";

    if (status === "restarting")
      return "bg-blue-500";

    return "bg-red-500";
  };

  const uptime = Date.now() - startTime;

  return (
    <div className="min-h-screen bg-[#0b1020] text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold tracking-tight mb-2">
              Production Disaster Simulator
            </h1>

            <p className="text-slate-400 text-lg">
              Simulating production failures and bad deployment
              decisions.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 font-medium">
              {alert}
            </div>

            <button
              onClick={resetSimulator}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition border border-white/10 font-medium"
            >
              Reset Simulator
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm mb-2">
                  Resource Utilization Metrics
                </p>

                <div className="text-4xl font-bold">
                  {cpu}%
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-400">
                  CPU State
                </div>

                <div className="text-lg font-semibold text-orange-300">
                  {cpu > 85 ? "Throttling" : "Stable"}
                </div>
              </div>
            </div>

            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-500"
                style={{ width: `${cpu}%` }}
              />
            </div>

            <div className="text-sm text-slate-400">
              CPU Usage & Throttling
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-slate-400 text-sm mb-2">
                  Container Health & Lifecycle Events
                </p>

                <div className="text-3xl font-bold">
                  {
                    services.filter(
                      (s) => s.status === "healthy"
                    ).length
                  }
                  /{services.length}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-400">
                  Containers
                </div>

                <div
                  className={`text-lg font-semibold ${
                    services.every(
                      (s) => s.status === "healthy"
                    )
                      ? "text-green-300"
                      : services.every(
                          (s) => s.status === "offline"
                        )
                      ? "text-red-400"
                      : "text-yellow-300"
                  }`}
                >
                  {services.every(
                    (s) => s.status === "healthy"
                  )
                    ? "Healthy"
                    : services.every(
                        (s) => s.status === "offline"
                      )
                    ? "Offline"
                    : "Degraded"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {service.name}
                    </div>

                    <div className="text-sm text-slate-400 capitalize">
                      {service.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 capitalize">
                      {service.status}
                    </span>

                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        service.status
                      )}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-slate-400 mt-5">
              Container Status: running, paused, or exited
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-slate-400 text-sm mb-2">
                  Error Rate
                </p>

                <div className="text-4xl font-bold text-red-300">
                  {
                    logs.filter(
                      (log) =>
                        log.includes("[ERROR]") ||
                        log.includes("[CRITICAL]")
                    ).length
                  }
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-400">
                  Server Status
                </div>

                <div
                  className={`text-lg font-semibold ${
                    alert.includes("DELETED")
                      ? "text-red-400"
                      : "text-green-300"
                  }`}
                >
                  {alert.includes("DELETED")
                    ? "Offline"
                    : "Available"}
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">
                  Availability
                </span>

                <span className="font-semibold">
                  {alert.includes("DELETED")
                    ? "0%"
                    : "99.9%"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Uptime
                </span>

                <span className="font-semibold">
                  {uptime} ms
                </span>
              </div>
            </div>

            <div className="text-sm text-slate-400 mt-5">
              Server Status: Availability + Uptime
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-fit">
            <h2 className="text-2xl font-semibold mb-6">
              Disaster Controls
            </h2>

            <div className="space-y-4">
              <button
                onClick={deployOnFriday}
                className="w-full py-4 rounded-2xl bg-yellow-500 hover:opacity-90 transition font-semibold text-black"
              >
                Deploy on Friday
              </button>

              <button
                onClick={deleteProduction}
                className="w-full py-4 rounded-2xl bg-red-600 hover:opacity-90 transition font-semibold"
              >
                Delete Production
              </button>

              <button
                onClick={restartRandomContainer}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:opacity-90 transition font-semibold"
              >
                Restart Random Container
              </button>

              <button
                onClick={pushWithoutTesting}
                className="w-full py-4 rounded-2xl bg-purple-600 hover:opacity-90 transition font-semibold"
              >
                Push Without Testing
              </button>
            </div>
          </div>

          <div className="bg-black border border-green-500/20 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold text-green-400">
                Live Logs
              </h2>

              <div className="flex items-center gap-2 text-sm text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Streaming
              </div>
            </div>

            <div className="font-mono text-sm space-y-3 h-[500px] overflow-y-auto pr-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="text-green-400 border-b border-white/5 pb-2"
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}