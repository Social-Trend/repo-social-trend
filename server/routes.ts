import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfessionalSchema, insertConversationSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Professional routes
  app.get("/api/professionals", async (req, res) => {
    try {
      const professionals = await storage.getProfessionals();
      res.json(professionals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch professionals" });
    }
  });

  app.get("/api/professionals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid professional ID" });
      }
      
      const professional = await storage.getProfessional(id);
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }
      
      res.json(professional);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch professional" });
    }
  });

  app.post("/api/professionals", async (req, res) => {
    try {
      const validatedData = insertProfessionalSchema.parse(req.body);
      const professional = await storage.createProfessional(validatedData);
      res.status(201).json(professional);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid professional data", details: error });
      }
      res.status(500).json({ error: "Failed to create professional" });
    }
  });

  app.patch("/api/professionals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid professional ID" });
      }
      
      const updates = insertProfessionalSchema.partial().parse(req.body);
      const professional = await storage.updateProfessional(id, updates);
      
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }
      
      res.json(professional);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid professional data", details: error });
      }
      res.status(500).json({ error: "Failed to update professional" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
