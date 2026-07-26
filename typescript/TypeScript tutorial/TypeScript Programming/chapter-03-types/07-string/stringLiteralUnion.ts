// Goal:
// Use string literal union types for UI state.

// Expected result:
// The compiler accepts known tabs and rejects unknown tabs.

export {};

type SettingsTab = "profile" | "security" | "billing";

function createTabLabel(tabName: SettingsTab): string {
    switch (tabName) {
        case "profile":
            return "Profile";
        case "security":
            return "Security";
        case "billing":
            return "Billing";
    }
}

console.log(createTabLabel("profile"));

// @ts-expect-error: reports is not a SettingsTab.
console.log(createTabLabel("reports"));