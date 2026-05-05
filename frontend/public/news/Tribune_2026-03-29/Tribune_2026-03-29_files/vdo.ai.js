window.avaloaded = window.avaloaded || false;

(function () {
  if (window.avaloaded) {
    return;
  }

  window.avaloaded = true;
  const SUGGEST_ENDPOINT = "https://gambot2.woz.ai/api/ava/v3/get_questions";
  const ANSWER_ENDPOINT = "https://gambot2.woz.ai/api/ava/v3/response_stream";
  const container_Id = "ava-thetribune";

  // Sending loggers the GA
  var vdo_analyticsID = "G-8J9SC9WB3T";
  (function (v, d, o, ai) {
    ai = d.createElement("script");
    ai.async = true;
    ai.src = o;
    d.head.appendChild(ai);
  })(
    window,
    document,
    "https://www.googletagmanager.com/gtag/js?id=" + vdo_analyticsID
  );

  function vdo_analytics() {
    window.dataLayer.push(arguments);
  }

  (function () {
    window.dataLayer = window.dataLayer || [];
    vdo_analytics("js", new Date());
  })();

  /* ---------- GLOBAL DOM REFS (assigned inside init) ---------- */
  let mascot = null;
  let searchBar = null;
  let searchInput = null;
  let searchButton = null;
  let suggestions = null;
  let sidebar = null;
  let closeSidebar = null;
  let chatContent = null;
  let chatInput = null;
  let chatSendButton = null;
  let scrollArrow = null;
  let suggestionFetched = false;

  /* ---------- GLOBAL STATE (shared) ---------- */
  const MOBILE_QUERY = "(max-width: 768px)";
  const mql = window.matchMedia(MOBILE_QUERY);
  let isDragging = false;
  let currentX, currentY, initialX, initialY;
  let dragOffsetX = 0,
    dragOffsetY = 0;

  let conversationId = crypto.randomUUID();
  let initialSuggestions = [];
  let currentSuggestions = [];
  const initialPlaceholder = "Ask me anything!";
  const generatingMessage = [
    "Hang tight, I'm putting the pieces together!...",
    `Give me a sec, I'm on it....`,
    "Connecting the dots…",
    "Hmm, that's a great question...",
  ];
  const poweredByText = `|| Powered by <a href="https://www.vdo.ai" target="_blank">VDO.AI</a> ||`
  let isSearchBarVisible = true; // desktop: always visible, mobile: toggled
  let isAnswerInProgress = false; // track if answer is being generated

  /* ---------- HELPERS ---------- */

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function insertAfter(newNode, referenceNode) {
    if (!referenceNode || !referenceNode.parentNode) {
      chatContent.appendChild(newNode);
    } else if (referenceNode.nextSibling) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    } else {
      referenceNode.parentNode.appendChild(newNode);
    }
  }

  /* Placeholder cycler for the floating search bar */
  function cyclePlaceholder() {
    if (!searchInput) return;
    searchInput.classList.remove("vdo-ai-placeholder-visible");
    searchInput.placeholder = initialPlaceholder;
    searchInput.classList.add("vdo-ai-placeholder-visible");
  }

  /* --- API helpers --- */
  async function fetchSuggestions(title, description, conversationId) {
    try {
     const pageUrl = window.location.href.split("?")[0];
      const response = await fetch(SUGGEST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          title,
          description,
          conversation_id: conversationId,
          page_url : pageUrl,
          tagname : container_Id,
        }),
      });
      if (!response.ok)
        throw new Error(`Failed to fetch suggestions: ${response.status}`);
      const data = await response.json();
      if (!data.success) return [];
      return data.questions ? data.questions.map((item) => item.question) : [];
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  }

  function _getPageTitleAndDescription() {
    let pageDescrption = null;
    let pageTitle = document.title;

    pageDescrption =
      document.querySelector('meta[property="og:description"]') ||
      document.querySelector('meta[name="twitter:description"]') ||
      document.querySelector('meta[name="description"]');

    if (!pageDescrption) {
      let scriptTag = document.querySelector(
        'script[type="application/ld+json"]'
      );
      let jsonLdData = JSON.parse((scriptTag && scriptTag.textContent) || "{}");
      let firstPara = document.querySelector("article p");
      let title = document.querySelector("title");

      pageDescrption =
        jsonLdData.description ||
        (firstPara && firstPara.textContent) ||
        (title && title.textContent);
    } else pageDescrption = pageDescrption.getAttribute("content");

    return { pageTitle: pageTitle, pageDescrption: pageDescrption };
  }

  async function fetchInitialSuggestions() {
    const { pageTitle, pageDescrption } = _getPageTitleAndDescription();
    suggestionFetched = true;
    initialSuggestions = await fetchSuggestions(
      pageTitle,
      pageDescrption,
      conversationId
    );
    currentSuggestions = [...initialSuggestions];
  }

  /* --- Search-bar dropdown suggestions (shared, mobile uses visibility gate) --- */
  function showSuggestions(element, list) {
    if (!element || !searchInput) return;
    if (!list.length || !isSearchBarVisible) return;

    element.innerHTML = list.map((q) => `<div>${escapeHtml(q)}</div>`).join("");
    const inputRect = (
      element === suggestions ? searchInput : chatInput
    ).getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedDropdownHeight = Math.min(200, list.length * 40 + 100);

    if (element === suggestions) {
      const spaceBelow = viewportHeight - inputRect.bottom;
      if (spaceBelow < estimatedDropdownHeight) {
        element.style.top = "auto";
        element.style.bottom = "100%";
        element.style.marginTop = "0";
        element.style.marginBottom = "5px";
      } else {
        element.style.top = "100%";
        element.style.bottom = "auto";
        element.style.marginTop = "5px";
        element.style.marginBottom = "0";
      }
    }
    element.style.display = "block";
  }

  function hideSuggestions(element) {
    if (!element) return;
    element.style.display = "none";
    if (element === suggestions) {
      element.style.top = "100%";
      element.style.bottom = "auto";
      element.style.marginTop = "5px";
      element.style.marginBottom = "0";
    }
  }

  /* --- Check if chat content is scrollable and show/hide scroll arrow --- */
  function updateScrollArrowVisibility() {
    if (!scrollArrow || !chatContent) return;
    // Check if content height exceeds visible area (with small threshold for rounding)
    const isScrollable = chatContent.scrollHeight > chatContent.clientHeight + 5;
    if (isScrollable) {
      scrollArrow.classList.add("vdo-ai-visible");
    } else {
      scrollArrow.classList.remove("vdo-ai-visible");
    }
  }

  /* --- IN-CHAT SUGGESTIONS RENDERING --- */
  function removeInChatSuggestions() {
    if (!chatContent) return;
    const block = chatContent.querySelector(".vdo-ai-chat-suggestions");
    if (block) block.remove();
  }

  function renderInChatSuggestions(list) {
    if (!chatContent) return;
    removeInChatSuggestions();
    if (!list || !list.length) return;

    const container = document.createElement("div");
    container.className = "vdo-ai-chat-suggestions";

    const header = document.createElement("div");
    header.className = "vdo-ai-chat-suggestions-header";
    header.textContent = "Ask Follow-up";
    container.appendChild(header);

    list.forEach((q) => {
      const row = document.createElement("div");
      row.className = "vdo-ai-chat-suggestion";
      row.setAttribute("data-question", q);

      const text = document.createElement("div");
      text.className = "vdo-ai-chat-suggestion-text";
      text.textContent = q;

      const arrow = document.createElement("div");
      arrow.className = "vdo-ai-chat-suggestion-arrow";
      arrow.textContent = "→";

      row.appendChild(text);
      row.appendChild(arrow);
      container.appendChild(row);
    });

    const answers = chatContent.querySelectorAll(
      ".vdo-ai-chat-message.vdo-ai-answer"
    );
    const lastAnswer = answers[answers.length - 1] || null;
    if (lastAnswer) {
      insertAfter(container, lastAnswer);
    } else {
      chatContent.appendChild(container);
    }
    // Auto-scroll when suggestions are rendered
    requestAnimationFrame(() => {
      chatContent.scrollTop = chatContent.scrollHeight;
      updateScrollArrowVisibility();
    });
  }

  /* --- Streaming Q&A (shared) --- */
  async function handleQuestionSubmission(
    question,
    inputElement,
    buttonElement
  ) {
    if (!chatContent) return;
    const pageTitle = document.title;
    const pageUrl = window.location.href.split("?")[0];
    removeInChatSuggestions();
    inputElement.disabled = true;
    buttonElement.disabled = true;

    chatContent.innerHTML += `<div class="vdo-ai-chat-message vdo-ai-question">${escapeHtml(
      question
    )}</div>`;
    chatContent.innerHTML += `<div class="vdo-ai-chat-message vdo-ai-generation">${
      generatingMessage[Math.floor(Math.random() * generatingMessage.length)]
    }</div>`;
    // Auto-scroll when generation message appears
    requestAnimationFrame(() => {
      chatContent.scrollTop = chatContent.scrollHeight;
      updateScrollArrowVisibility();
    });

    try {
      const res = await fetch(`${ANSWER_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ question, page_url: pageUrl, title: pageTitle, tagname : container_Id }),
      });

      if (!res.ok || !res.body) {
        chatContent.innerHTML += `<div class="vdo-ai-chat-message vdo-ai-answer">Request failed: ${res.status}</div>`;
        inputElement.disabled = false;
        buttonElement.disabled = false;
        const generationDiv = chatContent.querySelector(".vdo-ai-generation");
        if (generationDiv) generationDiv.remove();
        isAnswerInProgress = false;
        vdo_analytics("event", "ai_response_failed", {
          send_to: vdo_analyticsID,
          event_category: "vdo_ava",
          event_label: container_Id,
        });
        return;
      } else {
        isAnswerInProgress = true;
        vdo_analytics("event", "ai_response_started", {
          send_to: vdo_analyticsID,
          event_category: "vdo_ava",
          event_label: container_Id,
        });
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answerDiv = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const messages = buffer.split("\n\n");
        buffer = messages.pop() || "";

        for (const msg of messages) {
          const lines = msg.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event: "));
          const dataLines = lines.filter((l) => l.startsWith("data: "));
          if (!dataLines.length) continue;

          const event = eventLine ? eventLine.slice(7).trim() : "message";
          const data = dataLines
            .map((l) => l.slice(6))
            .join("\n")
            .trim();

          if (data === "[DONE]") {
            isAnswerInProgress = false;
            vdo_analytics("event", "ai_response_completed", {
              send_to: vdo_analyticsID,
              event_category: "vdo_ava",
              event_label: container_Id,
            });
            await sleep(30);
            inputElement.disabled = false;
            buttonElement.disabled = false;
            const generationDiv =
              chatContent.querySelector(".vdo-ai-generation");
            if (generationDiv) generationDiv.remove();
            // Update arrow visibility after streaming completes
            requestAnimationFrame(() => {
              updateScrollArrowVisibility();
            });
            return;
          }

          if (event === "answer") {
            const generationDiv =
              chatContent.querySelector(".vdo-ai-generation");
            if (generationDiv) generationDiv.remove();

            if (!answerDiv) {
              answerDiv = document.createElement("div");
              answerDiv.className = "vdo-ai-chat-message vdo-ai-answer";
              chatContent.appendChild(answerDiv);
            }

            const currentText = answerDiv.innerHTML || "";
            const text = JSON.parse(data);
            const formatted = text
              .replace(/\\n\\n/g, "\n\n")
              .replace(/\\n/g, "\n");
            const newText =
              currentText + escapeHtml(formatted).replace(/\n/g, "<br>");
            answerDiv.innerHTML = newText;
            // Auto-scroll to bottom during streaming with smooth behavior
            requestAnimationFrame(() => {
              chatContent.scrollTop = chatContent.scrollHeight;
              updateScrollArrowVisibility();
            });
            continue;
          }

          if (event === "suggestions") {
            try {
              const obj = JSON.parse(data);
              const qs = obj.questions || [];
              currentSuggestions = qs
                .map((q) => q.question || "")
                .filter(Boolean);
              renderInChatSuggestions(currentSuggestions);
            } catch (e) {
              console.error("Bad suggestions JSON:", e, data);
            }
            continue;
          }

          if (event === "error") {
            console.error("Stream error:", data);
            chatContent.innerHTML += `<div class="vdo-ai-chat-message vdo-ai-answer">Error: ${escapeHtml(
              data
            )}</div>`;
            inputElement.disabled = false;
            buttonElement.disabled = false;
            const generationDiv =
              chatContent.querySelector(".vdo-ai-generation");
            if (generationDiv) generationDiv.remove();
            isAnswerInProgress = false;
            return;
          }
        }
      }
    } catch (err) {
      console.error("Stream error:", err);
      chatContent.innerHTML += `<div class="vdo-ai-chat-message vdo-ai-answer">Stream error: ${escapeHtml(
        err.message
      )}</div>`;
      inputElement.disabled = false;
      buttonElement.disabled = false;
      const generationDiv = chatContent.querySelector(".vdo-ai-generation");
      if (generationDiv) generationDiv.remove();
      isAnswerInProgress = false;
      vdo_analytics("event", "ai_response_failed", {
        send_to: vdo_analyticsID,
        event_category: "vdo_ava",
        event_label: container_Id,
      });
    }
  }

  /* --- Helper function to hide/show mascot and search bar --- */
  function hideMascotAndSearchBar() {
    if (mascot) {
      mascot.style.display = "none";
    }
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }

  function showMascotAndSearchBar() {
    if (mascot) {
      mascot.style.display = "block";
    }
    if (searchBar) {
      // Show search bar when sidebar closes
      isSearchBarVisible = true;
      searchBar.style.display = "flex";
      searchBar.style.opacity = "1";
    }
  }

  /* --- Video Ads block toggle (shared, still disabled) --- */
  //   Video Ads Initialization logic
  function VideoAdsInit(status = "open") {
    return;
    if (
      document.getElementById("ava-ad-container") === null &&
      status === "open"
    ) {
      // creating the ad container when the sidebar is opened
      let adContainer = document.createElement("div");
      adContainer.id = "ava-ad-container";
      let adDiv = document.createElement("div");
      adDiv.id = "v-samplemontest-v68";
      adDiv.style.cssText = "transform: scale(0.9)";
      adContainer.appendChild(adDiv);

      // injection script for the vdo.ai.js file
      (function (v, d, o, ai) {
        ai = d.createElement("script");
        ai.defer = true;
        ai.async = true;
        ai.src = v.location.protocol + o;
        d.head.appendChild(ai);
      })(window, document, "//a.vdo.ai/core/v-samplemontest-v68/vdo.ai.js");

      // injecting the ad container before the chat input container
      document
        .querySelector(".vdo-ai-chat-input-container")
        .insertAdjacentElement("beforebegin", adContainer);
    } else if (
      status === "close" &&
      document.getElementById("ava-ad-container")
    ) {
      // removing the ad container when the sidebar is closed
      document.getElementById("ava-ad-container").remove();
    }
  }

  /* ============================================================
   INIT  (same behaviour for mobile or desktop)
   ============================================================ */
  function init() {
    isSearchBarVisible = false; // search bar hidden initially, shown via mascot

    const htmlTemplateMobile = `
  <style>

  /* Animated orbiting gradient border */
  @property --vdo-ai-angle {
    syntax: "<angle>";
    initial-value: 0deg;
    inherits: false;
  }

  @keyframes vdo-ai-border-spin {
    to {
      --vdo-ai-angle: 360deg;
    }
  }

  .vdo-ai-font { margin: 0; font-family: Arial, sans-serif  !important; }

.vdo-ai-mascot {
    position: fixed;
    bottom: 7%;
    left: 2%;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    padding: 3px;
    box-sizing: border-box;
    cursor: pointer;

    border: 3px solid transparent;
    background: 
        linear-gradient(white, white) padding-box,
        linear-gradient(135deg, #ffd89b, #ff4b2b) border-box;

    z-index: 99999999999;
    pointer-events: auto;
}
    @media (min-width : 768px){
      .vdo-ai-mascot {
        position: fixed;
        left : auto;
        bottom: 2%;
        right: 2%;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        padding: 3px;
        box-sizing: border-box;
        cursor: pointer;
        z-index: 99999999999;
        pointer-events: auto;
        border: 3px solid transparent;
        background: 
          linear-gradient(white, white) padding-box,
          linear-gradient(135deg, #ffd89b, #ff4b2b) border-box;
      }
    }

  /* Inner avatar */
  .vdo-ai-mascot::before {
    content: "";
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 65%;
    height: 65%;
    border-radius: 50%;
    filter: brightness(0);
    background: url("https://www.tribuneindia.com/sortd-service/assets/v22-12/dGhldHJpYnVuZS1zb3J0ZC1wcm8tcHJvZC1zb3J0ZC9jb21wb25lbnRzOnRvb2xiYXI6aWNvbjM2NzcyNWNkMC0yZmYwLTExZjAtYjhkMy1jOTU5NTdmYjEzNzk=") center/100% no-repeat;
  }


  .vdo-ai-search-bar {
    position: fixed;
    bottom: 2%;
    right: 2%;

    /* ✅ Responsive width */
    width: min(300px, calc(100vw - 80px));  /* 80px ≈ mascot + gap + margin */
    max-width: calc(100vw - 24px);
    height: 40px;

    border-radius: 999px;

    /* gradient border */
    border: 2px solid transparent;
    background:
      linear-gradient(#ffffff, #ffffff) padding-box,
      conic-gradient(from var(--vdo-ai-angle), #ffffff, #ff0000, #ffffff) border-box;

    animation: vdo-ai-border-spin 3s linear infinite;

    display: none;           /* same behavior as before */
    align-items: center;
    padding: 20px 10px;
    z-index: 99999999999;
    cursor: move;
  }

  .vdo-ai-search-bar input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
    background: transparent;
  }
  .vdo-ai-search-bar input::placeholder {
    color: #aaa;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  .vdo-ai-search-bar input.vdo-ai-placeholder-visible::placeholder { opacity: 1; }
  .vdo-ai-search-bar .vdo-ai-magnify-icon {
    width: 30px;
    height: 30px;
    margin-right: 10px;
    background: url("data:image/svg+xml;utf8,<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='aiGrad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23FF37A6'/><stop offset='100%' stop-color='%235A5BFF'/></linearGradient></defs><path d='M100 25 C112 60, 140 88, 175 100 C140 112, 112 140, 100 175 C88 140, 60 112, 25 100 C60 88, 88 60, 100 25Z' fill='url(%23aiGrad)'/><path d='M150 40 C153 52, 162 61, 174 64 C162 67, 153 76, 150 88 C147 76, 138 67, 126 64 C138 61, 147 52, 150 40Z' fill='url(%23aiGrad)'/><path d='M45 125 C48 137, 57 146, 69 149 C57 152, 48 161, 45 173 C42 161, 33 152, 21 149 C33 146, 42 137, 45 125Z' fill='url(%23aiGrad)'/></svg>") no-repeat center;
    background-size: contain;
  }
  .vdo-ai-search-bar button {
    width: 30px;
    height: 30px;
    background: linear-gradient(135deg, #ff4b2b, #b80000) !important;
    color: #fff;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    margin-left: 10px;
    padding : 0;
  }
  .vdo-ai-search-bar button:hover { 
    background: linear-gradient(135deg, #ff6b4d, #8f0000) !important;
  }
  .vdo-ai-suggestions {
    position: absolute;
    left: 0;
    top: 100%;
    width: 100%;
    margin-top: 5px;
    max-height: 200px;
    background: #ffffff;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow-y: auto;
    z-index: 1001;
    display: none;
    box-sizing: border-box;
    text-align : left;
  }
  .vdo-ai-suggestions div { 
    padding: 10px; 
    cursor: pointer; 
  }
    .vdo-ai-suggestions div:hover { 
    background: #f0f0f0; 
  }
  .vdo-ai-sidebar {
    position: fixed;
    top: 0;
    right: -500px;
    width: 500px;
    height: 100% !important;
    background: #ffffff;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    transition: right 0.3s ease;
    z-index: 999999999999;
    overflow: hidden;
    text-align : left;
  }
  .vdo-ai-sidebar.vdo-ai-open { 
    right: 0; 
    max-width: 100%;
  }
  .vdo-ai-sidebar-header {
    display: flex; justify-content: start; align-items: center;
    padding: 20px 20px 0px 20px; gap: 5px;
  }
  .vdo-ai-brand {
    display: flex;
    align-items: center;
  }

  .vdo-ai-brand-logo {
    filter: brightness(0);
    height: 42.6px;       /* adjust if needed */
    width: auto;
    display: block;
  }
  .vdo-ai-powered { font-size: 15px; opacity: 0.55; white-space: nowrap; }
  .vdo-ai-powered a { text-decoration: none; display: inline; }
  .vdo-ai-sidebar-close { margin-left: auto; font-size: 20px; cursor: pointer; }

  .vdo-ai-chat-content {
    flex-grow: 1;
    overflow-y: auto;              /* vertical scroll on the right */
    padding: 10px 20px 20px 20px;
    margin-bottom: 20px;
    margin-top: 5px;
  }
  .vdo-ai-chat-message { margin-bottom: 10px; }
  .vdo-ai-chat-message.vdo-ai-question {
  font-weight: bold; font-size: 20px; padding-top:4px !important; color : black !important;
  }
  .vdo-ai-chat-message.vdo-ai-answer {
    text-align: left; color: #333; font-size: 16px !important; line-height: 1.4 !important;
  }
  
  .vdo-ai-chat-message.vdo-ai-answer strong { color: #333; font-weight: bold; }
  .vdo-ai-chat-message.vdo-ai-answer em { font-style: italic; }
  .vdo-ai-chat-message.vdo-ai-answer code {
    background: #f4f4f4; padding: 2px 4px; border-radius: 3px;
    font-family: 'Courier New', monospace; font-size: 0.9em;
  }
  .vdo-ai-chat-message.vdo-ai-answer pre {
    background: #f4f4f4; padding: 10px; border-radius: 5px;
    overflow-x: auto; margin: 10px 0;
  }
  .vdo-ai-chat-message.vdo-ai-answer pre code { background: none; padding: 0; }
  .vdo-ai-chat-message.vdo-ai-answer a { color: #007bff; text-decoration: underline; }
  .vdo-ai-chat-message.vdo-ai-answer a:hover { color: #0056b3; }
  .vdo-ai-chat-message.vdo-ai-generation { color: #007bff; font-style: italic; font-size : 16px;  }

  /* --- Scroll indicator arrow as overlay (mobile + desktop) --- */
  .vdo-ai-scroll-arrow {
    width: 30px !important;
    height: 30px !important;
    min-width: 30px !important;
    max-width: 30px !important;
    min-height: 30px !important;
    max-height: 30px !important;
    border-radius: 50%;
    border: 2px solid #ff0000;
    display: none;  /* Hidden by default, shown only when content is scrollable */
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    cursor: pointer;
    box-sizing: border-box;
    position: absolute;  /* Absolute positioning relative to sidebar */
    bottom: 120px;  /* Position above input container (adjust based on input + powered text height) */
    right: 50%;   /* Align to right */
    z-index: 1000000000000;   /* Very high z-index to be above everything */
    background: #ffffff;  /* White background to stand out */
    pointer-events: auto;  /* Ensure it's clickable */
  }
  .vdo-ai-scroll-arrow.vdo-ai-visible {
    display: flex !important;
  }
  .vdo-ai-scroll-arrow::before {
    content: "";
    width: 16px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23ff0000' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    flex-shrink: 0;
    display: block;
  }

  /* --- Mobile specific tweaks --- */
  @media (max-width: 768px) {
    /* Reduce chat window height to ~50% of viewport and dock to bottom */
    .vdo-ai-sidebar {
      top: auto;
      bottom: 0;
      height: 50vh !important;
      width: 100%;
      right: -100%;
      border-radius: 16px 16px 0 0;
    }
    .vdo-ai-sidebar.vdo-ai-open {
      right: 0;
    }

    /* Typography adjustments for mobile */
    .vdo-ai-chat-message.vdo-ai-question {
      font-size: 17px !important;     /* Title / Question / Headings */
    }
    .vdo-ai-chat-message.vdo-ai-answer {
      font-size: 13px !important;     /* Answer text */
      line-height: 1.5 !important;
    }
    .vdo-ai-chat-suggestions-header {
      font-size: 15px !important;
    }
    .vdo-ai-chat-suggestion,
    .vdo-ai-chat-suggestion-text {
      font-size: 13px !important;     /* Follow-up questions text */
    }
    .vdo-ai-chat-message.vdo-ai-generation {
      font-size: 13px !important;     /* Answer text */
      color: #007bff; 
      font-style: italic;
    }
  }

    .vdo-ai-chat-input-container {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 10px;

  border-radius: 999px;

  /* gradient border */
  border: 2px solid transparent;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    conic-gradient(from var(--vdo-ai-angle), #ffffff, #ff0000, #ffffff) border-box;

  animation: vdo-ai-border-spin 3s linear infinite;

  /* no drop-shadow */
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);

  isolation: isolate !important;
}

    .vdo-ai-chat-input-container input {
      flex: 1; padding: 10px; border: none; border-radius: 20px; outline: none;
    }
    .vdo-ai-chat-input-container button {
      width: 30px; height: 30px; background: #007bff; color: #fff;
      border: none; border-radius: 50%; cursor: pointer; margin-left: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .vdo-ai-chat-input-container button:hover { background: #0056b3; }
    .vdo-ai-chat-input-container .vdo-ai-chat-container-icon {
      width: 30px; height: 30px; margin-right: 10px;
      background: url("data:image/svg+xml;utf8,<svg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='aiGrad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23FF37A6'/><stop offset='100%' stop-color='%235A5BFF'/></linearGradient></defs><path d='M100 25 C112 60, 140 88, 175 100 C140 112, 112 140, 100 175 C88 140, 60 112, 25 100 C60 88, 88 60, 100 25Z' fill='url(%23aiGrad)'/><path d='M150 40 C153 52, 162 61, 174 64 C162 67, 153 76, 150 88 C147 76, 138 67, 126 64 C138 61, 147 52, 150 40Z' fill='url(%23aiGrad)'/><path d='M45 125 C48 137, 57 146, 69 149 C57 152, 48 161, 45 173 C42 161, 33 152, 21 149 C33 146, 42 137, 45 125Z' fill='url(%23aiGrad)'/></svg>") no-repeat center;
      background-size: contain;
    }
    .vdo-ai-chat-suggestions {
      margin-top: 16px;
      overflow: hidden;                     
      background: #fff;
    }
    .vdo-ai-chat-suggestions-header {
      font-size: 16.5px;
      font-weight: 600;
      padding-top: 12px;
      padding-bottom: 15px;
      color: #111;
    }
    .vdo-ai-chat-suggestion {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 12px;
      padding-bottom: 12px;
      cursor: pointer;
      border-bottom: 1px solid #e5e7eb;     
      color: #111;
      line-height: 1.3;
      font-size: 16px;
    }
    .vdo-ai-chat-suggestion:hover { background: #f7f7f7; }
    .vdo-ai-chat-suggestion-text { flex: 1; }
    .vdo-ai-chat-suggestion-arrow { font-size: 16px; opacity: 0.75; margin-left: 8px; }

    .vdo-ai-search-bar input:focus{
        outline: none !important;
        box-shadow: none !important;
        background-color: transparent !important;
    }
    .vdo-ai-chat-input-container input:focus,
    .vdo-ai-search-bar button:focus,
    .vdo-ai-chat-input-container button:focus {
        outline: none !important;
        box-shadow: none !important;
    }

    .vdo-ai-search-bar,
    .vdo-ai-search-bar * {
        box-sizing: border-box !important;
    }

    .vdo-ai-search-bar .vdo-ai-magnify-icon { flex: 0 0 30px !important; }
    .vdo-ai-search-bar button { flex: 0 0 30px !important; }

    .vdo-ai-search-bar input {
        flex: 1 1 0% !important;
        min-width: 0 !important;
        height: 28px !important;             
        line-height: 28px !important;
        padding: 0 !important;               
        border: none !important;
        outline: none !important;
    }

    .vdo-ai-chat-input-container,
    .vdo-ai-chat-input-container * {
        box-sizing: border-box !important;
    }

    .vdo-ai-chat-input-container {
        display: flex !important;            
        align-items: center !important;
        gap: 10px !important;
    }

    .vdo-ai-chat-input-container .vdo-ai-chat-container-icon {
        flex: 0 0 30px !important;
        width: 30px !important; 
        height: 30px !important;
    }

    .vdo-ai-chat-input-container button {
        flex: 0 0 30px !important;           
        width: 30px !important; height: 30px !important;
        margin-left: auto !important;        
        position: static !important;         
        float: none !important;              
        display: inline-flex !important;     
        align-items: center !important;
        justify-content: center !important;
    }

    .vdo-ai-chat-input-container input {
        flex: 1 1 0% !important;
        min-width: 0 !important;
        height: 28px !important;
        line-height: 28px !important;
        padding: 0 6px !important;
        border: none !important;
        outline: none !important;
        background: transparent !important;
        font: 16px/28px Arial, sans-serif !important;
    }

    .vdo-ai-sidebar-header {
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 2px !important;
    }

    .vdo-ai-sidebar-close {
        position: absolute !important;
        top: 50% !important;
        right: 16px !important;
        transform: translateY(-50%) !important;
        width: 28px !important;
        height: 28px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 50% !important;
        background: transparent !important;
        cursor: pointer !important;
        color: #333 !important;
        flex: 0 0 auto !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: content-box !important;
        z-index: 100 !important;
    }

    .vdo-ai-sidebar-close svg {
        width: 20px !important;
        height: 20px !important;
        stroke: currentColor !important;
        display: block !important;
        pointer-events: none !important;
    }

    .vdo-ai-sidebar-close:hover {
        background: rgba(0,0,0,0.06) !important;
        transform: translateY(-50%) scale(1.05) !important;
    }

    .vdo-ai-sidebar-close:active {
        transform: translateY(-50%) scale(0.95) !important;
    }

    .vdo-ai-sidebar-header {
        opacity: 1 !important;
        filter: none !important;
        transform: none !important;
    }

    .vdo-ai-powered {
    display: block !important;
    align-self: center !important;   /* centers in flex column sidebar */
    font-size: 15px !important;
    opacity: 0.6 !important;
    margin: 6px 0 12px 0 !important; /* some breathing room below input */
    padding: 0 !important;
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
}
    .vdo-ai-powered a{text-decoration: none !important;}


    


    .vdo-ai-chat-input-container,
    .vdo-ai-chat-input-container * {
        font-family: Arial, sans-serif !important;
        font-size: 16px !important;
        line-height: 28px !important;
        font-weight: 400 !important;
        letter-spacing: 0 !important;
        text-transform: none !important;
        text-shadow: none !important;
        -webkit-font-smoothing: antialiased !important;
        text-rendering: optimizeLegibility !important;
        box-sizing: border-box !important;
        transition: none !important;
    }

    .vdo-ai-chat-input-container .vdo-ai-chat-container-icon {
        flex: 0 0 30px !important;
        width: 30px !important;
        height: 30px !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        margin: 0 !important;
    }

    .vdo-ai-chat-input-container input#vdo-ai-chatInput {
        all: unset !important;                   
        display: block !important;
        flex: 1 1 auto !important;
        min-width: 0 !important;
        font-family: Arial, sans-serif !important;
        font-size: 16px !important;
        line-height: 28px !important;
        color: #111 !important;
        height: 28px !important;
        padding: 0 6px !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        appearance: none !important;
        -webkit-appearance: none !important;
    }

    .vdo-ai-chat-input-container input#vdo-ai-chatInput::placeholder {
        color: #999 !important;
        opacity: 1 !important;
    }

    #vdo-ai-chatSendButton {
        all: initial !important;                 
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 30px !important;
        height: 30px !important;
        margin-left: auto !important;
        border-radius: 50% !important;
        background: linear-gradient(135deg, #ff4b2b, #b80000) !important;
        color: #fff !important;
        cursor: pointer !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        user-select: none !important;
    }

    #vdo-ai-chatSendButton:hover { background: linear-gradient(135deg, #ff6b4d, #8f0000) !important; }
    #vdo-ai-chatSendButton:active { transform: scale(0.96) !important; }

    #vdo-ai-chatSendButton svg {
        width: 16px !important;
        height: 16px !important;
        stroke: currentColor !important;
        fill: none !important;
        stroke-width: 2 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
        display: block !important;
        pointer-events: none !important;
    }

    .vdo-ai-chat-input-container * {
        opacity: 1 !important;
        transform: none !important;
    }

    #${container_Id} .vdo-ai-suggestions,
    #${container_Id} .vdo-ai-suggestions * {
        font-family: Arial, sans-serif !important;
        font-size: 14px !important;
        line-height: 20px !important;
        font-weight: 400 !important;
        letter-spacing: 0 !important;
        text-transform: none !important;
        text-shadow: none !important;
        -webkit-font-smoothing: antialiased !important;
        text-rendering: optimizeLegibility !important;
        color: #111 !important;
    }

    #${container_Id} .vdo-ai-suggestions > div {
        white-space: normal !important;   
    }

    #${container_Id} .vdo-ai-chat-content,
    #${container_Id} .vdo-ai-chat-content *:not(code):not(pre):not(pre *) {
        font-family: Arial, sans-serif !important;
    }

    #${container_Id} .vdo-ai-chat-content code,
    #${container_Id} .vdo-ai-chat-content pre,
    #${container_Id} .vdo-ai-chat-content pre code {
        font-family: "Courier New", monospace !important;
    }


    .vdo-ai-powered {
  font-family: Arial, sans-serif !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
  text-transform: none !important;
  text-shadow: none !important;
  letter-spacing: 0 !important;
  color: #111 !important;

  display: block !important;
  align-self: center !important;
  text-align: center !important;
  opacity: 0.6 !important;
  margin: 6px 0 14px 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

  </style>

  <div class="vdo-ai-mascot" id="vdo-ai-mascot"></div>

  <div class="vdo-ai-search-bar" id="vdo-ai-searchBar">
    <div class="vdo-ai-magnify-icon"></div>
    <input type="text" class="vdo-ai-font" id="vdo-ai-searchInput" placeholder="Ask a question..." autocomplete="off">
    <button id="vdo-ai-searchButton">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round" />
        </svg>
    </button>
    <div class="vdo-ai-suggestions vdo-ai-font" id="vdo-ai-suggestions"></div>
  </div>

  <div class="vdo-ai-sidebar" id="vdo-ai-sidebar">
    <div class="vdo-ai-sidebar-header">
      <div class="vdo-ai-brand">
        <img
          src="https://www.tribuneindia.com/sortd-service/assets/v22-12/dGhldHJpYnVuZS1zb3J0ZC1wcm8tcHJvZC1zb3J0ZC9oZWFkZXJfYnJhbmRpbmc6YnJhbmRfbG9nbzAyMmQyZDQwLWU5ZjEtMTFlZi1iOTBiLTNiODE5MDc0OTVhZg=="
          alt="AVA"
          class="vdo-ai-brand-logo"
        />
      </div>

      
      <div class="vdo-ai-sidebar-close" id="vdo-ai-closeSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            width="20" height="20" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    </div>

    <div class="vdo-ai-chat-content vdo-ai-font" id="vdo-ai-chatContent"></div>
    <!-- Scroll hint arrow as overlay positioned relative to sidebar -->
    <div class="vdo-ai-scroll-arrow" id="vdo-ai-scrollArrow" title="Scroll to see more"></div>

    <div class="vdo-ai-chat-input-container">
      <div class="vdo-ai-chat-container-icon"></div>
      <input type="text" id="vdo-ai-chatInput" placeholder="Type your question..." autocomplete="off">
      <button class="vdo-ai-font" id="vdo-ai-chatSendButton">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round" />
        </svg>
      </button>
    </div>
    <div class="vdo-ai-powered vdo-ai-font">${poweredByText}</div>
  </div>
  `;

    let containerElement = document.getElementById(container_Id);
    if (!containerElement) {
      containerElement = document.createElement("div");
      containerElement.id = container_Id;
      document.body.appendChild(containerElement);
    }
    containerElement.innerHTML = htmlTemplateMobile; // or htmlTemplateMobile
    mascot = $("vdo-ai-mascot");
    searchBar = $("vdo-ai-searchBar");
    searchInput = $("vdo-ai-searchInput");
    searchButton = $("vdo-ai-searchButton");
    suggestions = $("vdo-ai-suggestions");
    sidebar = $("vdo-ai-sidebar");
    closeSidebar = $("vdo-ai-closeSidebar");
    chatContent = $("vdo-ai-chatContent");
    chatInput = $("vdo-ai-chatInput");
    chatSendButton = $("vdo-ai-chatSendButton");
    scrollArrow = $("vdo-ai-scrollArrow");

    /* Scroll arrow: on click, jump to end of chat */
    if (scrollArrow && chatContent) {
      scrollArrow.addEventListener("click", () => {
        if (typeof chatContent.scrollTo === "function") {
          chatContent.scrollTo({
            top: chatContent.scrollHeight,
            behavior: "smooth",
          });
        } else {
          chatContent.scrollTop = chatContent.scrollHeight;
        }
        // Update arrow visibility after scrolling
        setTimeout(() => updateScrollArrowVisibility(), 300);
      });

      // Initial check for scrollability
      setTimeout(() => updateScrollArrowVisibility(), 100);

      // Update arrow visibility on window resize
      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          updateScrollArrowVisibility();
        }, 150);
      });
    }

    // Reposition search bar on window resize
    let searchBarResizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(searchBarResizeTimeout);
      searchBarResizeTimeout = setTimeout(() => {
        if (isSearchBarVisible && mascot && searchBar) {
          positionSearchBarRelativeToMascot();
        }
      }, 100);
    });

    /* ----- Ensure mascot stays within bounds on resize ----- */
    function constrainMascotPosition() {
      if (!mascot) return;

      const mascotRect = mascot.getBoundingClientRect();
      const width = mascotRect.width;
      const height = mascotRect.height;

      // Check if mascot has inline styles (was dragged)
      const hasInlineLeft = mascot.style.left && mascot.style.left !== "";
      const hasInlineTop = mascot.style.top && mascot.style.top !== "";

      // Only constrain if mascot was previously positioned with inline styles
      if (hasInlineLeft || hasInlineTop) {
        let currentLeft = parseFloat(mascot.style.left);
        let currentTop = parseFloat(mascot.style.top);

        // If only one dimension has inline style, get the other from current position
        if (isNaN(currentLeft)) currentLeft = mascotRect.left;
        if (isNaN(currentTop)) currentTop = mascotRect.top;

        // Constrain to viewport bounds
        const constrainedX = Math.max(0, Math.min(currentLeft, window.innerWidth - width));
        const constrainedY = Math.max(0, Math.min(currentTop, window.innerHeight - height));

        // Update position if needed
        if (hasInlineLeft) mascot.style.left = constrainedX + "px";
        if (hasInlineTop) mascot.style.top = constrainedY + "px";
      }
    }

    /* ----- Reposition search bar and mascot on window resize ----- */
    function handleWindowResize() {
      constrainMascotPosition();
      if (isSearchBarVisible) {
        positionSearchBarRelativeToMascot();
      }
    }

    // Add resize listener for mascot and search bar repositioning
    let mascotResizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(mascotResizeTimeout);
      mascotResizeTimeout = setTimeout(() => {
        handleWindowResize();
      }, 100);
    });

    /* ----- Mascot + Search Bar positioning / drag ----- */

    function isLeftSideOfScreen(element) {
      const rect = element.getBoundingClientRect();
      return rect.left + rect.width / 2 < window.innerWidth / 2;
    }

    function positionSearchBarRelativeToMascot() {
      if (!isSearchBarVisible || !mascot || !searchBar) return;

      const mascotRect = mascot.getBoundingClientRect();
      const gap = 12; // desired gap between mascot and bar
      const margin = 12; // viewport margin from edges
      const minBarWidth = 140; // minimum reasonable width for side-by-side layout

      const viewportWidth = window.innerWidth;
      const leftSide = isLeftSideOfScreen(mascot);

      // Start with a reasonable width that fits in viewport
      let barWidth = Math.min(
        searchBar.offsetWidth || 300,
        viewportWidth - 2 * margin
      );
      let left;

      if (leftSide) {
        // Bar on the RIGHT side of mascot
        left = mascotRect.right + gap; // keep gap
        const maxWidthRight = viewportWidth - margin - left; // how much width we can have to the right

        barWidth = Math.min(barWidth, maxWidthRight);
      } else {
        // Bar on the LEFT side of mascot
        const maxWidthLeft = mascotRect.left - gap - margin; // space to the left of mascot
        barWidth = Math.min(barWidth, maxWidthLeft);
        left = mascotRect.left - gap - barWidth; // keep gap
      }

      // If we don't have enough horizontal space for a decent bar width,
      // fall back to a stacked layout: bar ABOVE the mascot, centered.
      if (!Number.isFinite(barWidth) || barWidth < minBarWidth) {
        const safeWidth = Math.min(
          viewportWidth - 2 * margin,
          searchBar.offsetWidth || 300
        );
        const topAbove = mascotRect.top - gap - (searchBar.offsetHeight || 40);

        searchBar.style.width = safeWidth + "px";
        searchBar.style.left = (viewportWidth - safeWidth) / 2 + "px";
        searchBar.style.top = Math.max(margin, topAbove) + "px";
        return;
      }

      // Normal side-by-side placement with guaranteed gap
      searchBar.style.width = barWidth + "px";
      const top =
        mascotRect.top +
        (mascotRect.height - (searchBar.offsetHeight || 40)) / 2;

      searchBar.style.top = Math.max(margin, top) + "px";
      searchBar.style.left = Math.max(margin, left) + "px";
    }

    function showSearchBarWithSlide() {
      if (isSearchBarVisible || !mascot || !searchBar) return;

      const mascotRect = mascot.getBoundingClientRect();
      const gap = 12;
      const leftSide = isLeftSideOfScreen(mascot);

      // 1) Make bar visible so we can measure it
      searchBar.style.display = "flex";
      searchBar.style.opacity = "1";

      const barHeight = searchBar.offsetHeight || 40;

      // 2) Responsive bar width based on viewport
      const rawBarWidth = searchBar.offsetWidth || 300;
      const maxBarWidth = window.innerWidth - 24; // 12px margin each side
      const barWidth = Math.min(rawBarWidth, maxBarWidth);
      searchBar.style.width = barWidth + "px";

      // 3) Compute unclamped target X
      let endX = leftSide
        ? mascotRect.right + gap
        : mascotRect.left - gap - barWidth;

      // 4) Clamp target X so the bar always fits in viewport
      const margin = 12;
      endX = Math.max(
        margin,
        Math.min(endX, window.innerWidth - barWidth - margin)
      );

      // 5) Start X: just behind mascot, but also clamped to avoid weird overshoot
      let startX = leftSide
        ? mascotRect.left + mascotRect.width
        : mascotRect.left - barWidth;

      startX = Math.max(
        margin,
        Math.min(startX, window.innerWidth - barWidth - margin)
      );

      searchBar.style.opacity = "0";

      const top = mascotRect.top + (mascotRect.height - barHeight) / 2;
      searchBar.style.top = top + "px";
      searchBar.style.left = startX + "px";

      const duration = 250;
      const startTime = performance.now();

      function animate(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const x = startX + (endX - startX) * t;

        searchBar.style.left = x + "px";
        searchBar.style.opacity = String(t);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          isSearchBarVisible = true;
          // optional: ensure perfect alignment using the same clamp logic
          positionSearchBarRelativeToMascot();
        }
      }

      requestAnimationFrame(animate);
    }

    function hideSearchBarWithSlide() {
      if (!isSearchBarVisible || !mascot || !searchBar) return;

      const mascotRect = mascot.getBoundingClientRect();
      const barWidth = searchBar.offsetWidth || 300;
      const leftSide = isLeftSideOfScreen(mascot);

      const startX =
        parseFloat(searchBar.style.left) ||
        (leftSide ? mascotRect.right + 12 : mascotRect.left - 12 - barWidth);
      const endX = leftSide
        ? mascotRect.left + mascotRect.width
        : mascotRect.left - barWidth;

      const duration = 250;
      const startTime = performance.now();

      function animate(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const x = startX + (endX - startX) * t;
        searchBar.style.left = x + "px";
        searchBar.style.opacity = String(1 - t);
        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          searchBar.style.display = "none";
          searchBar.style.opacity = "1";
          isSearchBarVisible = false;
        }
      }
      requestAnimationFrame(animate);
    }

    function toggleSearchBar() {
      if (isSearchBarVisible) {
        hideSearchBarWithSlide();
        vdo_analytics("event", "mascot_closed", {
          send_to: vdo_analyticsID,
          event_category: "vdo_ava",
          event_label: container_Id,
        });
      } else {
        showSearchBarWithSlide();
        vdo_analytics("event", "mascot_opened", {
          send_to: vdo_analyticsID,
          event_category: "vdo_ava",
          event_label: container_Id,
        });
      }
    }

    function startDrag(e) {
      const isInputOrButton =
        e.target.tagName === "INPUT" ||
        e.target.tagName === "BUTTON" ||
        e.target.closest("input") ||
        e.target.closest("button") ||
        e.target.closest(".vdo-ai-suggestions");

      if (isInputOrButton) return;

      isDragging = true;
      const rect = mascot.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      document.body.style.userSelect = "none";
    }

    mascot.addEventListener("mousedown", startDrag);
    searchBar.addEventListener("mousedown", startDrag);

    document.addEventListener("mousemove", (e) => {
      if (!isDragging || !mascot) return;
      e.preventDefault();

      const mascotRect = mascot.getBoundingClientRect();
      const width = mascotRect.width;
      const height = mascotRect.height;

      let x = e.clientX - dragOffsetX;
      let y = e.clientY - dragOffsetY;

      x = Math.max(0, Math.min(x, window.innerWidth - width));
      y = Math.max(0, Math.min(y, window.innerHeight - height));

      mascot.style.left = x + "px";
      mascot.style.top = y + "px";

      if (isSearchBarVisible) {
        positionSearchBarRelativeToMascot();
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });

    let lastMouseDownTime = 0;
    mascot.addEventListener("mousedown", () => {
      lastMouseDownTime = Date.now();
    });
    mascot.addEventListener("click", () => {
      if (!suggestionFetched) {
        fetchInitialSuggestions();
      }
      const dt = Date.now() - lastMouseDownTime;
      if (dt > 250) return;
      toggleSearchBar();
    });

    /* --- Search-bar dropdown show/hide --- */
    searchInput.addEventListener("click", () =>
      showSuggestions(suggestions, currentSuggestions)
    );
    searchInput.addEventListener("focus", () =>
      showSuggestions(suggestions, currentSuggestions)
    );
    document.addEventListener("click", (e) => {
      if (!searchBar.contains(e.target)) hideSuggestions(suggestions);
    });
  }

  /* ============================================================
   BOOTSTRAP
   ============================================================ */

  let currentMode = null; // 'mobile' or 'desktop'

  function mount(mode) {
    currentMode = mode;

    // If you want to fully recreate the container each time:
    const existing = document.getElementById(container_Id);
    if (existing) {
      existing.remove();
    }

    init();

    /* --- Clicks on search-bar dropdown suggestions --- */
    suggestions.addEventListener("click", (e) => {
      if (e.target.tagName === "DIV") {
        searchInput.value = e.target.textContent;
        hideSuggestions(suggestions);
        sidebar.classList.add("vdo-ai-open");
        hideMascotAndSearchBar();
        handleQuestionSubmission(searchInput.value, searchInput, searchButton);
        searchInput.value = "";
        VideoAdsInit();
      }
    });

    /* --- Chat input actions --- */
    function sendChatFromInput() {
      if (chatInput.value.trim()) {
        handleQuestionSubmission(
          chatInput.value.trim(),
          chatInput,
          chatSendButton
        );
        VideoAdsInit();
        chatInput.value = "";
      }
    }
    chatSendButton.addEventListener("click", sendChatFromInput);
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendChatFromInput();
    });

    /* --- Delegate clicks on IN-CHAT suggestions --- */
    chatContent.addEventListener("click", (e) => {
      const row = e.target.closest(".vdo-ai-chat-suggestion");
      if (!row) return;
      const q = row.getAttribute("data-question") || row.textContent.trim();
      if (!q) return;
      handleQuestionSubmission(q, chatInput, chatSendButton);
      VideoAdsInit();
    });

    /* --- Sidebar close --- */
    closeSidebar.addEventListener("click", () => {
      if (isAnswerInProgress) {
        vdo_analytics("event", "pre_answer_chat_close", {
          send_to: vdo_analyticsID,
          event_category: "vdo_ava",
          event_label: container_Id,
        });
      }
      isAnswerInProgress = false;
      sidebar.classList.remove("vdo-ai-open");
      showMascotAndSearchBar();
      chatContent.innerHTML = "";
      removeInChatSuggestions();
      currentSuggestions = [...initialSuggestions];
      VideoAdsInit("close");
      // Hide arrow when sidebar is closed
      if (scrollArrow) {
        scrollArrow.classList.remove("vdo-ai-visible");
      }
    });

    /* --- Search-bar send --- */
    searchButton.addEventListener("click", () => {
      if (searchInput.value.trim()) {
        hideSuggestions(suggestions);
        sidebar.classList.add("vdo-ai-open");
        hideMascotAndSearchBar();
        handleQuestionSubmission(searchInput.value, searchInput, searchButton);
        searchInput.value = "";
        VideoAdsInit();
      }
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter"  && searchInput.value.trim()) {
          hideSuggestions(suggestions);
          sidebar.classList.add("vdo-ai-open");
          hideMascotAndSearchBar();
          handleQuestionSubmission(searchInput.value, searchInput, searchButton);
          searchInput.value = "";
          VideoAdsInit();
      }
    });

    vdo_analytics("event", "widget_loaded", {
      send_to: vdo_analyticsID,
      event_category: "vdo_ava",
      event_label: container_Id,
    });
    [searchButton, suggestions].forEach((item) => {
      item.addEventListener("click", () => {
        vdo_analytics("event", "widget_opened", {
          send_to: vdo_analyticsID,
          event_category: "vdo_ava",
          event_label: container_Id,
        });
      });
    });
    closeSidebar.addEventListener("click", () => {
      vdo_analytics("event", "widget_closed", {
        send_to: vdo_analyticsID,
        event_category: "vdo_ava",
        event_label: container_Id,
      });
    });

    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        vdo_analytics("event", "followup_user_typeform", {
          send_to: vdo_analyticsID,
          event_category: "vdo_ava",
          event_label: container_Id,
        });
        chatInput.value = "";
      }
    });

    suggestions.addEventListener("click", () => {
      vdo_analytics("event", "recommended_prompt_clicked", {
        send_to: vdo_analyticsID,
        event_category: "vdo_ava",
        event_label: container_Id,
      });
    });

    chatContent.addEventListener("click", () => {
      vdo_analytics("event", "followup_prompt_clicked", {
        send_to: vdo_analyticsID,
        event_category: "vdo_ava",
        event_label: container_Id,
      });
    });

    [chatSendButton, searchButton].forEach((item) => {
      item.addEventListener("click", () => {
          const searchVal = searchInput?.value?.trim() || "";
          const chatVal = chatInput?.value?.trim() || "";
          let eventName = (item === chatSendButton) ? "followup_user_typeform" : "user_typeform";
          if (searchVal || chatVal) {
              vdo_analytics("event", eventName, {
                  send_to: vdo_analyticsID,
                  event_category: "vdo_ava",
                  event_label: container_Id,
              });
          }
      });
      searchInput.value = "";
      chatInput.value = "";
    });
    
  }

  // Initial mount
  mount(mql.matches ? "mobile" : "desktop");

  // Listen for breakpoint changes
  function handleChange(e) {
    const newMode = e.matches ? "mobile" : "desktop";
    if (newMode !== currentMode) {
      mount(newMode);
    }
  }

  if (mql.addEventListener) {
    mql.addEventListener("change", handleChange);
  } else {
    // For very old browsers
    mql.addListener(handleChange);
  }

  // Shared stuff (runs once, works for both UIs)
  setInterval(cyclePlaceholder, 2000);
  cyclePlaceholder();
})();