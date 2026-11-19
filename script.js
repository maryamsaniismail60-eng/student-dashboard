
const $ = (selector) => document.querySelector(selector);

// THEME
const themeToggle = $("#themeToggle");
const themeIcon = $("#themeIcon");
const themeLabel = $("#themeLabel");

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark", isDark);
    themeIcon.textContent = isDark ? "☀" : "☾";
    themeLabel.textContent = isDark ? "Light mode" : "Dark mode";

    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    try {
        localStorage.setItem("studentTheme", theme);
    } catch {
        // The theme still works if browser storage is unavailable.
    }
}

let savedTheme = "light";

try {
    savedTheme = localStorage.getItem("studentTheme") || "light";
} catch {}

applyTheme(savedTheme === "dark" ? "dark" : "light");

themeToggle.addEventListener("click", () => {
    applyTheme(
        document.body.classList.contains("dark") ? "light" : "dark"
    );
});

// TODAY'S DATE
$("#todayDate").textContent = new Date().toLocaleDateString(
    undefined,
    {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    }
);

// MOBILE SIDEBAR
const sidebar = $("#sidebar");

$("#menuToggle").addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");
        sidebar.classList.remove("open");
    });
});

// ASSIGNMENTS
const defaultAssignments = [
    {
        id: "a1",
        title: "HTML & CSS Practice",
        course: "Computer Science",
        due: "Tomorrow",
        completed: false
    },
    {
        id: "a2",
        title: "Mathematics Exercises",
        course: "Mathematics",
        due: "In 2 days",
        completed: false
    },
    {
        id: "a3",
        title: "Communication Essay",
        course: "General Studies",
        due: "Friday",
        completed: true
    }
];

let assignments = [];

try {
    const stored = JSON.parse(localStorage.getItem("studentAssignments"));

    assignments = Array.isArray(stored)
        ? stored.filter(item =>
            item &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.completed === "boolean"
        )
        : defaultAssignments;
} catch {
    assignments = defaultAssignments;
}

function saveAssignments() {
    try {
        localStorage.setItem(
            "studentAssignments",
            JSON.stringify(assignments)
        );
    } catch {
        alert("Unable to save assignments in this browser.");
    }
}

function renderAssignments() {
    const list = $("#assignmentList");
    list.replaceChildren();

    assignments.forEach(assignment => {
        const row = document.createElement("article");
        row.className = "assignment-item";

        if (assignment.completed) {
            row.classList.add("done");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "assignment-check";
        checkbox.checked = assignment.completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark " + assignment.title + " complete"
        );

        checkbox.addEventListener("change", () => {
            assignment.completed = checkbox.checked;
            saveAssignments();
            renderAssignments();
        });

        const info = document.createElement("div");
        info.className = "assignment-info";

        const title = document.createElement("h3");
        title.textContent = assignment.title;

        const course = document.createElement("p");
        course.textContent =
            assignment.course + " · Due " + assignment.due;

        info.append(title, course);

        const status = document.createElement("span");
        status.className = "assignment-status";
        status.textContent = assignment.completed ? "Done ✓" : "Pending";

        row.append(checkbox, info, status);
        list.appendChild(row);
    });

    updateAssignmentStats();
}

function updateAssignmentStats() {
    const completed = assignments.filter(item => item.completed).length;
    const pending = assignments.length - completed;

    $("#completedStat").textContent = completed;
    $("#pendingStat").textContent = pending;
}

$("#addAssignment").addEventListener("click", () => {
    const title = prompt("Enter the assignment title:");

    if (title === null) return;

    if (!title.trim()) {
        alert("Please enter an assignment title.");
        return;
    }

    const course = prompt("Enter the course name:") || "General Studies";
    const due = prompt("When is it due?") || "Not specified";

    assignments.push({
        id: createId(),
        title: title.trim(),
        course: course.trim() || "General Studies",
        due: due.trim() || "Not specified",
        completed: false
    });

    saveAssignments();
    renderAssignments();
});

function createId() {
    return window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : Date.now().toString(36) +
          Math.random().toString(36).slice(2);
}

// STUDY PROGRESS
let progress = 72;

function renderProgress() {
    const remaining = 100 - progress;

    $("#progressPercent").textContent = progress + "%";
    $("#progressLegend").textContent = progress + "%";
    $("#remainingPercent").textContent = remaining + "%";

    $("#progressCircle").style.background = `
        conic-gradient(
            var(--primary) 0% ${progress}%,
            var(--soft) ${progress}% 100%
        )
    `;

    $("#progressCircle").setAttribute(
        "aria-label",
        "Study progress " + progress + " percent"
    );
}

try {
    const storedProgress = Number(localStorage.getItem("studentProgress"));

    if (
        localStorage.getItem("studentProgress") !== null &&
        Number.isInteger(storedProgress) &&
        storedProgress >= 0 &&
        storedProgress <= 100
    ) {
        progress = storedProgress;
    }
} catch {}

renderProgress();

$("#updateProgress").addEventListener("click", () => {
    const input = prompt(
        "Enter your study progress from 0 to 100:",
        String(progress)
    );

    if (input === null) return;

    const value = input.trim();

    if (value === "" || !/^\d+$/.test(value)) {
        alert("Please enter a whole number from 0 to 100.");
        return;
    }

    const nextProgress = Number(value);

    if (nextProgress < 0 || nextProgress > 100) {
        alert("Progress must be between 0 and 100.");
        return;
    }

    progress = nextProgress;

    try {
        localStorage.setItem("studentProgress", String(progress));
    } catch {}

    renderProgress();
});

// QUICK NOTES
const notes = $("#quickNotes");
const notesStatus = $("#notesStatus");

try {
    notes.value = localStorage.getItem("studentQuickNotes") || "";
} catch {}

$("#saveNotes").addEventListener("click", () => {
    try {
        localStorage.setItem("studentQuickNotes", notes.value);
        notesStatus.textContent = "Saved successfully ✓";
    } catch {
        notesStatus.textContent = "Could not save. Check browser storage.";
    }
});

notes.addEventListener("input", () => {
    notesStatus.textContent = "Unsaved changes";
});

// INITIALIZE
renderAssignments();
