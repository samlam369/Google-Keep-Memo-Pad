const fs = require('fs');
const path = require('path');

// Paths to the extension files
const extensionDir = path.join(__dirname, 'chrome-google-keep-full-screen');
const sourceManifestPath = path.join(extensionDir, 'publish', 'manifest-chrome.json');
const targetManifestPath = path.join(extensionDir, 'manifest.json');
const contentScriptPath = path.join(extensionDir, 'src', 'content', 'script.js');

// Check if the extension directory exists
if (!fs.existsSync(extensionDir)) {
  console.error('Error: chrome-google-keep-full-screen directory not found.');
  console.log('Please clone the extension repository first:');
  console.log('git clone https://github.com/chrisputnam9/chrome-google-keep-full-screen.git');
  process.exit(1);
}

// Step 1: Prepare the manifest.json file
prepareManifest();

// Step 2: Add error handling to script.js
patchContentScript();

console.log('Extension setup complete!');

/**
 * Prepares the manifest.json file with the correct settings
 */
function prepareManifest() {
  // Check if the source manifest exists
  if (!fs.existsSync(sourceManifestPath)) {
    // If the source doesn't exist, but target does, we might not need to do anything
    if (fs.existsSync(targetManifestPath)) {
      console.log('Using existing manifest.json file.');
      ensureManifestSettings();
      return;
    }
    
    console.error('Error: Could not find source manifest at:', sourceManifestPath);
    process.exit(1);
  }

  // Copy the manifest
  try {
    const manifestContent = fs.readFileSync(sourceManifestPath, 'utf8');
    let manifest = JSON.parse(manifestContent);
    
    // Ensure content_scripts exists and has at least one entry
    if (!manifest.content_scripts || !manifest.content_scripts[0]) {
      manifest.content_scripts = [{
        "matches": ["*://keep.google.com/*"],
        "css": ["src/content/styles.css"],
        "js": ["src/content/script.js", "src/shared/options_handler.js"]
      }];
    }
    
    // Ensure run_at is set to document_idle
    manifest.content_scripts[0].run_at = "document_idle";
    
    // Write updated manifest to target location
    fs.writeFileSync(targetManifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('Successfully prepared manifest.json with proper run_at setting.');
  } catch (err) {
    console.error('Error preparing manifest.json:', err);
    process.exit(1);
  }
}

/**
 * Ensures existing manifest has correct settings
 */
function ensureManifestSettings() {
  try {
    const manifestContent = fs.readFileSync(targetManifestPath, 'utf8');
    let manifest = JSON.parse(manifestContent);
    
    let updated = false;
    
    // Check and update run_at property
    if (manifest.content_scripts && manifest.content_scripts[0]) {
      if (manifest.content_scripts[0].run_at !== "document_idle") {
        manifest.content_scripts[0].run_at = "document_idle";
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(targetManifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      console.log('Updated existing manifest.json with proper run_at setting.');
    } else {
      console.log('Existing manifest.json already has proper settings.');
    }
  } catch (err) {
    console.error('Error checking/updating existing manifest.json:', err);
  }
}

/**
 * Adds necessary error handling patches to the content script
 */
function patchContentScript() {
  if (!fs.existsSync(contentScriptPath)) {
    console.error('Error: Content script not found at:', contentScriptPath);
    return;
  }

  try {
    let scriptContent = fs.readFileSync(contentScriptPath, 'utf8');
    
    // Check if already patched
    if (scriptContent.includes('// Patched for Electron compatibility')) {
      console.log('Content script already patched for Electron compatibility.');
      return;
    }
    
    // Add patch header comment
    scriptContent = `/* global chrome */
// Patched for Electron compatibility
${scriptContent.replace(/\/\* global chrome \*\/\n/, '')}`;
    
    // Replace the 'init' function with one that has proper error handling
    const initFunctionRegex = /init:\s*async\s*function\s*\(\)\s*\{[\s\S]*?(?=\},\s*\/\*\*\s*Update one or more settings)/;
    const patchedInitFunction = `init: async function () {
		try {
			main.SELECTOR_OPEN_NOTE_CONTAINER =
				main.SELECTOR_NOTE_CONTAINER + ".IZ65Hb-QQhtn";
			main.SELECTOR_OPEN_NOTE =
				main.SELECTOR_OPEN_NOTE_CONTAINER + " .IZ65Hb-TBnied";
			main.SELECTOR_OPEN_NOTE_TOOLBAR =
				main.SELECTOR_OPEN_NOTE + " .IZ65Hb-yePe5c";

			main.elBody = document.querySelector("body");

			main.observerMenu = new MutationObserver(main.maybeInitMenu);
			main.observerNoteChanges = new MutationObserver(main.checkForOpenNote);
			main.observerNewNotes = new MutationObserver(main.initNoteObservers);

			main.checkForDarkMode();
			main.checkForOpenNote();
			main.maybeInitMenu();

			try {
				const storage = await promise_chrome_storage_sync_get(["settings"]);

				if ("settings" in storage && "fullscreen" in storage.settings) {
					this.fullscreen = storage.settings.fullscreen;
				}
			} catch (storageErr) {
				// Continue with default fullscreen setting
				// Chrome storage may not be available in Electron
			}

			// Observe body for menus
			main.initMenuObservers();

			// Observe existing notes on load for open/close
			main.initNoteObservers();

			// Observe note group container for added/removed children
			const elCreatedNotesGroupContainer = document.querySelector(
				this.SELECTOR_CREATED_NOTES_GROUP_CONTAINER
			);

			if (elCreatedNotesGroupContainer) {
				// Listen for list of notes to change - add/remove or page switch
				main.observerNewNotes.observe(elCreatedNotesGroupContainer, {
					childList: true,
				});
			}

			// Listen for popstate - triggered by forward and back buttons, and manual hash entry
			window.addEventListener("popstate", main.checkForOpenNote);

			// Listen for child change in head (eg. script swap for normal/dark mode)
			// - check whether to toggle dark mode class, based on body style
			const elHead = document.querySelector("head");
			new MutationObserver(main.checkForDarkMode).observe(elHead, {
				childList: true,
			});

			// Listen for messages
			try {
				chrome.runtime.onMessage.addListener(function (request) {
					// Handle keyboard shortcuts
					if (
						"command" in request &&
						request.command === "toggle-fullscreen"
					) {
						main.set({ fullscreen: !main.fullscreen });
						if (main.note) {
							main.note.toggle_fullscreen();
						}
					}
				});
			} catch (chromeErr) {
				// Chrome messaging may not be available in Electron
			}
		} catch (err) {
			console.error('Extension initialization error:', err);
		}
	},

	/**`;
    
    // Replace the init function with our patched version
    scriptContent = scriptContent.replace(initFunctionRegex, patchedInitFunction);
    
    // Write the patched script back to the file
    fs.writeFileSync(contentScriptPath, scriptContent, 'utf8');
    console.log('Successfully patched content script with Electron compatibility fixes.');
  } catch (err) {
    console.error('Error patching content script:', err);
  }
}
