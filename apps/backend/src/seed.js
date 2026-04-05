import { getPrisma } from "./application/database.js";

const prisma = getPrisma();

/**
 * Utility untuk memproses data secara bertahap (Lazy / Chunking)
 * @param {Array} items - Array data yang mau diproses
 * @param {number} chunkSize - Jumlah data per batch (misal: 5)
 * @param {Function} processor - Fungsi yang dijalankan per item
 * @param {number} delayMs - Waktu jeda antar batch dalam milidetik
 */
async function processInChunks(items, chunkSize, processor, delayMs = 200) {
  const results = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    console.log(`⏳ Memproses batch ${Math.floor(i / chunkSize) + 1} dari ${Math.ceil(items.length / chunkSize)}...`);
    
    // Proses 1 chunk secara bersamaan
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    
    // Jeda sejenak sebelum lanjut ke chunk berikutnya untuk mendinginkan koneksi DB
    if (i + chunkSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return results;
}

async function main() {
  console.log("🌱 Memulai proses BULK seeding (Lazy/Chunking Mode)...");

  // =====================================================================
  // 1. CLEANUP
  // =====================================================================
  console.log("🧹 Membersihkan data lama...");
  const tables = [
    prisma.comment, prisma.projectStack, prisma.stack,
    prisma.projectThumbnail, prisma.projectDetail, prisma.blogDetail,
    prisma.project, prisma.blog, prisma.category,
    prisma.education, prisma.cV, prisma.certificate,
    prisma.asset, prisma.user
  ];

  for (const table of tables) {
    if (table && table.deleteMany) await table.deleteMany().catch(() => {});
  }

  // =====================================================================
  // 2. SEED USERS
  // =====================================================================
  console.log("\n👤 Membuat data Users...");
  const usersData = Array.from({ length: 15 }).map((_, i) => ({
    name: i === 0 ? "Admin Super" : `User Keren ${i}`,
    email: i === 0 ? "admin@example.com" : `user${i}@example.com`,
    role: i === 0 ? "ADMIN" : "USER",
    about: `Halo, saya adalah user nomor ${i}!`,
  }));

  const createdUsers = await processInChunks(usersData, 5, async (u) => {
    return await prisma.user.create({ data: u });
  });
  const admin = createdUsers[0];

  // =====================================================================
  // 3. SEED CATEGORIES
  // =====================================================================
  console.log("\n🏷️ Membuat data Categories...");
  const categoriesData = [
    { name: "Teknologi", type: "BLOG" }, { name: "Tutorial", type: "BLOG" },
    { name: "Gaya Hidup", type: "BLOG" }, { name: "Karir", type: "BLOG" },
    { name: "Berita IT", type: "BLOG" }, { name: "Web App", type: "PROJECT" },
    { name: "Mobile App", type: "PROJECT" }, { name: "Open Source", type: "PROJECT" },
    { name: "AI", type: "PROJECT" }, { name: "UI/UX", type: "PROJECT" },
  ];

  const createdCategories = await processInChunks(categoriesData, 5, async (c) => {
    return await prisma.category.create({ data: c });
  });
  const blogCats = createdCategories.filter((c) => c.type === "BLOG");
  const projCats = createdCategories.filter((c) => c.type === "PROJECT");

  // =====================================================================
  // 4. SEED STACKS
  // =====================================================================
  console.log("\n🛠️ Membuat data Stacks...");
  const stacksData = [
    "React", "Node.js", "Vue", "Angular", "Python",
    "PostgreSQL", "MongoDB", "Docker", "AWS", "TailwindCSS"
  ];
  
  const createdStacks = await processInChunks(stacksData, 5, async (s) => {
    return await prisma.stack.create({
      data: { name: s, url: `https://${s.toLowerCase()}.org` },
    });
  });

  // =====================================================================
  // 5. SEED BLOGS
  // =====================================================================
  console.log("\n📝 Membuat data Blogs...");
  const blogsData = Array.from({ length: 15 }).map((_, i) => ({
    title: `Artikel Blog Lazy Mode Ke-${i + 1}`,
    slug: `artikel-blog-lazy-mode-ke-${i + 1}`,
    summary: `Ringkasan untuk artikel ke-${i + 1}.`,
    status: "PUBLISHED",
    isFeatured: i < 3,
    viewCount: Math.floor(Math.random() * 500),
    tags: ["Tech", "Lazy Load"],
    authorId: admin.id,
    categoryId: blogCats[i % blogCats.length].id,
  }));

  const createdBlogs = await processInChunks(blogsData, 5, async (b) => {
    return await prisma.blog.create({
      data: {
        ...b,
        detail: { create: { contentHtml: `<p>Konten panjang dari ${b.title}</p>` } },
      },
    });
  });

  // =====================================================================
  // 6. SEED PROJECTS
  // =====================================================================
  console.log("\n🚀 Membuat data Projects...");
  const projectsData = Array.from({ length: 15 }).map((_, i) => ({
    title: `Project Portofolio Lazy ${i + 1}`,
    slug: `project-portofolio-lazy-${i + 1}`,
    summary: `Deskripsi project ke-${i + 1}.`,
    status: "PUBLISHED",
    isFeatured: i < 3,
    demoUrl: `https://demo-${i + 1}.com`,
    authorId: admin.id,
    categoryId: projCats[i % projCats.length].id,
    stack1: createdStacks[i % createdStacks.length].id, // Simulasi data relasi
    stack2: createdStacks[(i + 1) % createdStacks.length].id,
  }));

  const createdProjects = await processInChunks(projectsData, 5, async (p) => {
    const { stack1, stack2, ...projectData } = p;
    return await prisma.project.create({
      data: {
        ...projectData,
        detail: { create: { contentHtml: `<h2>Detail ${p.title}</h2>` } },
        stacks: { create: [{ stackId: stack1 }, { stackId: stack2 }] },
      },
    });
  });

  // =====================================================================
  // 7. SEED COMMENTS
  // =====================================================================
  console.log("\n💬 Membuat data Comments...");
  const commentsData = Array.from({ length: 20 }).map((_, i) => {
    const isBlogComment = i % 2 === 0;
    return {
      content: `Komentar lazy mode ke-${i + 1} sangat mantap!`,
      userId: createdUsers[(i % 14) + 1].id, // Ambil user selain admin
      blogId: isBlogComment ? createdBlogs[i % createdBlogs.length].id : null,
      projectId: !isBlogComment ? createdProjects[i % createdProjects.length].id : null,
    };
  });

  await processInChunks(commentsData, 5, async (c) => {
    return await prisma.comment.create({ data: c });
  });

  console.log("\n✅ Semua proses seeding dengan skema Lazy selesai tanpa timeout!");
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });