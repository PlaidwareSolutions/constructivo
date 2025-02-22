import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import {
  settings,
  users,
  projects,
  testimonials,
  notifications,
  reactions,
} from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { setupWebSocket, invalidateAdminCache } from "./websocket";

// Middleware to check if user is admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Not authorized" });
  }
  next();
};

async function createNotification(
  userId: number,
  title: string,
  message: string,
  type: string,
) {
  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        title,
        message,
        type,
      })
      .returning();

    // Broadcast cache invalidation for notifications
    invalidateAdminCache("notifications");

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  const httpServer = createServer(app);
  const { broadcastToAdmins } = setupWebSocket(httpServer);

  // Store the broadcast function globally for use in other parts of the application
  global.wss = { broadcastToAdmins };

  // OAuth Configuration Check Endpoints
  app.get("/api/auth/check-credentials", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    res.json({
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      details: {
        clientIdPresent: !!clientId,
        clientSecretPresent: !!clientSecret,
      },
    });
  });

  app.get("/api/auth/check-callback", (req, res) => {
    const replId = process.env.REPL_ID;
    const replSlug = process.env.REPL_SLUG;
    const replOwner = process.env.REPL_OWNER;

    // Get domain from request with improved handling for development URLs
    let domain;
    const referer = req.headers.referer;
    if (referer) {
      const refererUrl = new URL(referer);
      if (refererUrl.hostname.includes(".worf.replit.dev")) {
        domain = refererUrl.hostname;
      }
    }

    if (!domain) {
      const host = req.get("host");
      if (host) {
        if (host.includes(".worf.replit.dev")) {
          domain = host;
        } else if (host.includes("repl.co")) {
          domain = host;
        }
      }
    }

    if (!domain) {
      domain = replId
        ? `${replId}.id.repl.co`
        : `${replSlug}.${replOwner}.repl.co`;
    }

    const currentCallback = `https://${domain}/auth/google/callback`;

    // Improved domain structure validation
    const domainParts = domain.split(".");
    const domainStructureValid =
      (domainParts.length === 7 &&
        domainParts[6] === "dev" &&
        domainParts[5] === "replit" &&
        domainParts[4] === "worf") ||
      (domainParts.length === 4 &&
        domainParts[3] === "co" &&
        domainParts[2] === "repl") ||
      (domainParts.length === 3 &&
        domainParts[2] === "co" &&
        domainParts[1] === "repl");

    const authorizedOrigin = `https://${domain}`;
    const authorizedRedirect = currentCallback;

    res.json({
      domain,
      currentCallback,
      callbackUrl: true,
      authorizedDomain: true,
      details: {
        domainValid:
          domain.includes("repl.co") || domain.includes(".worf.replit.dev"),
        domainStructureValid,
        authorizedOrigin,
        authorizedRedirect,
        configSteps: {
          originUrl: authorizedOrigin,
          redirectUrl: authorizedRedirect,
          instructions: [
            "1. Go to Google Cloud Console > APIs & Services > Credentials",
            "2. Edit your OAuth 2.0 Client ID",
            `3. Add "${authorizedOrigin}" to Authorized JavaScript origins`,
            `4. Add "${authorizedRedirect}" to Authorized redirect URIs`,
            "5. Save the changes",
          ],
        },
      },
    });
  });

  app.get("/api/auth/check-api", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const domain = req.get("host");
    const authorizedOrigin = `https://${domain}`;
    const authorizedRedirect = `${authorizedOrigin}/auth/google/callback`;

    res.json({
      consentScreen: !!clientId && !!clientSecret,
      testUsers: true,
      details: {
        consentScreenConfigured: !!clientId && !!clientSecret,
        authorizedOrigin,
        authorizedRedirect,
      },
    });
  });

  // User Data API
  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).send("Not logged in");
  });

  // Get all users (admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Update user admin status (admin only)
  app.patch("/api/users/:id/admin-status", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { isAdmin } = req.body;

    // Check if trying to modify own admin status
    if (req.user?.id === userId) {
      return res
        .status(403)
        .json({ error: "Cannot modify your own admin status" });
    }

    try {
      const [updatedUser] = await db
        .update(users)
        .set({ isAdmin })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Broadcast cache invalidation for users
      invalidateAdminCache("users");

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ error: "Failed to update user admin status" });
    }
  });

  // Project Reactions API
  app.get("/api/projects/:id/reactions", async (req, res) => {
    const projectId = parseInt(req.params.id);
    try {
      const projectReactions = await db
        .select()
        .from(reactions)
        .where(eq(reactions.projectId, projectId));
      res.json(projectReactions);
    } catch (error) {
      console.error("Error fetching reactions:", error);
      res.status(500).json({ error: "Failed to fetch reactions" });
    }
  });

  app.post("/api/projects/:id/reactions", async (req, res) => {
    const projectId = parseInt(req.params.id);
    const { emoji, sessionId } = req.body;

    try {
      const [newReaction] = await db
        .insert(reactions)
        .values({
          projectId,
          emoji,
          sessionId,
        })
        .returning();
      res.json(newReaction);
    } catch (error) {
      console.error("Error creating reaction:", error);
      res.status(500).json({ error: "Failed to create reaction" });
    }
  });

  // Projects API
  app.get("/api/projects", async (req, res) => {
    try {
      const allProjects = await db.select().from(projects);
      res.json(allProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Admin Projects API
  app.post("/api/projects", requireAdmin, async (req, res) => {
    try {
      const [newProject] = await db
        .insert(projects)
        .values({
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          images: req.body.images,
          featured: req.body.featured || false,
        })
        .returning();
      res.json(newProject);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", requireAdmin, async (req, res) => {
    try {
      const [updatedProject] = await db
        .update(projects)
        .set({
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          images: req.body.images,
          featured: req.body.featured,
        })
        .where(eq(projects.id, parseInt(req.params.id)))
        .returning();

      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Settings API
  app.get("/api/settings", async (req, res) => {
    try {
      const [currentSettings] = await db.select().from(settings).limit(1);
      res.json(
        currentSettings || { theme: { primary: "hsl(222.2 47.4% 11.2%)" } },
      );
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.json({ theme: { primary: "hsl(222.2 47.4% 11.2%)" } });
    }
  });

  app.patch("/api/settings", requireAdmin, async (req, res) => {
    const [existingSettings] = await db.select().from(settings).limit(1);

    if (existingSettings) {
      const updatedSettings = await db
        .update(settings)
        .set(req.body)
        .where(eq(settings.id, existingSettings.id))
        .returning();
      res.json(updatedSettings[0]);
    } else {
      const newSettings = await db
        .insert(settings)
        .values(req.body)
        .returning();
      res.json(newSettings[0]);
    }
  });

  // Submit a new testimonial
  app.post("/api/testimonials", async (req, res) => {
    try {
      const [newTestimonial] = await db
        .insert(testimonials)
        .values({
          name: req.body.name,
          role: req.body.role,
          content: req.body.content,
        })
        .returning();
      res.json(newTestimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  });

  // Get all testimonials (admin only)
  app.get("/api/testimonials", requireAdmin, async (req, res) => {
    try {
      const allTestimonials = await db.select().from(testimonials);
      res.json(allTestimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  // Update testimonial status with notification
  app.patch("/api/testimonials/:id/status", requireAdmin, async (req, res) => {
    const testimonialId = parseInt(req.params.id);
    const { approved, rejected } = req.body;

    try {
      const [updatedTestimonial] = await db
        .update(testimonials)
        .set({ approved, rejected })
        .where(eq(testimonials.id, testimonialId))
        .returning();

      if (!updatedTestimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      // Create notifications for admins
      const adminUsers = await db
        .select()
        .from(users)
        .where(eq(users.isAdmin, true));

      const status = approved ? "approved" : rejected ? "rejected" : "updated";

      // Create notifications for all admins
      await Promise.all(
        adminUsers.map((admin) =>
          createNotification(
            admin.id,
            "Testimonial Status Update",
            `A testimonial from ${updatedTestimonial.name} has been ${status}`,
            "testimonial",
          ),
        ),
      );

      // Broadcast cache invalidation
      invalidateAdminCache("testimonials");
      invalidateAdminCache("notifications");

      res.json(updatedTestimonial);
    } catch (error) {
      console.error("Error updating testimonial status:", error);
      res.status(500).json({ error: "Failed to update testimonial status" });
    }
  });

  // Delete testimonial (admin only)
  app.delete("/api/testimonials/:id", requireAdmin, async (req, res) => {
    const testimonialId = parseInt(req.params.id);

    try {
      const [deletedTestimonial] = await db
        .delete(testimonials)
        .where(eq(testimonials.id, testimonialId))
        .returning();

      if (!deletedTestimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }

      // Create notifications for admins about the deletion
      const adminUsers = await db
        .select()
        .from(users)
        .where(eq(users.isAdmin, true));

      // Create notifications for all admins
      await Promise.all(
        adminUsers.map((admin) =>
          createNotification(
            admin.id,
            "Testimonial Deleted",
            `A testimonial from ${deletedTestimonial.name} has been deleted`,
            "testimonial",
          ),
        ),
      );

      // Broadcast cache invalidation
      invalidateAdminCache("testimonials");
      invalidateAdminCache("notifications");

      res.json(deletedTestimonial);
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });

  // Get approved testimonials (public)
  app.get("/api/testimonials/approved", async (req, res) => {
    try {
      const approvedTestimonials = await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.approved, true))
        .orderBy(desc(testimonials.createdAt));
      res.json(approvedTestimonials);
    } catch (error) {
      console.error("Error fetching approved testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  // Get user's notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, req.user.id))
        .orderBy(desc(notifications.createdAt));

      res.json(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const notificationId = parseInt(req.params.id);

    try {
      const [updatedNotification] = await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, req.user.id),
          ),
        )
        .returning();

      if (!updatedNotification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      // Broadcast cache invalidation for notifications
      invalidateAdminCache("notifications");

      res.json(updatedNotification);
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/mark-all-read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, req.user.id));

      // Broadcast cache invalidation for notifications
      invalidateAdminCache("notifications");

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to update notifications" });
    }
  });

  return httpServer;
}
