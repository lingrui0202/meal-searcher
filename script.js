// Recipe Finder（菜单搜索器）
// 使用 TheMealDB 开放 API 实现菜谱搜索和详情展示
// 参考课程思路：搜索框 -> 查询 API -> 渲染卡片 -> 点击卡片 -> 显示详情面板

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

// DOM 元素缓存
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsContainer = document.getElementById("results");
const messageBox = document.getElementById("messageBox");

const mealModal = document.getElementById("mealModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const backBtn = document.getElementById("backBtn");
const modalOverlay = document.querySelector(".modal-overlay");
const mealImage = document.getElementById("mealImage");
const mealName = document.getElementById("mealName");
const mealCategory = document.getElementById("mealCategory");
const mealInstructions = document.getElementById("mealInstructions");
const ingredientsList = document.getElementById("ingredientsList");
const videoLink = document.getElementById("videoLink");

// 事件初始化
searchForm.addEventListener("submit", handleSearch);
closeModalBtn.addEventListener("click", closeMealModal);
backBtn.addEventListener("click", closeMealModal);
modalOverlay.addEventListener("click", closeMealModal);

// 初始化：读取本地存储中的最近一次搜索词（可选加分功能）
const LAST_SEARCH_KEY = "meal-search-last-keyword";

window.addEventListener("DOMContentLoaded", () => {
  const savedKeyword = localStorage.getItem(LAST_SEARCH_KEY);

  if (savedKeyword) {
    searchInput.value = savedKeyword;
    searchMeal(savedKeyword);
  }
});

// 搜索事件处理
function handleSearch(event) {
  event.preventDefault();

  const keyword = searchInput.value.trim();

  // 1. 空输入错误处理
  if (!keyword) {
    showMessage("Please enter a recipe name before searching.", true);
    clearResults();
    return;
  }

  // 2. 发送搜索请求
  searchMeal(keyword);
}

// 执行搜索逻辑
async function searchMeal(keyword) {
  try {
    showMessage("Searching recipes...", false);
    const requestUrl = `${SEARCH_URL}${encodeURIComponent(keyword)}`;

    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error("Network request failed.");
    }

    const data = await response.json();
    const meals = data.meals || [];

    // 3. 无搜索结果处理
    if (!meals.length) {
      clearResults();
      showMessage(`No recipes found for "${keyword}". Please try another name.`, true);
      return;
    }

    // 存储最近一次搜索词
    localStorage.setItem(LAST_SEARCH_KEY, keyword);

    renderMealCards(meals);
    showMessage(`Found ${meals.length} recipes for "${keyword}".`, false);
  } catch (error) {
    // 4. 网络异常处理
    clearResults();
    showMessage("Connection error. Please check your network and try again.", true);
    console.error("Recipe fetch error:", error);
  }
}

// 渲染搜索结果卡片列表
function renderMealCards(meals) {
  resultsContainer.innerHTML = meals
    .map(
      (meal) => `
        <article class="meal-card" data-id="${meal.idMeal}" tabindex="0" aria-label="Open recipe ${meal.strMeal}">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
          <div class="meal-info">
            <h3>${meal.strMeal}</h3>
            <p><i class="fas fa-tag"></i> ${meal.strCategory || "Unknown category"}</p>
          </div>
        </article>
      `
    )
    .join("");

  const mealCards = document.querySelectorAll(".meal-card");

  mealCards.forEach((card) => {
    card.addEventListener("click", () => {
      const mealId = card.dataset.id;
      openMealDetail(mealId);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const mealId = card.dataset.id;
        openMealDetail(mealId);
      }
    });
  });
}

// 获取并展示菜品详情
async function openMealDetail(mealId) {
  try {
    const response = await fetch(`${LOOKUP_URL}${mealId}`);

    if (!response.ok) {
      throw new Error("Unable to fetch recipe details.");
    }

    const data = await response.json();
    const meal = data.meals && data.meals[0];

    if (!meal) {
      showMessage("Recipe details are not available right now.", true);
      return;
    }

    fillMealModal(meal);
    openMealModal();
  } catch (error) {
    showMessage("Failed to load the recipe details. Please try again.", true);
    console.error("Meal detail fetch error:", error);
  }
}

// 填充详情面板内容
function fillMealModal(meal) {
  mealImage.src = meal.strMealThumb;
  mealImage.alt = meal.strMeal;
  mealName.textContent = meal.strMeal;
  mealCategory.textContent = meal.strCategory || "General";

  const instructions = meal.strInstructions || "No instructions provided.";
  mealInstructions.textContent = instructions;

  const ingredients = getIngredients(meal);
  ingredientsList.innerHTML = ingredients
    .map(
      (item) => `<li><i class="fas fa-check"></i> ${item}</li>`
    )
    .join("");

  if (meal.strYoutube) {
    videoLink.href = meal.strYoutube;
    videoLink.classList.remove("hidden");
  } else {
    videoLink.href = "#";
    videoLink.classList.add("hidden");
  }
}

// 提取食材列表（Ingredient + Measure）
function getIngredients(meal) {
  const ingredientList = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredientName = meal[`strIngredient${index}`];
    const ingredientMeasure = meal[`strMeasure${index}`];

    if (ingredientName && ingredientName.trim()) {
      const fullIngredient = ingredientMeasure
        ? `${ingredientMeasure.trim()} ${ingredientName.trim()}`
        : ingredientName.trim();

      ingredientList.push(fullIngredient);
    }
  }

  return ingredientList.length ? ingredientList : ["No ingredients available."];
}

// 打开详情弹层
function openMealModal() {
  mealModal.classList.remove("hidden");
  mealModal.setAttribute("aria-hidden", "false");
}

// 关闭详情弹层
function closeMealModal() {
  mealModal.classList.add("hidden");
  mealModal.setAttribute("aria-hidden", "true");
}

// 通用消息提示函数
function showMessage(text, isError = false) {
  messageBox.textContent = text;
  messageBox.classList.remove("hidden");

  if (isError) {
    messageBox.classList.add("error");
  } else {
    messageBox.classList.remove("error");
  }
}

// 清空结果列表
function clearResults() {
  resultsContainer.innerHTML = "";
}
