console.log('[gkfs] fullscreen.js loaded');

// Adapted from chrome-google-keep-full-screen extension (src/content/script.js)
// See: https://github.com/chrisputnam9/chrome-google-keep-full-screen
// Chrome extension APIs are stubbed/removed for Electron compatibility.

// --- DEBUG: Trace global and window.main ---
console.log('[gkfs] typeof window:', typeof window);
console.log('[gkfs] typeof window.main:', typeof window.main);

// Force main.init() to run after DOMContentLoaded
if (typeof window !== 'undefined') {
    // DEBUG: Trace readyState
    console.log('[gkfs] document.readyState:', document.readyState);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => {
            console.log('[gkfs] Attempting to run main.init() (immediate)');
            if (window.main && typeof window.main.init === 'function') {
                window.main.init();
            } else {
                console.log('[gkfs] window.main or main.init not found (immediate)');
            }
        }, 0);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            console.log('[gkfs] DOMContentLoaded event fired');
            if (window.main && typeof window.main.init === 'function') {
                window.main.init();
            } else {
                console.log('[gkfs] window.main or main.init not found (DOMContentLoaded)');
            }
        });
    }
}

// Attach main to window so it is globally accessible
window.main = {
    SELECTOR_CREATED_NOTES_GROUP_CONTAINER:
        ".gkA7Yd-sKfxWe.ma6Yeb-r8s4j-gkA7Yd>div",
    SELECTOR_NOTE_CONTAINER: ".IZ65Hb-n0tgWb",
    SELECTOR_OPEN_NOTE_CONTAINER: "", // dynamic
    SELECTOR_OPEN_NOTE: "", // dynamic
    SELECTOR_OPEN_NOTE_TOOLBAR: "", // dynamic
    SELECTOR_NOTE_MENU: ".VIpgJd-xl07Ob.VIpgJd-xl07Ob-BvBYQ",

    fullscreen: true, // Default - full screen enabled
    note: null,

    elBody: null,
    elContainer: null,

    menuInterval: null,

    observerMenu: null,
    observerNewNotes: null,
    observerNoteChanges: null,

    init: function () {
        console.log('[gkfs] main.init() called');
        window.main.SELECTOR_OPEN_NOTE_CONTAINER =
            window.main.SELECTOR_NOTE_CONTAINER + ".IZ65Hb-QQhtn";
        window.main.SELECTOR_OPEN_NOTE =
            window.main.SELECTOR_OPEN_NOTE_CONTAINER + " .IZ65Hb-TBnied";
        window.main.SELECTOR_OPEN_NOTE_TOOLBAR =
            window.main.SELECTOR_OPEN_NOTE + " .IZ65Hb-yePe5c";

        window.main.elBody = document.querySelector("body");
        console.log('[gkfs] elBody:', window.main.elBody);

        window.main.observerMenu = new MutationObserver(window.main.maybeInitMenu);
        window.main.observerNoteChanges = new MutationObserver(window.main.checkForOpenNote);
        window.main.observerNewNotes = new MutationObserver(window.main.initNoteObservers);

        window.main.checkForDarkMode();
        window.main.checkForOpenNote();
        window.main.maybeInitMenu();

        // Electron: skip chrome.storage, always enable fullscreen
        window.main.fullscreen = true;

        // Observe body for menus
        window.main.initMenuObservers();
        // Observe existing notes on load for open/close
        window.main.initNoteObservers();
        // Observe note group container for added/removed children
        const elCreatedNotesGroupContainer = document.querySelector(
            window.main.SELECTOR_CREATED_NOTES_GROUP_CONTAINER
        );
        console.log('[gkfs] elCreatedNotesGroupContainer:', elCreatedNotesGroupContainer);
        if (elCreatedNotesGroupContainer) {
            window.main.observerNewNotes.observe(elCreatedNotesGroupContainer, {
                childList: true,
            });
        }
        // Listen for list of notes to change - add/remove or page switch
        window.addEventListener("popstate", window.main.checkForOpenNote);
        // Listen for child change in head (eg. script swap for normal/dark mode)
        // - check whether to toggle dark mode class, based on body style
        const elHead = document.querySelector("head");
        if (elHead) {
            new MutationObserver(window.main.checkForDarkMode).observe(elHead, {
                childList: true,
            });
        }
        console.log('[gkfs] main.init() finished');
    },

    initMenuObservers: function () {
        window.main.observerMenu.observe(window.main.elBody, {
            childList: true,
        });
    },

    initNoteObservers: function () {
        const elNoteContainers = document.querySelectorAll(
            window.main.SELECTOR_NOTE_CONTAINER
        );
        if (elNoteContainers) {
            elNoteContainers.forEach((elNoteContainer) => {
                if (!elNoteContainer.classList.contains("gkfs-observed")) {
                    window.main.observerNoteChanges.observe(elNoteContainer, {
                        attributes: true,
                    });
                    elNoteContainer.classList.add("gkfs-observed");
                }
            });
        }
    },

    checkForDarkMode: function () {
        const elBody = document.querySelector("body"),
            bodyStyles = getComputedStyle(elBody),
            backgroundColor = bodyStyles["background-color"],
            darkMode = backgroundColor !== "rgb(255, 255, 255)";
        elBody.classList.toggle("gkfs-dark-mode", darkMode);
    },

    checkForOpenNote: function () {
        console.log('[gkfs] checkForOpenNote() called');
        const elNote = document.querySelector(window.main.SELECTOR_OPEN_NOTE);
        console.log('[gkfs] elNote:', elNote);
        if (elNote) {
            window.main.elBody.classList.add("gkfs-has-open-note");
            window.main.elContainer = document.querySelector(
                window.main.SELECTOR_OPEN_NOTE_CONTAINER
            );
            console.log('[gkfs] elContainer:', window.main.elContainer);
            // Initialize container if needed
            if (!window.main.elContainer.classList.contains("gkfs-initialized")) {
                window.main.elContainer.classList.add("gkfs-initialized");
                if (window.main.fullscreen) {
                    window.main.elBody.classList.add("gkfs-fullscreen");
                }
            }
            if (elNote.hasOwnProperty("gkfs") && elNote.gkfs) {
                window.main.note = elNote.gkfs;
                console.log('[gkfs] Using existing note.gkfs instance');
                window.main.note.toggle_fullscreen(window.main.fullscreen);
            } else {
                console.log('[gkfs] Creating new Note instance');
                window.main.note = new Note(elNote, window.main.elContainer);
            }
        } else {
            window.main.elBody.classList.remove("gkfs-has-open-note");
            console.log('[gkfs] No open note found');
        }
    },

    maybeInitMenu: function () {
        const elMenus = document.querySelectorAll(window.main.SELECTOR_NOTE_MENU);
        elMenus.forEach(function (elMenu) {
            if (
                // Make sure it's one of the menus we care about
                !elMenu.querySelector('[id=":16"], [id=":1"]') ||
                // Skip if we already hit this menu
                elMenu.classList.contains("gkfs-menu-initialized")
            ) {
                return;
            }
            // Add the help menu item link
            window.main.addMenuItem(
                elMenu,
                "Fullscreen Info & Help",
                "https://github.com/chrisputnam9/chrome-google-keep-full-screen/blob/master/README.md"
            );
            // Add the options menu item with click event (disabled in Electron)
            const elMenuItemOptions = window.main.addMenuItem(
                elMenu,
                "Fullscreen Options",
                "#"
            );
            elMenuItemOptions.addEventListener("click", function (event) {
                event.preventDefault();
                // Electron: No options page
            });
            // Mark as initialized
            elMenu.classList.add("gkfs-menu-initialized");
        });
    },

    addMenuItem: function (elMenu, text, url = "#") {
        const elMenuItem = document.createElement("a"),
            elMenuItemText = document.createElement("span");
        elMenuItem.setAttribute("role", "menuitem");
        elMenuItem.classList.add("gkfs-menu-item", "VIpgJd-j7LFlb");
        elMenuItem.setAttribute("href", url);
        elMenuItem.setAttribute("target", "_blank");
        elMenuItemText.classList.add(
            "gkfs-menu-item-text",
            "VIpgJd-j7LFlb-bN97Pc"
        );
        elMenuItemText.innerText = text;
        elMenu.insertAdjacentElement("beforeend", elMenuItem);
        elMenuItem.insertAdjacentElement("afterbegin", elMenuItemText);
        return elMenuItem;
    },
};

// Note Object
const Note = function (el, elContainer) {
    console.log('[gkfs] Note constructor called', el, elContainer);
    // Mark element init in progress
    el.gkfs = 1;
    const inst = this;
    const elToolbar = el.querySelector(window.main.SELECTOR_OPEN_NOTE_TOOLBAR);
    console.log('[gkfs] elToolbar:', elToolbar);
    const elBtnMore = elToolbar && elToolbar.querySelector(
        ".Q0hgme-LgbsSe.Q0hgme-Bz112c-LgbsSe.xl07Ob.INgbqf-LgbsSe.VIpgJd-LgbsSe"
    );
    console.log('[gkfs] elBtnMore:', elBtnMore);
    // Set up toggle button
    if (elBtnMore) {
        const elBtnToggle = document.createElement("div");
        elBtnToggle.setAttribute("role", "button");
        elBtnToggle.setAttribute("aria-label", "Full-screen Toggle");
        elBtnToggle.setAttribute("title", "Full-screen Toggle");
        elBtnToggle.classList.add(
            "gkfs-toggle",
            "VIpgJd-j7LFlb",
            "VIpgJd-j7LFlb-Bz112c",
            "VIpgJd-j7LFlb-LgbsSe"
        );
        const elIcon = document.createElement("span");
        elIcon.classList.add("gkfs-toggle-icon");
        elBtnToggle.appendChild(elIcon);
        elBtnMore.parentNode.insertBefore(elBtnToggle, elBtnMore);
        console.log('[gkfs] Toggle button injected:', elBtnToggle);
        // Set up properties
        inst.el = el;
        inst.elContainer = elContainer;
        inst.elBtnToggle = elBtnToggle;
        // Set up methods
        inst.toggle_fullscreen = function (event_or_state) {
            console.log('[gkfs] toggle_fullscreen called', event_or_state);
            if (event_or_state === true || event_or_state === false) {
                window.main.elBody.classList.toggle("gkfs-fullscreen", event_or_state);
            } else {
                window.main.elBody.classList.toggle("gkfs-fullscreen");
            }
            const active = window.main.elBody.classList.contains("gkfs-fullscreen");
            const elBtns = document.querySelectorAll(".gkfs-toggle");
            elBtns.forEach((elBtn) => {
                elBtn.classList.toggle("active", active);
            });
            console.log('[gkfs] Fullscreen active:', active);
        };
        inst.update_buttons = function () {};
        // Event listener, now that it's defined
        elBtnToggle.addEventListener("click", inst.toggle_fullscreen);
        // Fully initialized, set instance on element data
        inst.el.gkfs = inst;
    } else {
        console.log('[gkfs] elBtnMore not found, toggle button not injected');
    }
};
