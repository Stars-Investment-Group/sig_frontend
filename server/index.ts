/**
 * Point d'entrée principal de l'application Express
 * 
 * Ce fichier configure et démarre le serveur Express avec
 * tous les middleware et routes nécessaires.
 */

import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { SERVER_CONFIG } from "./config";

// Création de l'application Express
const app = express();

// === MIDDLEWARE DE BASE ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));


// === DÉMARRAGE DE L'APPLICATION ===
(async () => {
  try {
    console.log('🚀 Démarrage du Global Macroeconomic Tracker...');
    
    // Enregistrement des routes API
    const server = await registerRoutes(app);

    // Middleware de gestion des erreurs (doit être en dernier)

    // Configuration Vite (développement) ou assets statiques (production)
    if (SERVER_CONFIG.ENVIRONMENT === "development") {
      await setupVite(app, server);
      console.log('⚡ Vite configuré pour le développement');
    } else {
      serveStatic(app);
      console.log('📦 Assets statiques configurés pour la production');
    }

    // Démarrage du serveur sur le port configuré
    server.listen({
      port: SERVER_CONFIG.PORT,
      host: SERVER_CONFIG.HOST,
      reusePort: true,
    }, () => {
      console.log(`✅ Serveur démarré sur ${SERVER_CONFIG.HOST}:${SERVER_CONFIG.PORT}`);
      console.log(`🌍 Environnement: ${SERVER_CONFIG.ENVIRONMENT}`);
      console.log(`📊 API disponible sur: http://localhost:${SERVER_CONFIG.PORT}/api`);
      log(`serving on port ${SERVER_CONFIG.PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
})();
