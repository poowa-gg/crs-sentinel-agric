import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

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

// For Vercel deployment, we just export the express app.
// Vercel routes `/api/*` directly to this file via vercel.json.
if (!process.env.VERCEL) {
  (async () => {
    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
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

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })();
}

export default app;
