const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
const app = $("#app");
const folders = [["Inbox", "INBOX", "inbox"], ["Starred", "STARRED", "star"], ["Important", "IMPORTANT", "tag"], ["Sent", "SENT", "send"], ["Drafts", "DRAFT", "draft"], ["All mail", null, "mail"], ["Spam", "SPAM", "report"], ["Trash", "TRASH", "trash"]];
const categories = [["all", "All inbox"], ["primary", "Primary"], ["promotions", "Promotions"], ["social", "Social"], ["updates", "Updates"], ["forums", "Forums"]];
const state = { account: null, summary: null, messages: [], folder: "Inbox", category: "all", query: "", tokens: [null], page: 0, next: null, loading: false, error: "", currentId: null, request: 0, detailRequest: 0, controller: null };
let toastTimer;
const selected = new Set();

function renderSelection() {
  const count = selected.size;
  $("#selectAll").checked = state.messages.length > 0 && count === state.messages.length;
  $("#selectAll").indeterminate = count > 0 && count < state.messages.length;
  $("#selectAll").disabled = state.loading || !state.messages.length;
  $("#selectionCount").textContent = count ? `${count} selected` : "";
  $("[data-more='mark-read'] span").textContent = count ? "Mark selected as read" : "Mark all as read";
  $("[data-more='mark-read']").disabled = state.loading || Boolean(state.markingRead);
  $$(".message-row").forEach(row => {
    const checked = selected.has(row.dataset.id);
    row.classList.toggle("selected", checked);
    row.querySelector("input").checked = checked;
  });
  $$("[data-more='copy'], [data-more='clear']").forEach(button => { button.disabled = !count; });
}

function toggleMailboxMenu(buttonId, menuId) {
  const button = $(buttonId), menu = $(menuId), wasOpen = menu.classList.contains("open");
  closeFloating();
  if (wasOpen) return;
  const rect = button.getBoundingClientRect();
  menu.style.top = `${rect.bottom + 4}px`;
  menu.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - 250))}px`;
  menu.classList.add("open"); button.setAttribute("aria-expanded", "true");
  menu.querySelector("button:not(:disabled)")?.focus();
}

async function api(path, options = {}) {
  const response = await fetch(path, { cache: "no-store", ...options });
  const result = await response.json();
  if (!response.ok) throw Object.assign(new Error(result.error || "Request failed. Please try again."), { authRequired: result.authRequired });
  return result;
}
function showToast(message) {
  clearTimeout(toastTimer); $("#toastText").textContent = message; $("#toast").classList.add("open");
  toastTimer = setTimeout(() => $("#toast").classList.remove("open"), 6000);
}
function connectionNotice(message) {
  $("#accountStatus").textContent = message;
}
function renderNav() {
  const labels = state.summary?.labels || [];
  $("#folderNav").innerHTML = folders.map(([name, id, glyph]) => {
    const label = labels.find(item => item.id === id);
    const count = name === "Inbox" ? label?.messagesUnread : label?.messagesTotal;
    return `<button class="nav-item ${state.folder === name && !state.query ? "active" : ""}" data-folder="${name}">${icon(glyph)}<span>${name}</span><span class="count">${count == null ? "" : count.toLocaleString()}</span></button>`;
  }).join("");
  $("#labelNav").innerHTML = labels.filter(label => label.type === "user").map(label => `<button class="nav-item ${state.folder === `label:${label.id}` ? "active" : ""}" data-folder="label:${escapeHtml(label.id)}" title="${escapeHtml(label.name)}">${icon("tag")}<span>${escapeHtml(label.name)}</span><span class="count">${label.messagesUnread ?? ""}</span></button>`).join("");
  $$("[data-folder]").forEach(button => button.addEventListener("click", () => {
    state.folder = button.dataset.folder; state.query = ""; $("#searchInput").value = "";
    closeMessage(); closeMobileMenu(); loadMessages(true);
  }));
  const unread = labels.find(label => label.id === "INBOX")?.messagesUnread;
  document.title = unread == null ? "Not Gmail" : `Inbox (${unread}) - Not Gmail`;
  $(".mail-footer").innerHTML = `<span>${state.summary ? `${state.summary.messagesTotal.toLocaleString()} messages in your Gmail account` : ""}</span><a href="/privacy">Privacy</a><a href="https://mail.google.com/" target="_blank" rel="noopener noreferrer">Manage mailbox in Gmail</a>`;
}
function renderCategories() {
  $("#categoryTabs").style.display = state.folder === "Inbox" && !state.query ? "flex" : "none";
  $("#categoryTabs").innerHTML = categories.map(([id, name]) => `<button class="category-tab ${state.category === id ? "active" : ""}" data-category="${id}"><strong>${name}</strong></button>`).join("");
  $$("[data-category]").forEach(button => button.addEventListener("click", () => { state.category = button.dataset.category; loadMessages(true); }));
}
function displayDate(timestamp, full = false) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return full ? date.toLocaleString() : date.toDateString() === new Date().toDateString() ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : date.toLocaleDateString([], { month: "short", day: "numeric", ...(date.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}) });
}
function decodeSnippet(snippet) { const element = document.createElement("textarea"); element.innerHTML = snippet; return element.value; }
function renderMessages() {
  $("#messageList").innerHTML = state.messages.map(message => `<div class="message-row real-message-row ${message.unread ? "unread" : ""}" data-id="${escapeHtml(message.id)}" role="button" tabindex="0">
    <label class="row-check"><input type="checkbox" aria-label="Select ${escapeHtml(message.subject)}"></label>
    <span class="star-button ${message.starred ? "starred" : ""}" aria-label="${message.starred ? "Starred" : "Not starred"}">${icon("star")}</span>
    <span class="sender">${escapeHtml(state.folder === "Sent" || state.folder === "Drafts" ? message.to : message.sender)}</span>
    <span class="message-summary"><span class="subject-line">${escapeHtml(message.subject)}</span><span class="snippet">${escapeHtml(decodeSnippet(message.snippet))}</span></span>
    <span class="date">${escapeHtml(displayDate(message.timestamp))}</span></div>`).join("");
  $$(".message-row").forEach(row => {
    row.addEventListener("click", event => { if (!event.target.closest("label,input")) openMessage(row.dataset.id); });
    row.addEventListener("keydown", event => { if (event.key === "Enter" && event.target === row) openMessage(row.dataset.id); });
    row.querySelector("input").addEventListener("change", event => {
      event.target.checked ? selected.add(row.dataset.id) : selected.delete(row.dataset.id); renderSelection();
    });
  });
  $("#messageList").style.display = state.messages.length ? "block" : "none";
  const empty = $("#emptyState"); empty.style.display = state.messages.length ? "none" : "flex"; empty.setAttribute("role", "status");
  const headline = state.loading ? "Loading your Gmail…" : state.error || (!state.account?.connected ? "Connect Gmail to see your messages" : !state.account.canRead ? "Reconnect Gmail to allow reading your mailbox" : "No messages in this view");
  empty.innerHTML = `<h2>${escapeHtml(headline)}</h2>${!state.account?.connected || !state.account.canRead ? '<a class="outline-button" href="/connect">Connect Gmail</a>' : state.error ? '<button class="outline-button" id="retryMailbox">Try again</button>' : ""}`;
  $("#retryMailbox")?.addEventListener("click", () => loadMailbox());
  const total = state.viewTotal;
  const start = state.page * 25 + 1, end = state.page * 25 + state.messages.length;
  $("#rangeButton").textContent = state.loading ? "Loading…" : state.messages.length ? `${start}–${end}${total != null ? ` of ${total.toLocaleString()}` : state.next ? " · more available" : ""}` : "";
  $("#prevPage").disabled = state.loading || state.page === 0; $("#nextPage").disabled = state.loading || !state.next; $("#refreshButton").disabled = state.loading;
  renderSelection();
}
async function loadMessages(reset = false) {
  selected.clear();
  $$("#selectPopover, #morePopover").forEach(menu => menu.classList.remove("open"));
  $$("#selectMenuButton, #moreButton").forEach(button => button.setAttribute("aria-expanded", "false"));
  if (reset) { state.page = 0; state.tokens = [null]; }
  state.controller?.abort(); const controller = new AbortController(); state.controller = controller;
  const request = ++state.request;
  state.messages = []; state.next = null; state.viewTotal = null; state.error = ""; state.loading = Boolean(state.account?.canRead);
  renderNav(); renderCategories(); renderMessages();
  if (!state.account?.canRead) return;
  const query = new URLSearchParams({ folder: state.folder, category: state.category, q: state.query });
  if (state.tokens[state.page]) query.set("pageToken", state.tokens[state.page]);
  try {
    const result = await api(`/api/gmail/messages?${query}`, { signal: controller.signal });
    if (request !== state.request) return;
    state.messages = result.messages; state.next = result.nextPageToken; state.viewTotal = result.total;
    const label = state.summary?.labels.find(label => label.id === result.label?.id);
    if (label) Object.assign(label, result.label);
    renderNav();
  } catch (error) {
    if (request !== state.request) return;
    state.error = error.message;
    if (error.authRequired) { state.account.canRead = false; connectionNotice(error.message); }
  } finally { if (request === state.request) { state.loading = false; renderMessages(); } }
}
async function loadMailbox() {
  selected.clear();
  state.controller?.abort(); state.request++;
  state.summary = null; state.error = ""; state.messages = []; state.loading = true; renderNav(); renderMessages();
  try { state.summary = await api("/api/gmail/mailbox"); await loadMessages(true); }
  catch (error) {
    state.loading = false; state.error = error.message;
    if (error.authRequired) { state.account.canRead = false; connectionNotice(error.message); }
    renderNav(); renderMessages();
  }
}
async function openMessage(id) {
  const request = ++state.detailRequest; state.currentId = id;
  $("#listView").style.display = "none"; $("#messageView").classList.add("open"); $("#messageContent").textContent = "Loading message…";
  try {
    const message = await api(`/api/gmail/messages/${encodeURIComponent(id)}`);
    if (request !== state.detailRequest || id !== state.currentId) return;
    const gmailUrl = `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(state.account.email)}#all/${encodeURIComponent(message.threadId)}`;
    $("#messageContent").innerHTML = `<div class="message-inner"><div class="message-subject"><h1>${escapeHtml(message.subject)}</h1></div>
      <div class="message-sender"><div class="sender-avatar">${escapeHtml((message.sender || "?").slice(0, 1).toUpperCase())}</div><div class="sender-meta"><strong>${escapeHtml(message.sender)}</strong> <span>&lt;${escapeHtml(message.email)}&gt;</span><br><span>To: ${escapeHtml(message.to)}</span>${message.cc ? `<br><span>Cc: ${escapeHtml(message.cc)}</span>` : ""}</div><div class="message-date">${escapeHtml(displayDate(message.timestamp, true))}</div></div>
      <div class="message-body real-message-body" id="realBody"></div>
      <div class="real-attachments">${message.attachments.map(part => `<a href="/api/gmail/messages/${encodeURIComponent(id)}?part=${encodeURIComponent(part.partId)}" download>${icon("attach")}<span>${escapeHtml(part.filename)} (${part.size.toLocaleString()} bytes)</span></a>`).join("")}</div>
      <div class="reply-actions"><button id="replyButton">${icon("reply")}Reply</button><button id="forwardButton">${icon("forward")}Forward</button><a href="${escapeHtml(gmailUrl)}" target="_blank" rel="noopener noreferrer">${icon("external")}Open in Gmail</a></div>
      <p class="public-note">Reading here leaves your Gmail read/unread status unchanged. Use Gmail to organize messages.</p></div>`;
    if (message.html) {
      const frame = document.createElement("iframe"); frame.setAttribute("sandbox", ""); frame.setAttribute("referrerpolicy", "no-referrer"); frame.title = "Email content";
      frame.srcdoc = `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><style>body{font:14px Arial,sans-serif;overflow-wrap:anywhere}img{max-width:100%}</style></head><body>${message.html}</body></html>`;
      $("#realBody").append(frame);
    } else { $("#realBody").textContent = message.text || "This message has no text body."; }
    $("#replyButton").addEventListener("click", () => {
      const replyAddress = message.replyTo.match(/<([^>]+)>/)?.[1] || message.replyTo || message.email;
      openCompose(replyAddress, `Re: ${message.subject}`);
    });
    $("#forwardButton").addEventListener("click", () => {
      const template = document.createElement("template"); template.innerHTML = message.html;
      openCompose("", `Fwd: ${message.subject}`, `\n\n---------- Forwarded message ----------\nFrom: ${message.sender} <${message.email}>\nTo: ${message.to}\nDate: ${displayDate(message.timestamp, true)}\n\n${message.text || template.content.textContent}`);
    });
  } catch (error) { if (request === state.detailRequest) $("#messageContent").textContent = error.message; if (error.authRequired) connectionNotice(error.message); }
}
function closeMessage() { state.currentId = null; state.detailRequest++; $("#messageView").classList.remove("open"); $("#listView").style.display = "flex"; }
function closeMobileMenu() { app.classList.remove("mobile-menu-open"); $("#modalBackdrop").classList.remove("open"); }
function closeFloating() {
  $$(".popover.open,.account-popover.open,.apps-popover.open,.advanced-search.open").forEach(element => element.classList.remove("open"));
  $$("#moreButton, #selectMenuButton").forEach(button => button.setAttribute("aria-expanded", "false"));
}
function openCompose(to = "", subject = "", body = "") {
  if (arguments.length === 0 && !Object.values(draft()).some(Boolean)) {
    try {
      const saved = JSON.parse(sessionStorage.getItem("not-gmail-draft") || "null");
      if (saved) {
        to = typeof saved.to === "string" ? saved.to : "";
        subject = typeof saved.subject === "string" ? saved.subject : "";
        body = typeof saved.body === "string" ? saved.body : "";
      }
    } catch { sessionStorage.removeItem("not-gmail-draft"); }
  }
  $("#composeWindow").classList.add("open"); $("#composeWindow").classList.remove("minimized");
  if (to || subject || body) { $("#composeTo").value = to; $("#composeSubject").value = subject; $("#composeBody").innerText = body; }
  $("#composeTo").focus();
}
function draft() { return { to: $("#composeTo").value.trim(), subject: $("#composeSubject").value.trim(), body: $("#composeBody").innerText }; }
function clearCompose() { $("#composeWindow").classList.remove("open", "minimized", "maximized"); $("#composeTo").value = ""; $("#composeSubject").value = ""; $("#composeBody").innerText = ""; sessionStorage.removeItem("not-gmail-draft"); }
function saveLocalDraft() { sessionStorage.setItem("not-gmail-draft", JSON.stringify(draft())); }
async function markAsRead() {
  if (state.markingRead) return;
  if (!state.account?.canModify) {
    const content = draft(); if (Object.values(content).some(Boolean)) saveLocalDraft();
    location.href = "/connect?permission=modify";
    return;
  }
  const input = selected.size ? { ids: [...selected] } : { folder: state.folder, category: state.category, q: state.query };
  state.markingRead = true; renderSelection();
  let processed = 0;
  try {
    let more;
    do {
      showToast(processed ? `${processed} messages marked as read. Continuing…` : "Marking messages as read…");
      const result = await api("/api/gmail/mark-read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      processed += result.processed; more = result.hasMore;
    } while (more);
    showToast(processed ? `${processed} messages marked as read in Gmail.` : "No unread messages in this view.");
  } catch (error) {
    showToast(`${processed ? `${processed} messages were marked as read before the request stopped. ` : ""}${error.message}`);
    if (error.authRequired) { state.account.canModify = false; connectionNotice(error.message); }
  } finally { state.markingRead = false; await loadMailbox(); }
}
async function sendMessage() {
  const content = draft(); if (!content.to) { showToast("Add a recipient email address."); return; }
  $("#sendButton").disabled = true; $("#sendButton").textContent = "Sending…";
  try {
    await api("/api/gmail/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
    clearCompose(); showToast("Message sent through Gmail."); await loadMailbox();
  } catch (error) { showToast(error.message); if (error.authRequired) { saveLocalDraft(); connectionNotice("Reconnect Gmail to send your saved draft."); } }
  finally { $("#sendButton").disabled = false; $("#sendButton").innerHTML = `${icon("send")}<span>Send</span>`; }
}
async function initialize() {
  connectionNotice("Checking your Gmail connection…"); state.loading = true; renderNav(); renderCategories(); renderMessages();
  try {
    state.account = await api("/api/auth/status"); const { connected, canRead, email } = state.account;
    $("#accountEmail").textContent = email || "No account connected"; $("#accountName").textContent = connected ? email : "Not Gmail";
    $$("#profileButton, #accountPopover .avatar").forEach(element => { element.textContent = email ? email.slice(0, 1).toUpperCase() : "?"; element.setAttribute("aria-label", email || "Connect Gmail"); });
    $("#accountStatus").textContent = canRead ? "Gmail reading and sending connected" : connected ? "Reconnect to allow mailbox reading" : "Connect to read and send email";
    $("#connectGoogleButton").textContent = connected ? "Reconnect Gmail" : "Connect Gmail"; $("#signOutButton").style.display = connected ? "flex" : "none";
    connectionNotice(canRead ? `Connected to ${email}. Your messages and counts come from Gmail.` : connected ? "Allow Gmail reading access to load your real mailbox." : "Connect Gmail to read and send your email.");
    if (canRead) await loadMailbox(); else { state.loading = false; renderMessages(); }
  } catch (error) { state.loading = false; state.error = error.message; renderMessages(); }
  const result = new URLSearchParams(location.search).get("gmail");
  if (result) {
    const statuses = { connected: "Gmail connected.", denied: "Google authorization was cancelled.", "missing-permission": "Reconnect and allow Gmail message management.", "invalid-state": "Sign-in expired. Please try again.", "token-error": "Google sign-in failed. Please try again.", "not-configured": "The site owner needs to configure Gmail." };
    showToast(statuses[result] || "Google connection updated."); history.replaceState({}, "", location.pathname);
  }
}

// Reading permission cannot change Gmail. Expose only implemented controls.
$$(".bulk-tools, [data-message-action], #newLabelButton, .storage, #geminiButton, #appsButton, #workspaceRail, #attachButton, #formatButton, .recipient-row button, #undoButton").forEach(element => { element.hidden = true; });
$("#selectAll").addEventListener("change", event => {
  selected.clear(); if (event.target.checked) state.messages.forEach(message => selected.add(message.id)); renderSelection();
});
$("#selectMenuButton").addEventListener("click", () => toggleMailboxMenu("#selectMenuButton", "#selectPopover"));
$("#moreButton").addEventListener("click", () => toggleMailboxMenu("#moreButton", "#morePopover"));
$$("[data-select]").forEach(button => button.addEventListener("click", () => {
  const type = button.dataset.select; selected.clear();
  state.messages.filter(message => type === "all" || type === "read" && !message.unread || type === "unread" && message.unread || type === "starred" && message.starred).forEach(message => selected.add(message.id));
  renderSelection(); closeFloating(); $("#selectMenuButton").focus();
}));
$$("[data-more]").forEach(button => button.addEventListener("click", async () => {
  const action = button.dataset.more;
  closeFloating(); $("#moreButton").focus();
  if (action === "mark-read") { await markAsRead(); return; }
  if (action === "clear") { selected.clear(); renderSelection(); }
  if (action === "copy") {
    const addresses = [...new Set(state.messages.filter(message => selected.has(message.id)).map(message => message.email))];
    try { await navigator.clipboard.writeText(addresses.join(", ")); showToast("Selected sender addresses copied."); }
    catch { showToast("Clipboard access was blocked by your browser."); }
  }
  if (action === "reset") state.account?.canRead ? loadMailbox() : initialize();
  if (action === "starred" || action === "unread") {
    state.query = `is:${action}`; $("#searchInput").value = state.query; loadMessages(true);
  }
}));
$("#readingPaneToggle").closest("section").hidden = true; $(".settings-panel > .outline-button").hidden = true;
$("#closeCompose").setAttribute("aria-label", "Save draft on this device and close");
$("#menuButton").addEventListener("click", () => { if (innerWidth <= 720) { app.classList.toggle("mobile-menu-open"); $("#modalBackdrop").classList.toggle("open"); } else app.classList.toggle("sidebar-collapsed"); });
$("#brandButton").addEventListener("click", () => { state.folder = "Inbox"; state.category = "all"; state.query = ""; $("#searchInput").value = ""; closeMessage(); loadMessages(true); });
$("#composeButton").addEventListener("click", () => openCompose());
$("#refreshButton").addEventListener("click", () => state.account?.canRead ? loadMailbox() : initialize());
$("#prevPage").addEventListener("click", () => { if (!state.loading && state.page > 0) { state.page--; loadMessages(); } });
$("#nextPage").addEventListener("click", () => { if (!state.loading && state.next) { state.tokens[state.page + 1] = state.next; state.page++; loadMessages(); } });
$("#searchForm").addEventListener("submit", event => { event.preventDefault(); state.query = $("#searchInput").value.trim(); closeMessage(); loadMessages(true); });
$("#searchInput").addEventListener("input", event => { if (!event.target.value && state.query) { state.query = ""; loadMessages(true); } });
$("#searchOptionsButton").addEventListener("click", event => { event.stopPropagation(); $("#advancedSearch").classList.toggle("open"); });
$("#advancedSearch").addEventListener("click", event => event.stopPropagation());
$("#applyAdvanced").addEventListener("click", () => {
  const quote = value => `"${value.replace(/["\\]/g, " ")}"`;
  state.query = [$("#searchInput").value.trim(), $("#searchFrom").value.trim() ? `from:${quote($("#searchFrom").value.trim())}` : "", $("#searchSubject").value.trim() ? `subject:${quote($("#searchSubject").value.trim())}` : "", $("#searchStarred").checked ? "is:starred" : ""].filter(Boolean).join(" ");
  $("#searchInput").value = state.query; $("#advancedSearch").classList.remove("open"); closeMessage(); loadMessages(true);
});
$("#clearAdvanced").addEventListener("click", () => { $("#searchFrom").value = ""; $("#searchSubject").value = ""; $("#searchStarred").checked = false; $("#searchInput").value = ""; state.query = ""; loadMessages(true); });
$("#backButton").addEventListener("click", closeMessage);
for (const [selector, direction] of [["#messagePrev", -1], ["#messageNext", 1]]) $(selector).addEventListener("click", () => { const next = state.messages[state.messages.findIndex(message => message.id === state.currentId) + direction]; if (next) openMessage(next.id); });
$("#closeCompose").addEventListener("click", () => { saveLocalDraft(); $("#composeWindow").classList.remove("open"); showToast("Draft saved on this device, not in Gmail. Click Compose to continue."); });
$("#discardButton").addEventListener("click", () => { clearCompose(); showToast("Local draft discarded."); });
$("#sendButton").addEventListener("click", sendMessage);
$("#minimizeCompose").addEventListener("click", event => { event.stopPropagation(); $("#composeWindow").classList.toggle("minimized"); });
$("#composeWindow > header").addEventListener("click", () => $("#composeWindow").classList.remove("minimized"));
$("#popoutCompose").addEventListener("click", event => { event.stopPropagation(); $("#composeWindow").classList.toggle("maximized"); });
$("#settingsButton").addEventListener("click", () => $("#settingsPanel").classList.toggle("open"));
$("#closeSettings").addEventListener("click", () => $("#settingsPanel").classList.remove("open"));
$$("input[name=density]").forEach(input => input.addEventListener("change", () => { document.body.classList.remove("density-comfortable", "density-compact"); if (input.value !== "default") document.body.classList.add(`density-${input.value}`); }));
$$("[data-theme]").forEach(button => button.addEventListener("click", () => { document.body.classList.remove("theme-soft", "theme-dark"); if (button.dataset.theme !== "light") document.body.classList.add(`theme-${button.dataset.theme}`); $$("[data-theme]").forEach(item => item.classList.toggle("active", item === button)); }));
$("#profileButton").addEventListener("click", event => { event.stopPropagation(); $("#accountPopover").classList.toggle("open"); });
for (const selector of ["#connectGoogleButton", "#switchGoogleButton"]) $(selector).addEventListener("click", () => { const content = draft(); if (content.to || content.subject || content.body) saveLocalDraft(); location.href = "/connect"; });
$("#signOutButton").addEventListener("click", async () => { try { await api("/api/auth/logout", { method: "POST" }); state.controller?.abort(); clearCompose(); location.replace("/"); } catch (error) { showToast(error.message); } });
$("#helpButton").addEventListener("click", () => { location.href = "/connect"; });
$("#closeToast").addEventListener("click", () => $("#toast").classList.remove("open"));
$("#modalBackdrop").addEventListener("click", closeMobileMenu);
document.addEventListener("click", event => { if (!event.target.closest(".popover,.account-popover,.advanced-search,#profileButton,#searchOptionsButton,#moreButton,#selectMenuButton")) closeFloating(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") { closeFloating(); closeMobileMenu(); $("#settingsPanel").classList.remove("open"); } });
window.addEventListener("pagehide", () => { $("#messageContent").replaceChildren(); state.messages = []; state.summary = null; });
window.addEventListener("pageshow", event => { if (event.persisted) location.reload(); });
initialize();
