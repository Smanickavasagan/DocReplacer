import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually load .env if it exists (for local development)
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Ensure required environment variables are set
if (!process.env.VITE_FIREBASE_API_KEY) {
  console.warn("WARNING: Missing VITE_FIREBASE_API_KEY. Ensure deployment environment variables are configured.");
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BASE_URL = "https://www.docreplacer.online";
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const SITEMAP_PATH = path.join(PUBLIC_DIR, "sitemap.xml");

const STATIC_ROUTES = [
  "/",
  "/app",
  "/docs",
  "/how-it-works",
  "/use-cases",
  "/blog"
];

async function generateSitemap() {
  console.log("Generating sitemap...");
  
  const urls = [...STATIC_ROUTES];
  
  try {
    console.log("Fetching published blogs from Firestore...");
    const q = query(collection(db, "blogs"), where("status", "==", "published"));
    const snap = await getDocs(q);
    
    snap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.slug) {
        urls.push(`/blog/${data.slug}`);
      }
    });
    console.log(`Found ${snap.docs.length} published blogs.`);
  } catch (error) {
    console.error("Failed to fetch blogs from Firestore. Only static routes will be added.", error);
  }

  const currentDate = new Date().toISOString();

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${url === '/' || url === '/blog' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${url === '/' ? '1.0' : url.startsWith('/blog') ? '0.8' : '0.9'}</priority>
  </url>`).join("\n")}
</urlset>`;

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  fs.writeFileSync(SITEMAP_PATH, xmlContent, "utf-8");
  console.log(`Successfully generated sitemap at ${SITEMAP_PATH}`);
  console.log(`Total URLs: ${urls.length}`);
  process.exit(0);
}

generateSitemap();
