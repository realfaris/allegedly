/**
 * @bacons/apple-targets config for the Allegedly home-screen widget.
 *
 * `type: "widget"` tells the plugin to scaffold a WidgetKit extension
 * target during `npx expo prebuild --clean -p ios`. The Swift sources
 * sit alongside this file and get linked into the Xcode project.
 *
 * App Group entitlement mirrors the main app so the widget can read the
 * shared UserDefaults / file container the app writes to. Phase 7 part B
 * wires the actual data flow; the spike is static.
 */

/** @type {import("@bacons/apple-targets").ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "QuoteWidget",
  icon: "../../assets/icon.png",
  deploymentTarget: "17.0",
  frameworks: ["SwiftUI", "WidgetKit"],
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.realfaris.allegedly",
    ],
  },
});
