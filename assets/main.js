/* chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        files: ['assets/content.js']
    });
}); */

class Main {
    constructor(toggleBtnId) {
        this.toggleBtn = document.getElementById(toggleBtnId);
        this.init();
    }

    print(message) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { log: message });
        });
    }

    async init() {
        const state = await this.getToggleState();
        this.updateToggleBtnLabel(state);
        this.toggleBtn.addEventListener("click", () => this.toggle());
    }

    async getToggleState() {
        try {
            const result = await new Promise((resolve, reject) => {
                chrome.storage.local.get("filler_extension", (data) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(data?.filler_extension?.active ?? false);
                    }
                });
            });
            this.print("Currently active: " + result);
            return result;
        } catch (error) {
            this.print("Error: " + error.message);
            return false;
        }
    }


    async setToggleState(state) {
        try {
            await new Promise((resolve, reject) => {
                chrome.storage.local.set({ filler_extension: { active: state } }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        this.print("Settings Changed!");
                        resolve();
                    }
                });
            });
        } catch (error) {
            this.print("Error: " + error.message);
        }
    }

    async toggle() {
        const current = await this.getToggleState();
        const newState = !current;
        await this.setToggleState(newState);
        this.updateToggleBtnLabel(newState);
    }

    updateToggleBtnLabel(state) {
        this.toggleBtn.textContent = state ? "Disable" : "Activate";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Main("toggleBtn");
});