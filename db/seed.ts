import { db } from "./index";
import { users, projects, testimonials, notifications, settings, reactions } from "@db/schema";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Seed users
    console.log("Seeding users...");
    const [adminUser, regularUser] = await Promise.all([
      db.insert(users).values({
        email: "admin@houston-construction.com",
        name: "Admin User",
        isAdmin: true,
      }).returning(),
      db.insert(users).values({
        email: "user@houston-construction.com",
        name: "Regular User",
        isAdmin: false,
      }).returning(),
    ]);
    console.log(`✅ Created ${2} users`);

    // Seed projects
    console.log("Seeding projects...");
    const projectsData = [
      {
        title: "Downtown Houston Office Complex",
        description: "A modern 20-story office building featuring sustainable design and smart technology integration.",
        category: "Commercial",
        images: [
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
          "https://images.unsplash.com/photo-1545041552-4d96bc73b740",
        ],
        featured: true,
      },
      {
        title: "Luxury Residential Development",
        description: "High-end residential community with premium amenities and contemporary architecture.",
        category: "Residential",
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
        ],
        featured: true,
      },
      {
        title: "Mixed-Use Development Project",
        description: "Combined retail and office space with modern amenities and excellent accessibility.",
        category: "Commercial",
        images: [
          "https://images.unsplash.com/photo-1577495508048-b635879837f1",
          "https://images.unsplash.com/photo-1577495508326-19a3be51a526",
        ],
        featured: false,
      },
    ];

    const seededProjects = await Promise.all(
      projectsData.map(project => 
        db.insert(projects).values(project).returning()
      )
    );
    console.log(`✅ Created ${seededProjects.length} projects`);

    // Seed testimonials
    console.log("Seeding testimonials...");
    const testimonialsData = [
      {
        name: "John Smith",
        role: "Property Developer",
        content: "Exceptional work on our downtown project. The team's attention to detail and commitment to quality was outstanding.",
        approved: true,
        rejected: false,
      },
      {
        name: "Sarah Johnson",
        role: "Business Owner",
        content: "The renovation of our retail space exceeded expectations. Professional team and excellent communication throughout.",
        approved: true,
        rejected: false,
      },
    ];

    const seededTestimonials = await Promise.all(
      testimonialsData.map(testimonial =>
        db.insert(testimonials).values(testimonial).returning()
      )
    );
    console.log(`✅ Created ${seededTestimonials.length} testimonials`);

    // Seed notifications
    console.log("Seeding notifications...");
    const notificationsData = [
      {
        userId: adminUser[0].id,
        title: "New Project Approval",
        message: "Downtown Houston Office Complex has been approved for construction.",
        type: "system",
        read: false,
      },
      {
        userId: regularUser[0].id,
        title: "Welcome!",
        message: "Welcome to Houston Construction Project Management System.",
        type: "system",
        read: false,
      },
    ];

    const seededNotifications = await Promise.all(
      notificationsData.map(notification =>
        db.insert(notifications).values(notification).returning()
      )
    );
    console.log(`✅ Created ${seededNotifications.length} notifications`);

    // Seed settings
    console.log("Seeding settings...");
    await db.insert(settings).values({
      theme: {
        primary: "#2563eb",
        variant: "professional",
        appearance: "system",
        radius: 0.5,
      },
    });
    console.log("✅ Created default settings");

    // Seed reactions
    console.log("Seeding reactions...");
    const reactionsData = [
      {
        projectId: seededProjects[0][0].id,
        emoji: "👍",
        sessionId: "sample-session-1",
      },
      {
        projectId: seededProjects[0][0].id,
        emoji: "❤️",
        sessionId: "sample-session-2",
      },
    ];

    const seededReactions = await Promise.all(
      reactionsData.map(reaction =>
        db.insert(reactions).values(reaction).returning()
      )
    );
    console.log(`✅ Created ${seededReactions.length} reactions`);

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Execute the seed function
seed()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  });
