import {
    Parser,
    ingredient_display_name,
    cookware_display_name,
    quantity_display,
    grouped_quantity_display,
    type Section,
    type ScaledRecipeWithReport,
} from '@cooklang/cooklang';
import type { GroupedIndexAndQuantity } from '@cooklang/cooklang/pkg/cooklang_wasm';

class RecipeRenderer {
  private parsedRecipe: ScaledRecipeWithReport;
  private groupedIngredients: GroupedIndexAndQuantity[];

  constructor(recipeText: string) {
    const parser = new Parser();
    this.parsedRecipe = parser.parse(recipeText);
    this.groupedIngredients = parser.group_ingredients(this.parsedRecipe);
  }

  public render(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'recipe-container';

    const recipeHero = this.renderHero();
    wrapper.append(recipeHero);

    const main = this.renderMain();
    wrapper.append(main);

    // const image = this.renderImage();
    // wrapper.append(image);

    // const title = this.renderTitle();
    // wrapper.append(title);

    // const metadata = this.renderMetadata();
    // wrapper.append(metadata);

    // // Render ingredients
    // const ingredientsList = this.renderIngredients();
    // wrapper.appendChild(ingredientsList);

    // // Render steps
    // const stepsList = this.renderSteps(this.parsedRecipe.recipe.sections);
    // wrapper.appendChild(stepsList);

    return wrapper;
  }

  private renderIngredients(): HTMLElement {
    const ingredientsWrapper = document.createElement('ul');
    ingredientsWrapper.className = 'recipe-ingredients';

    // this.parsedRecipe.recipe.ingredients.forEach(ingredient => {
    //   const listItem = document.createElement('li');
    //   listItem.innerHTML = `
    //     <span>${ingredient_display_name(ingredient) + (ingredient.note ? ` (${ingredient.note})` : '')}</span>
    //     <span class="quantity">${ingredient.quantity ? `${quantity_display(ingredient.quantity)}` : ''}</span>
    //   `;
    //   // listItem.textContent = (ingredient.quantity ? `${quantity_display(ingredient.quantity)}` : '') + " " + ingredient_display_name(ingredient) + (ingredient.note ? ` (${ingredient.note})` : '');
    //   ingredientsWrapper.appendChild(listItem);
    // });

    this.parsedRecipe.recipe.ingredients.forEach((ingredient, index) => {
      const groupedIngredient = this.groupedIngredients.find(group => group.index === index);
      if(!groupedIngredient) return;
      const quantityDisplay = grouped_quantity_display(groupedIngredient.quantity);
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <span>${ingredient_display_name(ingredient) + (ingredient.note ? ` (${ingredient.note})` : '')}</span>
        <span class="quantity">${quantityDisplay}</span>
      `;
      ingredientsWrapper.appendChild(listItem);
    });

    return ingredientsWrapper;
  }

  // private renderImage(): HTMLElement {
  //   const imageSrc = this.parsedRecipe.metadata.images;
  //   const heroImage = document.createElement("div");
  //   if (!imageSrc) return heroImage;
  //   const imageUrl = imageSrc.includes("https") ? imageSrc : `${import.meta.env.BASE_URL}recipes/${imageSrc}`;
  //   heroImage.className = "recipe-image";
  //   heroImage.style.backgroundImage = `url('${imageUrl}')`;
  //   return heroImage;
  // }

  // private renderTitle(): HTMLElement {
  //   const title = document.createElement("h1");
  //   title.innerText = this.parsedRecipe.metadata.title || "";
  //   return title;
  // }

  private renderHero(): HTMLElement {

    const section = document.createElement("section");
    section.className = "recipe-hero";

    const time = this.parsedRecipe.metadata.time;
    let totalTime = "";

    if(typeof(time) === 'number'){
        totalTime = time.toString();
    } else {
        const cookTime = time?.cook_time || 0;
        const prepTime = time?.prep_time || 0;
        totalTime = (cookTime + prepTime).toString();
    }

    const imageSrc = this.parsedRecipe.metadata.images;
    const imageUrl = imageSrc ? imageSrc.includes("https") ? imageSrc : `${import.meta.env.BASE_URL}recipes/${imageSrc}` : '';

    section.innerHTML = `
      <div class="wrap hero-grid">
        <div class="hero-image-wrap">
          <img class="hero-image" src="${imageUrl}">
        </div>
        <div>
          <h1>${this.parsedRecipe.metadata.title}</h1>
          <div class="recipe-meta">
            <div class="meta-item">Gesamtzeit<strong>${totalTime} min</strong></div>
            <div class="meta-item">Portionen<strong>${this.parsedRecipe.metadata.servings}</strong></div>
          </div>
        </div>
      </div>
    `;

    return section;
  }

  private renderMain(): HTMLElement{
    const section = document.createElement("section");
    section.className = "detail";

    const ingredients = this.renderIngredients();
    const steps = this.renderSteps(this.parsedRecipe.recipe.sections);

    section.innerHTML = `
      <div class="wrap detail-grid">
        <aside class="panel">
          ${ingredients.outerHTML}
        </aside>
        ${steps.outerHTML}
      </div>
    `;
        // <section class="detail"><div class="wrap detail-grid"><aside class="panel"><h2>What you need.</h2><div class="ingredient-group"><h3>For the filling</h3><ul><li><span>Sweet potatoes, peeled + cubed</span><span class="quantity">2 medium</span></li><li><span>Olive oil</span><span class="quantity">2 tbsp</span></li><li><span>Smoked paprika</span><span class="quantity">1 tsp</span></li><li><span>Ground cumin</span><span class="quantity">1 tsp</span></li><li><span>Black beans, drained</span><span class="quantity">1 can</span></li><li><span>Small tortillas</span><span class="quantity">8</span></li></ul></div><div class="ingredient-group"><h3>For the good stuff</h3><ul><li><span>Avocado</span><span class="quantity">1</span></li><li><span>Lime, juice + wedges</span><span class="quantity">1</span></li><li><span>Red cabbage, shredded</span><span class="quantity">1 handful</span></li><li><span>Vegan yoghurt</span><span class="quantity">4 tbsp</span></li><li><span>Coriander + salt</span><span class="quantity">to finish</span></li></ul></div></aside><div class="method" id="method"><h2>How to make the magic.</h2><p class="method-intro">No fancy equipment. No obscure ingredients. Just a tray, a pan and about 25 minutes between you and a very good dinner.</p><div class="step"><div class="step-number">01</div><div><h3>Get the sweet potatoes going.</h3><p>Heat your oven to 220 C. Toss the cubes with oil, paprika, cumin and a generous pinch of salt. Roast for 20 minutes, turning once, until the edges are caramelised.</p></div></div><div class="step"><div class="step-number">02</div><div><h3>Wake up the beans.</h3><p>Warm the black beans in a pan with a splash of water and another little pinch of cumin. Mash a few with the back of your spoon so the filling gets wonderfully scoopable.</p></div></div><div class="step"><div class="step-number">03</div><div><h3>Make the lime cloud.</h3><p>Stir the yoghurt with lime juice and salt. Add a tiny splash of water if it needs to become drizzle-able. Taste it. Add more lime. You know what to do.</p></div></div><div class="step"><div class="step-number">04</div><div><h3>Build your little towers.</h3><p>Warm the tortillas, then layer beans, sweet potato, cabbage, avocado and lime yoghurt. Finish with coriander and a squeeze of lime. Eat immediately.</p></div></div><div class="tip"><strong>My tiny secret</strong><p>Put the tortillas directly over a low gas flame for a few seconds per side. Those little charred freckles are the whole personality of the taco.</p></div></div></div></section>
    return section;
  }

  // private renderMetadata(): HTMLElement{
  //   const metadata = document.createElement("div");
  //   metadata.className = "metadata";

  //   const time = this.parsedRecipe.metadata.time;
  //   let totalTime = "";

  //   if(typeof(time) === 'number'){
  //       totalTime = time.toString();
  //   } else {
  //       const cookTime = time?.cook_time || 0;
  //       const prepTime = time?.prep_time || 0;
  //       totalTime = (cookTime + prepTime).toString();
  //   }

  //   metadata.innerHTML = `
  //       <div><span class="key">Portionen:</span> ${this.parsedRecipe.metadata.servings}</div>
  //       <div><span class="key">Gesamtzeit:</span> ${totalTime} Minuten</div>
  //   `
  //   return metadata;
  // }

  private renderSteps(sections: Section[]): HTMLElement {
    const stepsWrapper = document.createElement('div');
    stepsWrapper.className = 'method';
    stepsWrapper.id = "method";

    sections.forEach(section => {
      const sectionHeader = document.createElement('h3');
      sectionHeader.textContent = section.name;
      stepsWrapper.appendChild(sectionHeader);

      section.content.forEach((step, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'step';
        const stepNumber = document.createElement('div');
        stepNumber.classList = "step-number";
        stepNumber.innerText = (index + 1).toString().padStart(2, "0");
        listItem.appendChild(stepNumber);
        const content = document.createElement('p');
        if (step.type === 'text') {
          content.textContent = step.value;
        } else if (step.type === 'step') {
          const stepText = step.value.items.map((item: any) => {
            if (item.type === 'text') return item.value;
            if (item.type === 'ingredient') return ingredient_display_name(this.parsedRecipe.recipe.ingredients[item.index]);
            if (item.type === 'cookware') return cookware_display_name(this.parsedRecipe.recipe.cookware[item.index]);
            if (item.type === 'timer') {
              const timerItem = this.parsedRecipe.recipe.timers[item.index];
              return timerItem.quantity ? quantity_display(timerItem.quantity) : '';
            }
            return '';
          }).join('');
          content.textContent = stepText;
        }
        listItem.appendChild(content);
        stepsWrapper.appendChild(listItem);
      });
    });

    const description = this.parsedRecipe.metadata.description;
    if (description) {
      const tip = document.createElement('div');
      tip.className = 'tip';
      tip.innerHTML = `
        <p>${description}</p>
      `;
      stepsWrapper.appendChild(tip);
    }

    // Add description if available
        //     <div class="tip">
        //   <p>${this.parsedRecipe.metadata.description}</p>
        // </div>

    return stepsWrapper;
  }
}

export function renderRecipe(recipeText: string): HTMLElement {
  const renderer = new RecipeRenderer(recipeText);
  return renderer.render();
}

// function getIngredient

// function renderSteps(sections: Section[]): HTMLElement {
//     const wrapper = document.createElement('ul');
//     wrapper.className = 'recipe-steps';
//     sections.forEach(section => {
//         console.log(`Section: ${section.name}`);

//         const steps = section.content;
//         let stepText = "";
//         steps.forEach(step => {
//             const paragraph = document.createElement('li');
//             if (step.type === 'text') {
//                 stepText += step.value;
//             } else if (step.type === 'step') {
//                 const stepSection = step.value.items;
//                 let sectionText = "";
//                 stepSection.forEach(item => {
//                     if (item.type === 'text') {
//                         sectionText += item.value;
//                     } else if (item.type === 'ingredient') {
//                         const recipeItem = parsedRecipe.recipe.ingredients[item.index];
//                         sectionText += ingredient_display_name(recipeItem);
//                     } else if (item.type === 'cookware') {
//                         const cookwareItem = parsedRecipe.recipe.cookware[item.index];
//                         sectionText += cookware_display_name(cookwareItem);    
//                     } else if (item.type === 'timer') {
//                         const timerItem = parsedRecipe.recipe.timers[item.index];
//                         if(timerItem.quantity)
//                             sectionText += quantity_display(timerItem.quantity);
//                     }
//                 });
//                 stepText += sectionText;
//             }
//             paragraph.textContent = stepText;
//             wrapper.appendChild(paragraph);
//             stepText = ""; // Reset stepText for the next step
//         })
//     })
//     return wrapper;
// }

// export function renderRecipe(recipe: string): HTMLElement {
//     const parser = new Parser();
//     const parsedRecipe = parser.parse(recipe);
//     const wrapper = document.createElement('ul');
//     wrapper.className = 'recipe-steps';
//     const sections = parsedRecipe.recipe.sections;
//     sections.forEach(section => {
//         console.log(`Section: ${section.name}`);

//         const steps = section.content;
//         let stepText = "";
//         steps.forEach(step => {
//             const paragraph = document.createElement('li');
//             if (step.type === 'text') {
//                 stepText += step.value;
//             } else if (step.type === 'step') {
//                 const stepSection = step.value.items;
//                 let sectionText = "";
//                 stepSection.forEach(item => {
//                     if (item.type === 'text') {
//                         sectionText += item.value;
//                     } else if (item.type === 'ingredient') {
//                         const recipeItem = parsedRecipe.recipe.ingredients[item.index];
//                         sectionText += ingredient_display_name(recipeItem);
//                     } else if (item.type === 'cookware') {
//                         const cookwareItem = parsedRecipe.recipe.cookware[item.index];
//                         sectionText += cookware_display_name(cookwareItem);    
//                     } else if (item.type === 'timer') {
//                         const timerItem = parsedRecipe.recipe.timers[item.index];
//                         if(timerItem.quantity)
//                             sectionText += quantity_display(timerItem.quantity);
//                     }
//                 });
//                 stepText += sectionText;
//             }
//             paragraph.textContent = stepText;
//             wrapper.appendChild(paragraph);
//             stepText = ""; // Reset stepText for the next step
//         })

//         // section.content.forEach(content => {
//         //     if (content.type === 'text') {
//         //         console.log(`Text: ${content.value}`);
//         //     } else if (content.type === 'list') {
//         //         content.value.items.forEach(item => {
//         //             console.log(`- ${item.text}`);
//         //         });
//         //     }
//         // });
//         // text += stepText;
//         //wrapper.appendChild(paragraph);
//     })

//     // const steps = parsedRecipe.recipe.sections[0].content[0].value.items.map(step => step.text).join('\n');
//     return wrapper;
//     //return JSON.stringify(parsedRecipe, null, 2); // Return the parsed recipe as a JSON string for demonstration purposes
// }

// async function renderRecipe() {
//     const app = document.querySelector<HTMLDivElement>('#app');
//     if (!app) return;

//     const recipeTitle = document.querySelector('#recipe-title') as HTMLHeadingElement;

//     // 1. Parse the '?page=' parameter from the URL
//     const urlParams = new URLSearchParams(window.location.search);
//     const recipeName = urlParams.get('recipe');

//     //app.innerHTML = `<p>Loading recipe: ${recipeName}</p>`;

//     try {
//     // 2. Resolve the correct path relative to your GitHub Pages base URL
//     // Resolves to '/public/docs/filename.md' locally and '/repo-name/docs/filename.md' on production
//     //const markdownUrl = `${import.meta.env.BASE_URL}docs/${recipeName}.md`;
//     const markdownUrl = `recipes/${recipeName}.cook`;

//     // 3. Fetch the raw markdown file from the public folder
//     const response = await fetch(markdownUrl);

//     if (!response.ok) {
//       throw new Error(`File "${recipeName}.cook" not found (Status: ${response.status})`);
//     }

//     const rawRecipeText = await response.text();

//     recipeTitle.textContent = recipeName ? recipeName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Recipe';

//     // 4. Parse the raw text into HTML and inject it into the app container
//     //app.innerHTML = await JSON.stringify(rawMarkdownText);

//   } catch (error) {
//     console.error('Error loading markdown:', error);
//     app.innerHTML = `
//       <div class="error-container">
//         <h1>404 - Page Not Found</h1>
//         <p>Could not load the requested page: <strong>${recipeName}</strong></p>

//       </div>
//     `;
//   }
// }

// renderRecipe();