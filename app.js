const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;

const seedMessages = [
  { id: 1, sender: "GitHub", email: "noreply@github.com", subject: "Please verify your device", snippet: "A sign-in attempt requires further verification because we did not recognize your device.", date: "7:56 PM", fullDate: "Mon, Sep 7, 2026, 7:56 PM", category: "primary", unread: true, starred: false, body: "We noticed a sign-in attempt from a device we haven’t seen before. Use the verification screen on your device to confirm it was you. If you did not attempt to sign in, review your account security settings." },
  { id: 2, sender: "Linux + Tech Insights", email: "digest@linuxblog.io", subject: "Your Linux and Tech insights — September 7", snippet: "This week in Linux: top stories, releases, tools, and community highlights.", date: "5:29 PM", fullDate: "Mon, Sep 7, 2026, 5:29 PM", category: "updates", unread: true, starred: true, body: "Here’s your weekly briefing on the Linux ecosystem. This edition covers a major kernel release, practical terminal tools, and five community projects worth watching." },
  { id: 3, sender: "Luna Merdin", email: "hello@lunamerdin.example", subject: "Confirm your subscription", snippet: "One quick step and you’ll be subscribed to the weekly newsletter.", date: "2:26 PM", fullDate: "Mon, Sep 7, 2026, 2:26 PM", category: "promotions", unread: true, starred: false, body: "Thanks for signing up. Please confirm that you would like to receive the weekly design newsletter. You can unsubscribe at any time." },
  { id: 4, sender: "Google", email: "no-reply@accounts.google.com", subject: "You shared some Google Account data with Canva", snippet: "Keep track of the apps connected to your Google Account.", date: "Sep 5", fullDate: "Sat, Sep 5, 2026, 2:00 PM", category: "updates", unread: false, starred: false, body: "You recently used Sign in with Google to access a design application. The app received the basic profile information you approved. You can review connected apps from your account settings." },
  { id: 5, sender: "Otter.ai", email: "team@otter.ai", subject: "We’d love to hear from you, Fakhrul", snippet: "Tell us about your experience and help us improve Otter.", date: "Sep 5", fullDate: "Sat, Sep 5, 2026, 10:55 AM", category: "promotions", unread: false, starred: false, body: "We hope you’re enjoying the product. Our team would appreciate a minute of your time to tell us how your first recordings went." },
  { id: 6, sender: "ChatGPT", email: "noreply@openai.com", subject: "Your temporary login code", snippet: "Use this temporary verification code to continue signing in.", date: "Sep 5", fullDate: "Sat, Sep 5, 2026, 8:22 AM", category: "primary", unread: false, starred: true, body: "A temporary code was requested for your account. Enter the code shown on your active sign-in page. If you didn’t request this, you can safely ignore the message and review your security settings." },
  { id: 7, sender: "Vercel", email: "security@vercel.com", subject: "New sign-in detected on your account", snippet: "Your account was recently accessed from a new browser.", date: "Sep 5", fullDate: "Sat, Sep 5, 2026, 11:18 AM", category: "updates", unread: false, starred: false, body: "We detected a new sign-in to your account. If this was you, no action is needed. Otherwise, reset your password and review active sessions." },
  { id: 8, sender: "WordPress", email: "wordpress@site.example", subject: "New user registration", snippet: "A new user has registered on your website.", date: "Sep 4", fullDate: "Fri, Sep 4, 2026, 11:48 AM", category: "updates", unread: false, starred: false, body: "A new subscriber account was created on your demo website. Open your administration dashboard to review the user profile." },
  { id: 9, sender: "Google", email: "no-reply@accounts.google.com", subject: "Security alert", snippet: "A new sign-in was detected on a Windows device.", date: "Sep 4", fullDate: "Fri, Sep 4, 2026, 10:51 AM", category: "primary", unread: false, starred: false, body: "We noticed a new sign-in to your Google Account from a Windows device. If this was you, you don’t need to do anything. If not, follow the account recovery steps." },
  { id: 10, sender: "Lisa’s Lovelies", email: "orders@lisaslovelies.example", subject: "Your order is confirmed (#11053)", snippet: "Thanks for your order. We’ll let you know when it ships.", date: "Sep 4", fullDate: "Fri, Sep 4, 2026, 10:50 AM", category: "promotions", unread: false, starred: true, body: "Your order has been confirmed and is now being prepared. You’ll receive another email with tracking information as soon as it ships." },
  { id: 11, sender: "UoPeople President", email: "president@uopeople.example", subject: "Welcome from President Shai Reshef", snippet: "A special welcome message for the start of your academic journey.", date: "Sep 3", fullDate: "Thu, Sep 3, 2026, 8:23 PM", category: "primary", unread: false, starred: false, body: "Welcome to a new academic term. Your commitment to learning is the first step toward an exciting future, and our global community is here to support you." },
  { id: 12, sender: "Web3Forms", email: "support@web3forms.com", subject: "Welcome to Web3Forms", snippet: "Thanks for signing up. Your form endpoint is ready to use.", date: "Sep 3", fullDate: "Thu, Sep 3, 2026, 10:53 AM", category: "updates", unread: false, starred: false, body: "Your workspace is ready. Create a form, add your access key, and start receiving submissions without maintaining a backend." },
  { id: 13, sender: "UoPeople Community", email: "community@uopeople.example", subject: "Welcome Weekly Digest", snippet: "New posts and conversations from the student community.", date: "Sep 3", fullDate: "Thu, Sep 3, 2026, 10:51 AM", category: "social", unread: false, starred: false, body: "Catch up on this week’s most active student discussions, study tips, and community announcements." },
  { id: 14, sender: "OpenAI", email: "noreply@openai.com", subject: "New sign-in to your account", snippet: "We noticed a recent sign-in from a new browser.", date: "Sep 2", fullDate: "Wed, Sep 2, 2026, 2:27 PM", category: "primary", unread: false, starred: false, body: "A new sign-in was recorded for your account. If you recognize this activity, no action is required. Otherwise, secure your account immediately." },
  { id: 15, sender: "Facebook", email: "security@facebookmail.com", subject: "Did you just log in on a new device?", snippet: "Let us know if this login wasn’t you.", date: "Sep 1", fullDate: "Tue, Sep 1, 2026, 10:14 PM", category: "social", unread: false, starred: false, body: "Someone signed in from a new browser. Review the device and location in your security activity and tell us if you don’t recognize it." },
  { id: 16, sender: "Microsoft account team", email: "account-security@microsoft.com", subject: "Your single-use code", snippet: "Use this code to finish signing in to your Microsoft account.", date: "Sep 1", fullDate: "Tue, Sep 1, 2026, 10:08 PM", category: "primary", unread: false, starred: false, body: "A single-use code was requested for your account. Only enter it on an official Microsoft page. If you didn’t request a code, no further action is needed." },
  { id: 17, sender: "Fakhrul Alam", email: "fakhrul@example.com", subject: "Project planning notes", snippet: "Draft milestones and links for the next project review.", date: "Sep 1", fullDate: "Tue, Sep 1, 2026, 9:41 PM", category: "primary", unread: false, starred: true, body: "Here are the working notes for our next review: finalize the prototype, verify responsive behavior, and prepare a short walkthrough." },
  { id: 18, sender: "Brave Search API", email: "api@brave.com", subject: "Billing and terms update", snippet: "We’ve changed the way new subscriptions are billed.", date: "Sep 1", fullDate: "Tue, Sep 1, 2026, 8:54 PM", category: "updates", unread: false, starred: false, body: "New API subscriptions now use a prepaid credit model. Existing plans remain available through the end of the current billing cycle." },
  { id: 19, sender: "Google Gemini", email: "gemini-noreply@google.com", subject: "Welcome to Gemini", snippet: "Learn more about what you can do with Gemini.", date: "Aug 31", fullDate: "Mon, Aug 31, 2026, 11:52 AM", category: "promotions", unread: false, starred: false, body: "Welcome to Gemini. Brainstorm ideas, understand complex topics, summarize information, and get help with everyday work." },
  { id: 20, sender: "Brave Search API", email: "api@brave.com", subject: "Welcome to Brave Search API", snippet: "Your account is active. Generate an API key to get started.", date: "Aug 29", fullDate: "Sat, Aug 29, 2026, 8:27 AM", category: "updates", unread: false, starred: false, body: "Your account is now active. Subscribe to a plan, generate an API key, and review the quick-start documentation to make your first request." },
  { id: 21, sender: "Gamma", email: "hello@gamma.app", subject: "Your ideas just found their stage", snippet: "Welcome to a faster way to create presentations and documents.", date: "Aug 28", fullDate: "Fri, Aug 28, 2026, 3:20 PM", category: "promotions", unread: false, starred: false, body: "Turn an outline into a polished presentation, page, or document. Start from a blank canvas or try one of the templates in your workspace." },
  { id: 22, sender: "University of the People", email: "student.services@uopeople.example", subject: "Help shape your experience", snippet: "Take a quick survey for new students.", date: "Aug 27", fullDate: "Thu, Aug 27, 2026, 11:56 AM", category: "primary", unread: false, starred: false, body: "As you begin your studies, we’d love to understand what would make your experience better. The survey takes about three minutes." },
  { id: 23, sender: "PhantomBuster", email: "hello@phantombuster.com", subject: "Your first automation is ready", snippet: "Start with a template and collect your first results.", date: "Aug 27", fullDate: "Thu, Aug 27, 2026, 11:21 AM", category: "promotions", unread: false, starred: false, body: "Choose an automation template, connect a data source, and launch your first workflow. Sample data is included so you can experiment safely." },
  { id: 24, sender: "Design Community", email: "updates@designcommunity.example", subject: "12 new reactions to your work", snippet: "People are talking about your latest interface concept.", date: "Aug 26", fullDate: "Wed, Aug 26, 2026, 10:52 AM", category: "social", unread: false, starred: false, body: "Your latest interface concept received twelve new reactions and three thoughtful comments from the community." }
];

let messages = seedMessages.map(message => ({ ...message, archived: false, deleted: false, spam: false, snoozed: false, sent: false, draft: false, labels: [] }));
const state = {
  folder: "Inbox",
  category: "primary",
  query: "",
  advanced: { from: "", subject: "", starred: false },
  selected: new Set(),
  page: 0,
  pageSize: 15,
  currentId: null,
  labels: [
    { name: "Work", color: "#1a73e8" },
    { name: "Personal", color: "#188038" },
    { name: "Receipts", color: "#e37400" }
  ],
  lastAction: null,
  toastTimer: null
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const app = $("#app");

const folderConfig = [
  ["Inbox", "inbox"], ["Starred", "star"], ["Snoozed", "clock"],
  ["Sent", "send"], ["Drafts", "draft"], ["Spam", "report"], ["Trash", "trash"]
];
const categories = [
  ["primary", "Primary", "primary"], ["promotions", "Promotions", "tag"],
  ["social", "Social", "people"], ["updates", "Updates", "info"]
];

function inboxMessages() {
  return messages.filter(m => !m.archived && !m.deleted && !m.spam && !m.snoozed && !m.sent && !m.draft);
}

function folderMessages() {
  let result;
  switch (state.folder) {
    case "Starred": result = messages.filter(m => m.starred && !m.deleted); break;
    case "Snoozed": result = messages.filter(m => m.snoozed && !m.deleted); break;
    case "Sent": result = messages.filter(m => m.sent && !m.deleted); break;
    case "Drafts": result = messages.filter(m => m.draft && !m.deleted); break;
    case "Spam": result = messages.filter(m => m.spam && !m.deleted); break;
    case "Trash": result = messages.filter(m => m.deleted); break;
    default:
      if (state.folder.startsWith("label:")) {
        const label = state.folder.slice(6);
        result = messages.filter(m => m.labels.includes(label) && !m.deleted);
      } else {
        const hasSearch = state.query || state.advanced.from || state.advanced.subject || state.advanced.starred;
        result = hasSearch ? inboxMessages() : inboxMessages().filter(m => m.category === state.category);
      }
  }
  const query = state.query.trim().toLowerCase();
  if (query) result = result.filter(m => `${m.sender} ${m.email} ${m.subject} ${m.snippet} ${m.body}`.toLowerCase().includes(query));
  if (state.advanced.from) result = result.filter(m => `${m.sender} ${m.email}`.toLowerCase().includes(state.advanced.from.toLowerCase()));
  if (state.advanced.subject) result = result.filter(m => m.subject.toLowerCase().includes(state.advanced.subject.toLowerCase()));
  if (state.advanced.starred) result = result.filter(m => m.starred);
  return result;
}

function unreadCount() { return inboxMessages().filter(m => m.unread).length; }

function renderNav() {
  const counts = {
    Inbox: unreadCount(),
    Starred: messages.filter(m => m.starred && !m.deleted).length,
    Snoozed: messages.filter(m => m.snoozed && !m.deleted).length,
    Sent: messages.filter(m => m.sent && !m.deleted).length,
    Drafts: messages.filter(m => m.draft && !m.deleted).length,
    Spam: messages.filter(m => m.spam && !m.deleted).length,
    Trash: messages.filter(m => m.deleted).length
  };
  $("#folderNav").innerHTML = folderConfig.map(([name, iconName]) => `
    <button class="nav-item ${state.folder === name ? "active" : ""}" data-folder="${name}" title="${name}">
      ${icon(iconName)}<span>${name}</span><span class="count">${counts[name] || ""}</span>
    </button>`).join("");
  $("#labelNav").innerHTML = state.labels.map(label => `
    <button class="nav-item ${state.folder === `label:${label.name}` ? "active" : ""}" data-folder="label:${label.name}" title="${label.name}">
      <i class="label-color" style="background:${label.color}"></i><span>${label.name}</span><span class="count"></span>
    </button>`).join("");
  $$("[data-folder]").forEach(button => button.addEventListener("click", () => switchFolder(button.dataset.folder)));
  document.title = `Inbox (${unreadCount()}) - Demo Mail`;
}

function renderCategories() {
  const visible = state.folder === "Inbox" && !state.query && !state.advanced.from && !state.advanced.subject && !state.advanced.starred;
  $("#categoryTabs").style.display = visible ? "flex" : "none";
  $("#categoryTabs").innerHTML = categories.map(([id, label, iconName]) => {
    const count = inboxMessages().filter(m => m.category === id && m.unread).length;
    return `<button class="category-tab ${state.category === id ? "active" : ""}" data-category="${id}">${icon(iconName)}<strong>${label}</strong>${count ? `<small>${count} new</small>` : ""}</button>`;
  }).join("");
  $$("[data-category]").forEach(button => button.addEventListener("click", () => {
    state.category = button.dataset.category; state.page = 0; state.selected.clear(); render();
  }));
}

function renderMessages() {
  const result = folderMessages();
  const start = state.page * state.pageSize;
  const pageItems = result.slice(start, start + state.pageSize);
  const list = $("#messageList");
  list.innerHTML = pageItems.map(m => `
    <div class="message-row ${m.unread ? "unread" : ""} ${state.selected.has(m.id) ? "selected" : ""}" data-id="${m.id}" role="button" tabindex="0">
      <label class="row-check" aria-label="Select ${escapeHtml(m.subject)}"><input type="checkbox" ${state.selected.has(m.id) ? "checked" : ""}></label>
      <button class="star-button ${m.starred ? "starred" : ""}" aria-label="${m.starred ? "Unstar" : "Star"}">${icon("star")}</button>
      <span class="sender">${escapeHtml(m.sender)}</span>
      <span class="message-summary"><span class="subject-line">${escapeHtml(m.subject)}</span><span class="snippet">${escapeHtml(m.snippet)}</span></span>
      <span class="date">${escapeHtml(m.date)}</span>
      <span class="row-actions">
        <button class="icon-button row-action" data-row-action="archive" aria-label="Archive">${icon("archive")}</button>
        <button class="icon-button row-action" data-row-action="delete" aria-label="Delete">${icon("trash")}</button>
        <button class="icon-button row-action" data-row-action="${m.unread ? "read" : "unread"}" aria-label="${m.unread ? "Mark as read" : "Mark as unread"}">${icon("mail")}</button>
        <button class="icon-button row-action" data-row-action="snooze" aria-label="Snooze">${icon("snooze")}</button>
      </span>
    </div>`).join("");

  list.style.display = pageItems.length ? "block" : "none";
  $("#emptyState").style.display = pageItems.length ? "none" : "flex";
  $$(".message-row").forEach(row => {
    const id = Number(row.dataset.id);
    row.addEventListener("click", event => {
      if (event.target.closest("button,label,input")) return;
      openMessage(id);
    });
    row.addEventListener("keydown", event => { if (event.key === "Enter") openMessage(id); });
    row.querySelector(".row-check input").addEventListener("change", event => toggleSelection(id, event.target.checked));
    row.querySelector(".star-button").addEventListener("click", event => { event.stopPropagation(); toggleStar(id); });
    row.querySelectorAll("[data-row-action]").forEach(button => button.addEventListener("click", event => {
      event.stopPropagation(); applyAction(button.dataset.rowAction, [id]);
    }));
  });

  const total = result.length;
  const end = Math.min(start + state.pageSize, total);
  $("#rangeButton").textContent = total ? `${start + 1}–${end} of ${total}` : "0 of 0";
  $("#prevPage").disabled = state.page === 0;
  $("#nextPage").disabled = end >= total;
  $("#selectAll").checked = pageItems.length > 0 && pageItems.every(m => state.selected.has(m.id));
  $("#mailToolbar").classList.toggle("has-selection", state.selected.size > 0);
}

function render() {
  renderNav();
  renderCategories();
  renderMessages();
}

function switchFolder(folder) {
  state.folder = folder;
  state.page = 0;
  state.selected.clear();
  state.query = "";
  state.advanced = { from: "", subject: "", starred: false };
  $("#searchInput").value = "";
  closeMessage();
  render();
  closeMobileMenu();
}

function toggleSelection(id, checked) {
  checked ? state.selected.add(id) : state.selected.delete(id);
  renderMessages();
}

function toggleStar(id) {
  const message = messages.find(m => m.id === id);
  if (!message) return;
  message.starred = !message.starred;
  render();
}

function applyAction(action, ids = [...state.selected]) {
  if (!ids.length) return;
  const snapshot = messages.map(m => ({ ...m, labels: [...m.labels] }));
  const affected = messages.filter(m => ids.includes(m.id));
  const labels = {
    archive: "Conversation archived", delete: "Conversation moved to Trash", report: "Conversation marked as spam",
    read: "Conversation marked as read", unread: "Conversation marked as unread", snooze: "Conversation snoozed"
  };
  affected.forEach(message => {
    if (action === "archive") message.archived = true;
    if (action === "delete") message.deleted = true;
    if (action === "report") message.spam = true;
    if (action === "read") message.unread = false;
    if (action === "unread") message.unread = true;
    if (action === "snooze") message.snoozed = true;
  });
  state.lastAction = { snapshot, label: labels[action] };
  state.selected.clear();
  if (state.currentId && ["archive", "delete", "report", "snooze"].includes(action)) closeMessage();
  render();
  showToast(labels[action] || "Mailbox updated", true);
}

function openMessage(id) {
  const message = messages.find(m => m.id === id);
  if (!message) return;
  message.unread = false;
  state.currentId = id;
  $("#listView").style.display = "none";
  $("#messageView").classList.add("open");
  const initials = message.sender.split(/\s+/).slice(0, 2).map(part => part[0]).join("");
  $("#messageContent").innerHTML = `<div class="message-inner">
    <div class="message-subject"><h1>${escapeHtml(message.subject)}</h1><span class="message-label">${message.category}</span><button class="star-button ${message.starred ? "starred" : ""}" id="viewStar">${icon("star")}</button></div>
    <div class="message-sender"><div class="sender-avatar">${escapeHtml(initials)}</div><div class="sender-meta"><strong>${escapeHtml(message.sender)}</strong> <span>&lt;${escapeHtml(message.email)}&gt;</span><br><span>to me ${icon("chevron")}</span></div><div class="message-date">${escapeHtml(message.fullDate)}</div></div>
    <div class="message-body"><div class="hero-card"><h2>${escapeHtml(message.subject)}</h2><p>${escapeHtml(message.body)}</p><button class="email-cta">Review details</button></div><p>This is a local demo message. Links and account actions stay inside this interface.</p><p>Best,<br>${escapeHtml(message.sender)}</p></div>
    <div class="reply-actions"><button id="replyButton">↩ Reply</button><button id="forwardButton">→ Forward</button></div>
  </div>`;
  $("#viewStar").addEventListener("click", () => { toggleStar(id); openMessage(id); });
  $("#replyButton").addEventListener("click", () => openCompose(message.email, `Re: ${message.subject}`, "\n\n"));
  $("#forwardButton").addEventListener("click", () => openCompose("", `Fwd: ${message.subject}`, `\n\n---------- Forwarded message ----------\nFrom: ${message.sender}\n${message.body}`));
  $(".email-cta").addEventListener("click", () => showToast("Details opened in the demo"));
  renderNav();
}

function closeMessage() {
  state.currentId = null;
  $("#messageView").classList.remove("open");
  $("#listView").style.display = "flex";
}

function adjacentMessage(direction) {
  const list = folderMessages();
  const index = list.findIndex(m => m.id === state.currentId);
  const next = list[index + direction];
  if (next) openMessage(next.id);
}

function showToast(text, undo = false) {
  clearTimeout(state.toastTimer);
  $("#toastText").textContent = text;
  $("#undoButton").style.display = undo ? "block" : "none";
  $("#toast").classList.add("open");
  state.toastTimer = setTimeout(() => $("#toast").classList.remove("open"), 4200);
}

function undoLastAction() {
  if (!state.lastAction) return;
  messages = state.lastAction.snapshot.map(m => ({ ...m, labels: [...m.labels] }));
  state.lastAction = null;
  $("#toast").classList.remove("open");
  render();
  showToast("Action undone");
}

function openCompose(to = "", subject = "", body = "") {
  $("#composeWindow").classList.add("open");
  $("#composeWindow").classList.remove("minimized");
  $("#composeTo").value = to;
  $("#composeSubject").value = subject;
  $("#composeBody").innerText = body;
  setTimeout(() => (to ? $("#composeSubject") : $("#composeTo")).focus(), 0);
}

function composeHasContent() {
  return $("#composeTo").value.trim() || $("#composeSubject").value.trim() || $("#composeBody").innerText.trim();
}

function closeCompose(save = true) {
  if (save && composeHasContent()) {
    const existingDraft = messages.find(m => m.draft && m.subject === $("#composeSubject").value.trim());
    if (!existingDraft) messages.unshift({
      id: Date.now(), sender: "Draft", email: "fakhrul@example.com", subject: $("#composeSubject").value.trim() || "(no subject)",
      snippet: $("#composeBody").innerText.trim() || "Empty draft", date: "now", fullDate: "Just now", category: "primary", unread: false,
      starred: false, body: $("#composeBody").innerText.trim(), archived: false, deleted: false, spam: false, snoozed: false, sent: false, draft: true, labels: []
    });
    showToast("Draft saved");
  }
  $("#composeWindow").classList.remove("open", "minimized", "maximized");
  $("#composeTo").value = ""; $("#composeSubject").value = ""; $("#composeBody").innerHTML = "";
  render();
}

async function sendMessage() {
  const to = $("#composeTo").value.trim();
  if (!to) { showToast("Add at least one recipient"); $("#composeTo").focus(); return; }
  const subject = $("#composeSubject").value.trim() || "(no subject)";
  const body = $("#composeBody").innerText.trim();
  const sendButton = $("#sendButton");
  sendButton.disabled = true;
  sendButton.innerHTML = "Sending…";

  try {
    const configElement = $("#web3forms-config");
    const accessKey = configElement ? JSON.parse(configElement.textContent).accessKey : "";
    if (!accessKey) throw new Error("Email delivery is not configured");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        from_name: "Not Gmail",
        email: to,
        subject: `[Not Gmail] ${subject}`,
        intended_recipient: to,
        message: body || "(empty message)",
        botcheck: ""
      })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Web3Forms could not deliver the message");
    }

  messages.unshift({
      id: Date.now(), sender: `To: ${to}`, email: to, subject, snippet: body, date: "now", fullDate: "Just now",
      category: "primary", unread: false, starred: false, body: body || "(empty message)", archived: false,
    deleted: false, spam: false, snoozed: false, sent: true, draft: false, labels: []
  });
  $("#composeWindow").classList.remove("open", "minimized", "maximized");
  $("#composeTo").value = ""; $("#composeSubject").value = ""; $("#composeBody").innerHTML = "";
  render();
    showToast("Message delivered through Web3Forms");
  } catch (error) {
    showToast(error.message || "Message could not be sent");
  } finally {
    sendButton.disabled = false;
    sendButton.innerHTML = "Send <span>⌄</span>";
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function closeFloating() {
  $$(".popover.open,.account-popover.open,.apps-popover.open,.advanced-search.open").forEach(element => element.classList.remove("open"));
}

function toggleSidePanel(panel) {
  ["#utilityPanel", "#settingsPanel", "#geminiPanel"].forEach(selector => {
    if (selector !== panel) $(selector).classList.remove("open");
  });
  $(panel).classList.toggle("open");
}

function openUtility(name) {
  $("#utilityTitle").textContent = name;
  const content = {
    Calendar: `<div class="mini-calendar"><div class="month"><button>‹</button><span>September 2026</span><button>›</button></div><div class="calendar-grid"><b>S</b><b>M</b><b>T</b><b>W</b><b>T</b><b>F</b><b>S</b>${Array.from({length: 35}, (_, i) => i < 2 ? "<span></span>" : `<span class="${i === 8 ? "today" : ""}">${i - 1}</span>`).join("")}</div></div>`,
    Keep: `<button class="outline-button">＋ Take a note</button><div class="note-card"><strong>Design review</strong><br>Check mobile inbox and compose flow.</div><div class="note-card"><strong>Ideas</strong><br>Try keyboard shortcuts and labels.</div>`,
    Tasks: `<button class="outline-button">＋ Add a task</button><div class="task-card"><label><input type="checkbox"> Reply to project update</label></div><div class="task-card"><label><input type="checkbox"> Review inbox categories</label></div>`,
    Contacts: `<div class="contact-card"><div class="sender-avatar">AM</div><div><strong>Alex Morgan</strong><br><small>alex@example.com</small></div></div><div class="contact-card"><div class="sender-avatar">SK</div><div><strong>Sam Kim</strong><br><small>sam@example.com</small></div></div>`,
    "Add-ons": `<h3>Google Workspace Marketplace</h3><p>Connect productivity tools to Gmail.</p><button class="outline-button">Browse add-ons</button>`
  };
  $("#utilityContent").innerHTML = content[name] || "";
  $$(".rail-button").forEach(button => button.classList.toggle("active", button.dataset.panel === name));
  $("#settingsPanel").classList.remove("open"); $("#geminiPanel").classList.remove("open");
  $("#utilityPanel").classList.add("open");
}

function closeMobileMenu() { app.classList.remove("mobile-menu-open"); $("#modalBackdrop").classList.remove("open"); }

$("#menuButton").addEventListener("click", () => {
  if (innerWidth <= 720) { app.classList.toggle("mobile-menu-open"); $("#modalBackdrop").classList.toggle("open"); }
  else app.classList.toggle("sidebar-collapsed");
});
$("#brandButton").addEventListener("click", () => switchFolder("Inbox"));
$("#composeButton").addEventListener("click", () => openCompose());
$("#selectAll").addEventListener("change", event => {
  const pageItems = folderMessages().slice(state.page * state.pageSize, state.page * state.pageSize + state.pageSize);
  pageItems.forEach(m => event.target.checked ? state.selected.add(m.id) : state.selected.delete(m.id));
  renderMessages();
});
$("#selectMenuButton").addEventListener("click", event => { event.stopPropagation(); $("#selectPopover").classList.toggle("open"); });
$("#moreButton").addEventListener("click", event => { event.stopPropagation(); $("#morePopover").classList.toggle("open"); });
$("#refreshButton").addEventListener("click", () => { $("#refreshButton svg").animate([{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 500 }); showToast("Inbox refreshed"); });
$$(".bulk-tools [data-action]").forEach(button => button.addEventListener("click", () => applyAction(button.dataset.action)));
$("#prevPage").addEventListener("click", () => { if (state.page > 0) { state.page--; renderMessages(); } });
$("#nextPage").addEventListener("click", () => { if ((state.page + 1) * state.pageSize < folderMessages().length) { state.page++; renderMessages(); } });

$("#searchForm").addEventListener("submit", event => { event.preventDefault(); state.query = $("#searchInput").value; state.folder = "Inbox"; state.page = 0; state.selected.clear(); render(); });
$("#searchInput").addEventListener("input", event => { if (!event.target.value) { state.query = ""; render(); } });
$("#searchOptionsButton").addEventListener("click", event => { event.stopPropagation(); $("#advancedSearch").classList.toggle("open"); });
$("#advancedSearch").addEventListener("click", event => event.stopPropagation());
$("#applyAdvanced").addEventListener("click", () => {
  state.advanced = { from: $("#searchFrom").value.trim(), subject: $("#searchSubject").value.trim(), starred: $("#searchStarred").checked };
  state.folder = "Inbox"; state.page = 0; $("#advancedSearch").classList.remove("open"); render();
});
$("#clearAdvanced").addEventListener("click", () => {
  $("#searchFrom").value = ""; $("#searchSubject").value = ""; $("#searchStarred").checked = false;
  state.advanced = { from: "", subject: "", starred: false }; render();
});

$("#backButton").addEventListener("click", () => { closeMessage(); render(); });
$$("[data-message-action]").forEach(button => button.addEventListener("click", () => applyAction(button.dataset.messageAction, [state.currentId])));
$("#messagePrev").addEventListener("click", () => adjacentMessage(-1));
$("#messageNext").addEventListener("click", () => adjacentMessage(1));

$("#closeCompose").addEventListener("click", () => closeCompose(true));
$("#discardButton").addEventListener("click", () => { closeCompose(false); showToast("Draft discarded"); });
$("#sendButton").addEventListener("click", sendMessage);
$("#minimizeCompose").addEventListener("click", event => { event.stopPropagation(); $("#composeWindow").classList.toggle("minimized"); });
$("#composeWindow > header").addEventListener("click", () => { if ($("#composeWindow").classList.contains("minimized")) $("#composeWindow").classList.remove("minimized"); });
$("#popoutCompose").addEventListener("click", event => { event.stopPropagation(); $("#composeWindow").classList.toggle("maximized"); });
$("#attachButton").addEventListener("click", () => showToast("Attachment picker simulated in demo"));
$("#formatButton").addEventListener("click", () => document.execCommand("bold"));
$$(".recipient-row button").forEach(button => button.addEventListener("click", () => {
  $("#composeTo").placeholder = `${button.textContent} recipients`;
  $("#composeTo").focus();
  showToast(`${button.textContent} recipients enabled`);
}));

$("#settingsButton").addEventListener("click", () => toggleSidePanel("#settingsPanel"));
$("#closeSettings").addEventListener("click", () => $("#settingsPanel").classList.remove("open"));
$("#geminiButton").addEventListener("click", () => toggleSidePanel("#geminiPanel"));
$("#closeGemini").addEventListener("click", () => $("#geminiPanel").classList.remove("open"));
$$(".rail-button").forEach(button => button.addEventListener("click", () => openUtility(button.dataset.panel)));
$("#closeUtility").addEventListener("click", () => { $("#utilityPanel").classList.remove("open"); $$(".rail-button").forEach(button => button.classList.remove("active")); });

$$("input[name=density]").forEach(input => input.addEventListener("change", () => {
  document.body.classList.remove("density-comfortable", "density-compact");
  if (input.value !== "default") document.body.classList.add(`density-${input.value}`);
}));
$$("[data-theme]").forEach(button => button.addEventListener("click", () => {
  document.body.classList.remove("theme-soft", "theme-dark");
  if (button.dataset.theme !== "light") document.body.classList.add(`theme-${button.dataset.theme}`);
  $$("[data-theme]").forEach(item => item.classList.toggle("active", item === button));
}));
$("#readingPaneToggle").addEventListener("change", event => showToast(event.target.checked ? "Reading pane enabled for this demo" : "Reading pane disabled"));
$(".settings-panel > .outline-button").addEventListener("click", () => showToast("All settings are represented in Quick settings for this demo"));

$("#profileButton").addEventListener("click", event => { event.stopPropagation(); $("#accountPopover").classList.toggle("open"); $("#appsPopover").classList.remove("open"); });
$("#appsButton").addEventListener("click", event => { event.stopPropagation(); $("#appsPopover").classList.toggle("open"); $("#accountPopover").classList.remove("open"); });
$("#helpButton").addEventListener("click", () => showToast("Help Center is disabled in this local demo"));
$("#rangeButton").addEventListener("click", () => showToast(`${folderMessages().length} conversations in this view`));
$$(".apps-popover button").forEach(button => button.addEventListener("click", () => { closeFloating(); showToast(`${button.textContent.trim()} opened in demo mode`); }));
$$(".account-popover > button:not(.avatar)").forEach(button => button.addEventListener("click", () => showToast(`${button.textContent.trim()} is simulated in this demo`)));
$("#newLabelButton").addEventListener("click", () => { $("#newLabelInput").value = ""; $("#labelDialog").showModal(); setTimeout(() => $("#newLabelInput").focus(), 0); });
$("#createLabelConfirm").addEventListener("click", event => {
  const name = $("#newLabelInput").value.trim();
  if (!name) { event.preventDefault(); $("#newLabelInput").focus(); return; }
  if (!state.labels.some(label => label.name.toLowerCase() === name.toLowerCase())) state.labels.push({ name, color: ["#1a73e8", "#188038", "#e37400", "#a142f4"][state.labels.length % 4] });
  renderNav(); showToast(`Label “${name}” created`);
});

$("#geminiForm").addEventListener("submit", event => {
  event.preventDefault(); const prompt = $("#geminiInput").value.trim(); if (!prompt) return;
  $("#geminiInput").value = ""; showToast(`Gemini demo: found ${inboxMessages().filter(m => m.unread).length} unread messages`);
});
$$(".suggestion-list button").forEach(button => button.addEventListener("click", () => showToast(`${button.textContent}: ${inboxMessages().filter(m => m.unread).length} unread messages in this demo`)));

$$("[data-select]").forEach(button => button.addEventListener("click", () => {
  const items = folderMessages(); const type = button.dataset.select; state.selected.clear();
  if (type === "all") items.forEach(m => state.selected.add(m.id));
  if (type === "read") items.filter(m => !m.unread).forEach(m => state.selected.add(m.id));
  if (type === "unread") items.filter(m => m.unread).forEach(m => state.selected.add(m.id));
  if (type === "starred") items.filter(m => m.starred).forEach(m => state.selected.add(m.id));
  $("#selectPopover").classList.remove("open"); renderMessages();
}));
$$("[data-more]").forEach(button => button.addEventListener("click", () => {
  const action = button.dataset.more;
  if (action === "read") { folderMessages().forEach(m => m.unread = false); showToast("All conversations marked as read"); }
  if (action === "starred") { state.folder = "Starred"; state.page = 0; }
  if (action === "reset") { messages = seedMessages.map(message => ({ ...message, archived: false, deleted: false, spam: false, snoozed: false, sent: false, draft: false, labels: [] })); state.selected.clear(); state.folder = "Inbox"; state.category = "primary"; showToast("Demo mailbox reset"); }
  $("#morePopover").classList.remove("open"); render();
}));

$("#undoButton").addEventListener("click", undoLastAction);
$("#closeToast").addEventListener("click", () => $("#toast").classList.remove("open"));
$("#modalBackdrop").addEventListener("click", closeMobileMenu);
document.addEventListener("click", event => { if (!event.target.closest(".popover,.account-popover,.apps-popover,.advanced-search,#selectMenuButton,#moreButton,#profileButton,#appsButton,#searchOptionsButton")) closeFloating(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeFloating(); closeMobileMenu(); $("#settingsPanel").classList.remove("open"); $("#utilityPanel").classList.remove("open"); $("#geminiPanel").classList.remove("open"); }
  if (event.key.toLowerCase() === "c" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) openCompose();
});

render();
