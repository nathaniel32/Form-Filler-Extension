/* chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        files: ['assets/content.js']
    });
}); */

class Main {
    constructor(activeBtnId) {
        this.activeBtn = document.getElementById(activeBtnId);
        this.init();
    }

    sendToContent(data) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, data);
        });
    }

    print(message) {
        this.sendToContent({ log: message });
    }

    async init() {
        const state = await this.getActiveState();
        this.updateActiveBtnLabel(state);
        this.activeBtn.addEventListener("click", () => this.active());
    }

    async getActiveState() {
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


    async setActiveState(state) {
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

    async active() {
        const current = await this.getActiveState();
        const newState = !current;
        await this.setActiveState(newState);
        this.updateActiveBtnLabel(newState);
        this.sendToContent({ active: newState });
    }

    updateActiveBtnLabel(state) {
        this.activeBtn.textContent = state ? "Disable" : "Activate";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Main("activeBtn");
});