const screens = document.querySelectorAll(".screen");
const bottomNav = document.querySelector(".bottom-nav");
const navButtons = document.querySelectorAll(".nav-button");
const screenButtons = document.querySelectorAll("[data-screen-target]");
const loginButtons = document.querySelectorAll("[data-login-role]");
const logoutButtons = document.querySelectorAll("[data-logout], #logout-button");
const routineGrid = document.querySelector("#routine-grid");
const emotionGrid = document.querySelector("#emotion-grid");
const emotionResponse = document.querySelector("#emotion-response");
const calmLink = document.querySelector("#calm-link");
const latestResponse = document.querySelector("#latest-response");
const notificationLatestResponse = document.querySelector("#notification-latest-response");
const teacherAlerts = document.querySelectorAll(".teacher-alert");
const teacherNotificationTitle = document.querySelector("#teacher-notification-title");
const teacherNotificationDetail = document.querySelector("#teacher-notification-detail");
const notificationTitleText = document.querySelector("#notification-title-text");
const notificationDetailText = document.querySelector("#notification-detail-text");
const notificationBadge = document.querySelector("#notification-badge");
const notificationSeenStatus = document.querySelector("#notification-seen-status");
const notificationHistoryList = document.querySelector("#notification-history-list");
const markSeenButton = document.querySelector("#mark-seen-button");
const scheduleUnderstandButton = document.querySelector("#schedule-understand-button");
const scheduleConfusedButton = document.querySelector("#schedule-confused-button");
const supportFeedback = document.querySelector("#support-feedback");
const modeBadge = document.querySelector("#mode-badge");
const progressFill = document.querySelector("#progress-fill");
const routineProgressLabel = document.querySelector("#routine-progress-label");
const currentActivityLabel = document.querySelector("#current-activity-label");
const dashboardCurrentActivity = document.querySelector("#dashboard-current-activity");
const dashboardLatestFeeling = document.querySelector("#dashboard-latest-feeling");
const dashboardHelpStatus = document.querySelector("#dashboard-help-status");

const defaultRoutines = [
  { label: "Arrive", icon: "🎒" },
  { label: "Learning", icon: "📚" },
  { label: "Meal", icon: "🍽️" },
  { label: "Therapy", icon: "🧩" },
  { label: "Social Play", icon: "🧸" },
  { label: "Go Home", icon: "🏠" },
];

const changedRoutines = [
  defaultRoutines[0],
  defaultRoutines[1],
  defaultRoutines[3],
  defaultRoutines[2],
  defaultRoutines[4],
  defaultRoutines[5],
];

const emotions = [
  { label: "Happy", icon: "😊" },
  { label: "Sad", icon: "😢" },
  { label: "Confused", icon: "😕" },
  { label: "Angry", icon: "😠" },
  { label: "Tired", icon: "😴" },
  { label: "I Need Help", icon: "🤝" },
  { label: "I Need a Break", icon: "🌿" },
];

const roleHomeScreen = {
  student: "home",
  teacher: "teacher",
};

const roleAllowedScreens = {
  student: new Set(["home", "routine", "feelings", "help", "change"]),
  teacher: new Set(["teacher", "notification"]),
};

const demoStudentResponse = "Amir selected: I Need Help";
const demoTeacherNotifications = [
  {
    title: "Help request",
    detail: "Amir asked for teacher / caregiver support from Calm Support.",
    type: "help",
    seen: false,
    time: "10:05 AM",
  },
  {
    title: "Feeling selected",
    detail: "Hakim selected: Tired.",
    type: "feeling",
    seen: true,
    time: "9:42 AM",
  },
  {
    title: "Feeling selected",
    detail: "Siti selected: Happy.",
    type: "feeling",
    seen: true,
    time: "9:50 AM",
  },
];

let currentRole = "";
let currentRoutineIndex = 0;
let selectedEmotion = getStoredEmotion();
let latestStudentResponse = getStoredStudentResponse();
let notificationHistory = getStoredNotificationHistory();
let latestTeacherNotification = getStoredNotification() || notificationHistory[0] || null;
let helpRequestActive = getStoredHelpRequest();
let scheduleChangePending = false;
let routineChangedToday = false;

if (latestTeacherNotification && !notificationHistory.length) {
  notificationHistory = [latestTeacherNotification];
}

if (!latestStudentResponse && !selectedEmotion) {
  latestStudentResponse = demoStudentResponse;
}

if (!latestTeacherNotification && !notificationHistory.length) {
  notificationHistory = demoTeacherNotifications.map((notification) => ({ ...notification }));
  latestTeacherNotification = notificationHistory[0];
  helpRequestActive = true;
}

try {
  window.localStorage.removeItem("scheduleChangePending");
  window.localStorage.removeItem("routineChangedToday");
} catch {
  // Old schedule-change demo state can be ignored if storage is unavailable.
}

function getStoredEmotion() {
  try {
    return window.localStorage.getItem("latestEmotion") || "";
  } catch {
    return "";
  }
}

function saveStoredEmotion(emotion) {
  try {
    window.localStorage.setItem("latestEmotion", emotion);
  } catch {
    // Local storage can be blocked in some browser privacy modes.
  }
}

function getStoredStudentResponse() {
  try {
    return window.localStorage.getItem("latestStudentResponse") || "";
  } catch {
    return "";
  }
}

function saveStoredStudentResponse(response) {
  latestStudentResponse = response;

  try {
    window.localStorage.setItem("latestStudentResponse", response);
  } catch {
    // Local storage can be blocked in some browser privacy modes.
  }
}

function getStoredHelpRequest() {
  try {
    return window.localStorage.getItem("helpRequestActive") === "true";
  } catch {
    return false;
  }
}

function saveStoredHelpRequest(isActive) {
  helpRequestActive = isActive;

  try {
    window.localStorage.setItem("helpRequestActive", String(isActive));
  } catch {
    // Local storage can be blocked in some browser privacy modes.
  }
}

function getStoredNotification() {
  try {
    const savedNotification = window.localStorage.getItem("teacherNotification");
    const notification = savedNotification ? JSON.parse(savedNotification) : null;

    if (notification && typeof notification.seen !== "boolean") {
      notification.seen = false;
    }

    return notification;
  } catch {
    return null;
  }
}

function saveStoredNotification(notification) {
  try {
    window.localStorage.setItem("teacherNotification", JSON.stringify(notification));
  } catch {
    // Notification still updates on screen even if storage is unavailable.
  }
}

function getStoredNotificationHistory() {
  try {
    const savedHistory = window.localStorage.getItem("teacherNotificationHistory");
    const history = savedHistory ? JSON.parse(savedHistory) : [];

    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveStoredNotificationHistory(history) {
  try {
    window.localStorage.setItem("teacherNotificationHistory", JSON.stringify(history));
  } catch {
    // Notification history still updates on screen even if storage is unavailable.
  }
}

function getStoredScheduleChangePending() {
  try {
    return window.localStorage.getItem("scheduleChangePending") === "true";
  } catch {
    return false;
  }
}

function saveStoredScheduleChangePending(isPending) {
  scheduleChangePending = isPending;

  try {
    window.localStorage.setItem("scheduleChangePending", String(isPending));
  } catch {
    // Visible prototype state still updates if storage is unavailable.
  }
}

function getStoredRoutineChangedToday() {
  try {
    return window.localStorage.getItem("routineChangedToday") === "true";
  } catch {
    return false;
  }
}

function saveStoredRoutineChangedToday(isChanged) {
  routineChangedToday = isChanged;

  try {
    window.localStorage.setItem("routineChangedToday", String(isChanged));
  } catch {
    // Visible prototype state still updates if storage is unavailable.
  }
}

function getActiveRoutines() {
  return routineChangedToday ? changedRoutines : defaultRoutines;
}

function getNotificationTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function notifyTeacher(title, detail, type = "general") {
  latestTeacherNotification = {
    title,
    detail,
    type,
    seen: false,
    time: getNotificationTime(),
  };

  notificationHistory = [latestTeacherNotification, ...notificationHistory].slice(0, 5);
  saveStoredNotification(latestTeacherNotification);
  saveStoredNotificationHistory(notificationHistory);
  updateTeacherDashboard();
}

function updateRoleUI() {
  const isLoggedIn = Boolean(currentRole);

  modeBadge.textContent =
    currentRole === "teacher" ? "Teacher Mode" : currentRole === "student" ? "Student Mode" : "Choose Account";
  document.body.dataset.mode = currentRole || "login";
  bottomNav.classList.toggle("hidden", !isLoggedIn);

  logoutButtons.forEach((button) => {
    button.classList.toggle("hidden", !isLoggedIn);
  });

  navButtons.forEach((button) => {
    const navRole = button.dataset.roleNav;
    button.classList.toggle("hidden", Boolean(navRole && navRole !== currentRole));
  });
}

function loginAs(role) {
  currentRole = role;
  updateRoleUI();
  showScreen(roleHomeScreen[role]);
}

function logout() {
  currentRole = "";
  updateRoleUI();
  showScreen("login");
}

// Switches between app screens while keeping the bottom navigation in sync.
function showScreen(screenId) {
  if (!currentRole && screenId !== "login") {
    screenId = "login";
  }

  if (currentRole && !roleAllowedScreens[currentRole].has(screenId)) {
    screenId = roleHomeScreen[currentRole];
  }

  const activeNavTarget = screenId === "change" ? "routine" : screenId;

  screens.forEach((screen) => {
    screen.classList.toggle("active-screen", screen.id === screenId);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active-nav", button.dataset.screenTarget === activeNavTarget);
  });

  updateRoleUI();

  if (screenId === "teacher" || screenId === "notification") {
    updateTeacherDashboard();
  }
}

function updateRoutineProgress() {
  const activeRoutines = getActiveRoutines();
  const currentRoutine = activeRoutines[currentRoutineIndex];
  const completedCount = currentRoutineIndex + 1;
  const progressPercent = (completedCount / activeRoutines.length) * 100;

  routineProgressLabel.textContent = `Activity ${completedCount} of ${activeRoutines.length}`;
  currentActivityLabel.textContent = `Now: ${currentRoutine.label}`;
  progressFill.style.width = `${progressPercent}%`;
  updateTeacherDashboard();
}

// Rebuilds routine cards so the current activity highlight always stays clear.
function renderRoutine() {
  const activeRoutines = getActiveRoutines();

  routineGrid.innerHTML = "";

  activeRoutines.forEach((routine, index) => {
    const card = document.createElement("article");
    card.className = "routine-card";

    if (index === currentRoutineIndex) {
      card.classList.add("current");
    }

    if (index < currentRoutineIndex) {
      card.classList.add("done");
    }

    const status = index === currentRoutineIndex ? "Now" : index < currentRoutineIndex ? "Done" : "Next";

    card.innerHTML = `
      <span class="routine-icon" aria-hidden="true">${routine.icon}</span>
      <strong>${routine.label}</strong>
      <span class="routine-status">${status}</span>
    `;

    routineGrid.appendChild(card);
  });

  updateRoutineProgress();
}

// Rebuilds emotion cards after each selection.
function renderEmotions() {
  emotionGrid.innerHTML = "";

  emotions.forEach((emotion) => {
    const card = document.createElement("button");
    card.className = "emotion-card";
    card.type = "button";
    card.dataset.emotion = emotion.label;

    if (emotion.label === selectedEmotion) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <span class="emotion-icon" aria-hidden="true">${emotion.icon}</span>
      <strong>${emotion.label}</strong>
    `;

    emotionGrid.appendChild(card);
  });
}

function isCalmSupportEmotion(emotion) {
  return emotion === "I Need Help" || emotion === "I Need a Break";
}

function updateEmotionPanel() {
  if (!selectedEmotion) {
    emotionResponse.textContent = "No emotion selected yet.";
    calmLink.classList.add("hidden");
    return;
  }

  emotionResponse.textContent = `You selected: ${selectedEmotion}. Teacher has been notified.`;
  calmLink.classList.toggle("hidden", !isCalmSupportEmotion(selectedEmotion));
}

// Saves the latest student response locally for the teacher dashboard prototype.
function selectEmotion(emotion) {
  selectedEmotion = emotion;
  saveStoredEmotion(emotion);
  saveStoredStudentResponse(`Amir selected: ${emotion}`);
  notifyTeacher("Feeling selected", `Amir selected: ${emotion}.`, "feeling");

  updateEmotionPanel();
  renderEmotions();
}

function updateTeacherDashboard() {
  const activeRoutines = getActiveRoutines();
  const currentRoutine = activeRoutines[currentRoutineIndex];
  const responseText = latestStudentResponse || (selectedEmotion ? `Amir selected: ${selectedEmotion}` : "No response yet.");
  const dashboardFeeling = selectedEmotion || (responseText === demoStudentResponse ? "I Need Help" : "None");
  const unseenCount = notificationHistory.filter((notification) => !notification.seen).length;
  const hasUnseenNotification = unseenCount > 0;

  dashboardCurrentActivity.textContent = currentRoutine.label;
  dashboardLatestFeeling.textContent = dashboardFeeling;
  dashboardHelpStatus.textContent = helpRequestActive
    ? latestTeacherNotification?.type === "help" && latestTeacherNotification.seen
      ? "Seen"
      : "Yes"
    : "No";

  latestResponse.textContent = responseText;
  notificationLatestResponse.textContent = responseText;
  notificationBadge.textContent = hasUnseenNotification ? String(unseenCount) : "0";
  notificationBadge.classList.toggle("hidden", !hasUnseenNotification);
  renderNotificationHistory();

  if (latestTeacherNotification) {
    teacherAlerts.forEach((alert) => alert.classList.toggle("active-alert", hasUnseenNotification));
    teacherNotificationTitle.textContent = latestTeacherNotification.title;
    teacherNotificationDetail.textContent = `${latestTeacherNotification.detail} Time: ${latestTeacherNotification.time}`;
    notificationTitleText.textContent = latestTeacherNotification.title;
    notificationDetailText.textContent = `${latestTeacherNotification.detail} Time: ${latestTeacherNotification.time}`;
    notificationSeenStatus.textContent = hasUnseenNotification
      ? `${unseenCount} new alert${unseenCount === 1 ? "" : "s"} waiting.`
      : "Teacher has seen this.";
    markSeenButton.disabled = !hasUnseenNotification;
    return;
  }

  teacherAlerts.forEach((alert) => alert.classList.remove("active-alert"));
  teacherNotificationTitle.textContent = "No new notification.";
  teacherNotificationDetail.textContent = "Student alerts will appear here.";
  notificationTitleText.textContent = "No new notification.";
  notificationDetailText.textContent = "Student alerts will appear here.";
  notificationSeenStatus.textContent = "Waiting for student action.";
  markSeenButton.disabled = true;
}

function renderNotificationHistory() {
  notificationHistoryList.innerHTML = "";

  if (!notificationHistory.length) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-history";
    emptyMessage.textContent = "No notifications yet.";
    notificationHistoryList.appendChild(emptyMessage);
    return;
  }

  notificationHistory.forEach((notification) => {
    const item = document.createElement("div");
    item.className = `history-item ${notification.seen ? "seen" : "new"}`;

    const title = document.createElement("strong");
    title.textContent = notification.title;

    const detail = document.createElement("span");
    detail.textContent = notification.detail;

    const time = document.createElement("small");
    time.textContent = `${notification.time} - ${notification.seen ? "Seen" : "New"}`;

    item.append(title, detail, time);
    notificationHistoryList.appendChild(item);
  });
}

// Shows simple prototype feedback for calm support choices.
function showSupportMessage(type) {
  if (type !== "teacher") {
    return;
  }

  saveStoredHelpRequest(true);
  saveStoredStudentResponse("Amir asked for teacher / caregiver support");
  notifyTeacher("Help request", "Amir asked for teacher / caregiver support from Calm Support.", "help");
  supportFeedback.textContent = "Teacher / caregiver has been notified. Please wait here.";
}

function markNotificationSeen() {
  if (!latestTeacherNotification) {
    return;
  }

  latestTeacherNotification.seen = true;
  notificationHistory = notificationHistory.map((notification) => ({
    ...notification,
    seen: true,
  }));
  saveStoredNotification(latestTeacherNotification);
  saveStoredNotificationHistory(notificationHistory);
  updateTeacherDashboard();
}

function handleScheduleUnderstood() {
  saveStoredScheduleChangePending(false);
  saveStoredStudentResponse("Amir understood the schedule change");
  notifyTeacher(
    "Schedule change understood",
    "Amir tapped I Understand for Therapy before Meal.",
    "schedule-understood"
  );
  showScreen("routine");
}

function handleScheduleConfused() {
  saveStoredScheduleChangePending(false);
  selectedEmotion = "Confused";
  saveStoredEmotion(selectedEmotion);
  saveStoredStudentResponse("Amir feels confused about the schedule change");
  notifyTeacher(
    "Schedule change response",
    "Amir feels confused about the schedule change.",
    "schedule-confused"
  );
  updateEmotionPanel();
  renderEmotions();
  showScreen("feelings");
}

loginButtons.forEach((button) => {
  button.addEventListener("click", () => loginAs(button.dataset.loginRole));
});

logoutButtons.forEach((button) => {
  button.addEventListener("click", logout);
});

screenButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.screenTarget));
});

document.querySelector("#next-activity").addEventListener("click", () => {
  currentRoutineIndex = (currentRoutineIndex + 1) % getActiveRoutines().length;
  renderRoutine();
});

markSeenButton.addEventListener("click", markNotificationSeen);
scheduleUnderstandButton.addEventListener("click", handleScheduleUnderstood);
scheduleConfusedButton.addEventListener("click", handleScheduleConfused);

emotionGrid.addEventListener("click", (event) => {
  const emotionCard = event.target.closest("[data-emotion]");

  if (emotionCard) {
    selectEmotion(emotionCard.dataset.emotion);
  }
});

document.querySelectorAll("[data-support]").forEach((button) => {
  button.addEventListener("click", () => showSupportMessage(button.dataset.support));
});

renderRoutine();
renderEmotions();
updateEmotionPanel();
updateTeacherDashboard();
updateRoleUI();
showScreen("login");
