// import './style.css'
// import heroImg from './assets/hero.png'
// import typescriptLogo from './assets/typescript.svg'
// import viteLogo from './assets/vite.svg'
// import { setupCounter } from './counter.ts'

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
// <section id="center">
//   <div class="hero">
//     <img src="${heroImg}" class="base" width="170" height="179">
//     <img src="${typescriptLogo}" class="framework" alt="TypeScript logo"/>
//     <img src="${viteLogo}" class="vite" alt="Vite logo" />
//   </div>
//   <div>
//     <h1>Get started</h1>
//     <p>Edit <code>src/main.ts</code> and save to test <code>HMR</code></p>
//   </div>
//   <button id="counter" type="button" class="counter"></button>
// </section>

// <div class="ticks"></div>

// <section id="next-steps">
//   <div id="docs">
//     <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#documentation-icon"></use></svg>
//     <h2>Documentation</h2>
//     <p>Your questions, answered</p>
//     <ul>
//       <li>
//         <a href="https://vite.dev/" target="_blank">
//           <img class="logo" src="${viteLogo}" alt="" />
//           Explore Vite
//         </a>
//       </li>
//       <li>
//         <a href="https://www.typescriptlang.org" target="_blank">
//           <img class="button-icon" src="${typescriptLogo}" alt="">
//           Learn more
//         </a>
//       </li>
//     </ul>
//   </div>
//   <div id="social">
//     <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#social-icon"></use></svg>
//     <h2>Connect with us</h2>
//     <p>Join the Vite community</p>
//     <ul>
//       <li><a href="https://github.com/vitejs/vite" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>GitHub</a></li>
//       <li><a href="https://chat.vite.dev/" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#discord-icon"></use></svg>Discord</a></li>
//       <li><a href="https://x.com/vite_js" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#x-icon"></use></svg>X.com</a></li>
//       <li><a href="https://bsky.app/profile/vite.dev" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#bluesky-icon"></use></svg>Bluesky</a></li>
//     </ul>
//   </div>
// </section>

// <div class="ticks"></div>
// <section id="spacer"></section>
// `

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)


// src/main.ts

// 1. Gather all markdown files from the recipes folder as raw text strings
// const recipeModules = import.meta.glob('./recipes/*.cook', { query: '?raw', eager: false });

// async function loadRecipes() {
//   const recipeContainer = document.getElementById('recipe-container');
//   if (!recipeContainer) return;

//   // 2. Loop through each matched file path
//   for (const path in recipeModules) {
//     // Dynamically import the text content of the markdown file
//     const fileContent = (await recipeModules[path]()) as unknown as { default: string };
//     const rawMarkdown = fileContent.default;

//     // Extract a cleaner title from the path (e.g., "./recipes/lasagna.md" -> "lasagna")
//     const recipeName = path.split('/').pop()?.replace('.cook', '') || 'Recipe';

//     // 3. Create HTML elements to display the content
//     const recipeSection = document.createElement('div');
//     recipeSection.className = 'recipe-card';

// //     const htmlContent = await marked.parse(rawMarkdown);
// // recipeSection.innerHTML = `
// //   <article class="recipe">
// //     ${htmlContent}
// //   </article>
// // `;
    
//     recipeSection.innerHTML = `
//       <h2>${recipeName.toUpperCase()}</h2>
//       <!-- For a production site, parse 'rawMarkdown' using a library like 'marked' -->
//       <pre>${rawMarkdown}</pre> 
//     `;

//     recipeContainer.appendChild(recipeSection);
//   }
// }

// loadRecipes();
import { renderRecipe } from './render-recipe.ts';
// 1. Alle Markdown-Dateien als Raw-Text einlesen
const recipeModules = import.meta.glob('./recipes/*.cook', { query: '?raw' });

// Hilfsfunktion: Holt den Rezeptnamen aus dem Dateipfad (z.B. "./recipes/lasagna.md" -> "lasagna")
const getRecipeSlug = (path: string) => path.split('/').pop()?.replace('.cook', '') || '';

interface Recipe {
  slug: string;
  title: string;
  img: string;
  time: string;
}

interface Product {
  title: string;
  link: string;
}

async function router(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  const urlParams = new URLSearchParams(window.location.search);
  const pageName = urlParams.get('recipe');

  if (pageName) {
    await renderIndividualRecipe(app, pageName);
  } else {
    // Fetch the dynamic list from the public directory
    const recipes = await fetchRecipeList();
    renderRecipeList(app, recipes);
    const products = await fetchProductList();
    renderProductList(app, products);
    renderSources(app);
  }
}

function renderRecipeList(container: HTMLDivElement, recipes: Recipe[]): void {
  const section = document.createElement("section");

  if (recipes.length === 0) {
    container.innerHTML = '<p>No recipes found.</p>';
    return;
  }

  // const listHtml = recipes.map(recipe => `
  //   <li><a href="?recipe=${recipe.slug}">${recipe.title}</a></li>
  // `).join('');

  const listHtml =  recipes.map(recipe => `
    <a href="?recipe=${recipe.slug}">
      <article class="recipe-card" data-kind="quick">
        <img class="recipe-image" src=${recipe.img}>
        <div class="recipe-info">
          <span class="recipe-time">${recipe.time} min</span>
          <h3>${recipe.title}</h3>
        </div>
      </article>
    </a>
  `).join('');

  /*section.innerHTML = `
    <header class="site-header"><h1>Rezepte für Mama</h1></header>
    <main class="main-content"><ul class="recipe-list">${listHtml}</ul></main>
  `;*/
  
  section.innerHTML = `
    <div class="wrap">
      <h2>Rezepte für Mama</h2>
      <div class="recipe-grid">${listHtml}</div>
    </div>
  `

  container.appendChild(section);
}

function renderProductList(container: HTMLDivElement, products: Product[]): void {
  const section = document.createElement("section");

  section.className = "products";

  const colors = ['#fffaf0', '#f49a66', '#b8d55b', '#f5c84b'];       

  const listHtml = products.map(product => {
    const random_color = colors[(Math.floor(Math.random() * colors.length))];
    return `
      <a class="product" style="background: ${random_color}" href="${product.link}" target="_blank">
        <article>
          <h3>${product.title}</h3>
        </article>
      </a>
    `
  }).join('');
  // const listHtml = products.map(product => `
  //   <li><a href="${product.link}" target="_blank">${product.title}</a></li>
  // `).join('');

  section.innerHTML = `
    <div class="wrap">
      <h2>Meine Lieblingsprodukte</h2>
      <div class="product-grid">${listHtml}</div>
    </div>
  `;

  container.appendChild(section);
}

function renderSources(container: HTMLDivElement): void {
  const section = document.createElement("section");
  section.className = "sources";

  section.innerHTML = `
    <div class="wrap">
      <h2>Rezept Inspirationen</h2>
      <div class="source-grid">
        <a class="button" href="https://veggie-einhorn.de/" target="_blank">Veggie Einhorn</a>
        <a class="button" href="https://biancazapatka.com/de/" target="_blank">Bianca Zapatka</a>
        <a class="button" href="https://www.zuckerjagdwurst.com/de" target="_blank">Zucker&Jagdwurst</a>
      </div>
    </div>
  `;

  container.appendChild(section);
}

async function renderIndividualRecipe(container: HTMLDivElement, slug: string): Promise<void> {
  // Find the recipe metadata to display a friendly title immediately if desired
  //const recipeInfo = RECIPES.find(r => r.slug === slug);

  try {
    // Show a quick loading state while fetching the markdown file
    container.innerHTML = `<div class="loading">Loading delicious details...</div>`;

    // Resolve path relative to GitHub Pages base URL (e.g., /repo-name/docs/pancakes.md)
    const markdownUrl = `${import.meta.env.BASE_URL}recipes/${slug}.cook`;
    const response = await fetch(markdownUrl);

    if (!response.ok) {
      throw new Error(`Recipe file "${slug}.md" not found.`);
    }

    const rawText = await response.text();
    // Parse markdown to HTML
    const htmlContent = renderRecipe(rawText) as HTMLElement;

  //   <main>
  //   <section class="recipe-hero"><div class="wrap hero-grid"><div class="hero-image-wrap"><img class="hero-image" src="https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&amp;fit=crop&amp;w=1000&amp;q=85" alt="Colorful vegan tacos with vegetables and lime"><div class="sticker sticker-one">crunch<br>club</div><div class="sticker sticker-two">100%<br>plant<br>power</div><div class="scribble one">eat this with your hands</div></div><div><span class="eyebrow">The instant classic / recipe 01</span><h1>Smoky sweet <span>potato tacos.</span></h1><p class="intro">Crunchy, creamy, spicy, with a squeeze of lime that ties the whole party together. This is the kind of dinner that makes a vegan month feel like a very good trade.</p><div class="recipe-meta"><div class="meta-item">Time<strong>25 min</strong></div><div class="meta-item">Makes<strong>8 tacos</strong></div><div class="meta-item">Mood<strong>Big yes</strong></div></div><a class="button" href="#method">Start cooking</a><a class="button alt" href="/content/">All recipes</a></div></div></section>
  //   <div class="ticker" aria-hidden="true"><div class="ticker-track"><span>smoky</span><span>crispy</span><span>creamy</span><span>very snackable</span><span>smoky</span><span>crispy</span><span>creamy</span><span>very snackable</span></div></div>
  //   <section class="detail"><div class="wrap detail-grid"><aside class="panel"><h2>What you need.</h2><div class="ingredient-group"><h3>For the filling</h3><ul><li><span>Sweet potatoes, peeled + cubed</span><span class="quantity">2 medium</span></li><li><span>Olive oil</span><span class="quantity">2 tbsp</span></li><li><span>Smoked paprika</span><span class="quantity">1 tsp</span></li><li><span>Ground cumin</span><span class="quantity">1 tsp</span></li><li><span>Black beans, drained</span><span class="quantity">1 can</span></li><li><span>Small tortillas</span><span class="quantity">8</span></li></ul></div><div class="ingredient-group"><h3>For the good stuff</h3><ul><li><span>Avocado</span><span class="quantity">1</span></li><li><span>Lime, juice + wedges</span><span class="quantity">1</span></li><li><span>Red cabbage, shredded</span><span class="quantity">1 handful</span></li><li><span>Vegan yoghurt</span><span class="quantity">4 tbsp</span></li><li><span>Coriander + salt</span><span class="quantity">to finish</span></li></ul></div></aside><div class="method" id="method"><h2>How to make the magic.</h2><p class="method-intro">No fancy equipment. No obscure ingredients. Just a tray, a pan and about 25 minutes between you and a very good dinner.</p><div class="step"><div class="step-number">01</div><div><h3>Get the sweet potatoes going.</h3><p>Heat your oven to 220 C. Toss the cubes with oil, paprika, cumin and a generous pinch of salt. Roast for 20 minutes, turning once, until the edges are caramelised.</p></div></div><div class="step"><div class="step-number">02</div><div><h3>Wake up the beans.</h3><p>Warm the black beans in a pan with a splash of water and another little pinch of cumin. Mash a few with the back of your spoon so the filling gets wonderfully scoopable.</p></div></div><div class="step"><div class="step-number">03</div><div><h3>Make the lime cloud.</h3><p>Stir the yoghurt with lime juice and salt. Add a tiny splash of water if it needs to become drizzle-able. Taste it. Add more lime. You know what to do.</p></div></div><div class="step"><div class="step-number">04</div><div><h3>Build your little towers.</h3><p>Warm the tortillas, then layer beans, sweet potato, cabbage, avocado and lime yoghurt. Finish with coriander and a squeeze of lime. Eat immediately.</p></div></div><div class="tip"><strong>My tiny secret</strong><p>Put the tortillas directly over a low gas flame for a few seconds per side. Those little charred freckles are the whole personality of the taco.</p></div></div></div></section>
  // </main>

    //Inject layout containing a "Back" button and the rendered markdown
    container.innerHTML = `
      <nav class="recipe-nav">
        <a class="button" href="${import.meta.env.BASE_URL}" >← Zurück zur Übersicht</a>
      </nav>
      <main class="main-content recipe-body">
        <article class="prose">
          ${htmlContent.outerHTML}
        </article>
      </main>
    `;
  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <div class="error-container">
        <h1>Recipe Not Found</h1>
        <p>Sorry, we couldn't find the recipe for "<strong>${slug}</strong>".</p>
        <a href="${import.meta.env.BASE_URL}" class="back-btn">Return to Homepage</a>
      </div>
    `;
  }
}

async function fetchRecipeList(): Promise<Recipe[]> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}recipes.json`);
    if (!response.ok) throw new Error('Failed to fetch recipe index');
    return await response.json();
  } catch (error) {
    console.error('Error loading recipe index:', error);
    return []; // Return empty array fallback
  }
}

async function fetchProductList(): Promise<Product[]> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}vegan-products.json`);
    if (!response.ok) throw new Error('Failed to fetch recipe index');
    return await response.json();
  } catch (error) {
    console.error('Error loading recipe index:', error);
    return []; // Return empty array fallback
  }
}

async function renderApp() {
  const appContainer = document.getElementById('app');

  if (!appContainer) return;

  // Aktuelles Rezept aus der URL auslesen (z.B. ?recipe=lasagna)
  const urlParams = new URLSearchParams(window.location.search);
  const activeRecipeSlug = urlParams.get('recipe');

  // --- ANSICHT 1: Einzelnes Rezept anzeigen ---
  if (activeRecipeSlug) {
    // Den passenden Dateipfad in den Modulen finden
    const matchingPath = Object.keys(recipeModules).find(path => getRecipeSlug(path) === activeRecipeSlug);

    if (matchingPath) {
      const fileContent = (await recipeModules[matchingPath]()) as unknown as { default: string };
      const rawMarkdown = fileContent.default;
      const htmlContent = renderRecipe(rawMarkdown) as HTMLElement; // Hier könnte man eine Markdown-zu-HTML-Bibliothek wie 'marked' verwenden 

      appContainer.innerHTML = `
        <a href="." class="back-link">← Zurück zur Übersicht</a>
        <article class="recipe-detail">
          ${htmlContent.outerHTML}
        </article>
      `;
      return;
    }
  }

  // --- ANSICHT 2: Liste aller Rezepte anzeigen ---
  appContainer.innerHTML = `
    <h1 id="mainTitle">Rezepte für Mama</h1>
    <ul class="recipe-list"></ul>
  `;

  const listElement = appContainer.querySelector('.recipe-list')!;

  for (const path in recipeModules) {
    const slug = getRecipeSlug(path);
    // Schönere Formatierung für den Linktext (z.B. "apfel-kuchen" -> "Apfel Kuchen")
    const displayName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href="?recipe=${slug}">${displayName}</a>`;
    listElement.appendChild(listItem);
  }
}

// Event-Listener für Vor-/Zurück-Buttons des Browsers, damit das Routing ohne Neuladen klappt
window.addEventListener('popstate', renderApp);

// Initiales Rendern beim Laden der Seite
//renderApp();

router();
