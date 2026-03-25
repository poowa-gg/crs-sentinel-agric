import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock database for offline sync simulation
  let syncedData: any[] = [];
  let syncQueue: any[] = [];
  let isOnline = true;

  // API Routes
  app.get("/api/status", (req, res) => {
    res.json({ isOnline });
  });

  app.post("/api/toggle-network", (req, res) => {
    isOnline = !isOnline;
    res.json({ isOnline });
  });

  app.get("/api/data", (req, res) => {
    res.json(syncedData);
  });

  app.post("/api/sync", (req, res) => {
    const { entries } = req.body;
    if (isOnline) {
      syncedData = [...syncedData, ...entries];
      res.json({ success: true, count: entries.length });
    } else {
      res.status(503).json({ error: "Offline" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
