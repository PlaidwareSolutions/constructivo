import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { users } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import type { User } from "@db/schema";

// Extend Express.User interface without circular reference
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name: string;
      isAdmin: boolean;
      createdAt: Date;
    }
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "constructivo-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = {
      secure: true,
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Get domain from request with improved handling for development URLs
  const getDomain = (req: any) => {
    let domain;
    const referer = req.headers.referer;
    if (referer) {
      const refererUrl = new URL(referer);
      if (refererUrl.hostname.includes('.worf.replit.dev')) {
        return refererUrl.hostname;
      }
    }

    const host = req.get('host');
    if (host) {
      if (host.includes('.worf.replit.dev')) {
        return host;
      }
      if (host.includes('repl.co')) {
        return host;
      }
    }

    const replId = process.env.REPL_ID;
    const replSlug = process.env.REPL_SLUG;
    const replOwner = process.env.REPL_OWNER;

    if (replId) {
      return `${replId}.id.repl.co`;
    }
    if (replSlug && replOwner) {
      return `${replSlug}.${replOwner}.repl.co`;
    }

    throw new Error('Could not determine domain');
  };

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile.emails?.[0]?.value) {
            return done(new Error('No email provided in profile'));
          }

          const userEmail = profile.emails[0].value;

          let [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, userEmail))
            .limit(1);

          if (!existingUser) {
            const isFirstUser = (await db.select().from(users).limit(1)).length === 0;

            try {
              const [newUser] = await db
                .insert(users)
                .values({
                  email: userEmail,
                  name: profile.displayName || userEmail.split('@')[0],
                  isAdmin: isFirstUser, // First user is admin
                })
                .returning();

              existingUser = newUser;
            } catch (err) {
              console.error('Failed to create user:', err);
              return done(new Error('Failed to create user account'));
            }
          }

          return done(null, {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            isAdmin: existingUser.isAdmin,
            createdAt: existingUser.createdAt,
          });
        } catch (err) {
          console.error('Error in Google OAuth callback:', err);
          return done(err as Error);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        return done(new Error('User not found'));
      }

      done(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      });
    } catch (err) {
      done(err);
    }
  });

  app.get(
    "/auth/google",
    (req, res, next) => {
      try {
        const domain = getDomain(req);
        const callbackUrl = `https://${domain}/auth/google/callback`;

        passport.authenticate("google", {
          scope: ["profile", "email"],
          prompt: 'select_account',
          callbackURL: callbackUrl,
          state: 'replit-oauth-' + Date.now()
        } as any)(req, res, next);
      } catch (error) {
        res.redirect('/auth?error=' + encodeURIComponent('Failed to initiate OAuth flow. Please try again.'));
      }
    }
  );

  app.get(
    "/auth/google/callback",
    (req, res, next) => {
      try {
        const domain = getDomain(req);
        const callbackUrl = `https://${domain}/auth/google/callback`;

        passport.authenticate("google", {
          failureRedirect: "/auth",
          failureMessage: true,
          callbackURL: callbackUrl
        } as any)(req, res, next);
      } catch (error) {
        res.redirect('/auth?error=' + encodeURIComponent('Failed to complete authentication. Please try again.'));
      }
    },
    (req, res) => {
      res.redirect("/admin");
    }
  );

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).send("Logout failed");
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).send("Not logged in");
  });
}