// QuoteWidget — Phase 7 spike.
//
// Static widget with a hardcoded quote and the `noir` palette gradient
// (matching the anti-motivational category default in src/theme/palettes.ts).
// No data sharing yet, no real timeline. Goal: prove the toolchain — that
// `npx expo prebuild --clean -p ios` produces a buildable Xcode project
// with this extension target wired in.
//
// Phase 7 part B will:
//   • Read prefs + scheduled entries from App Group UserDefaults
//   • Schedule TimelineEntries for the next 3 boundaries
//   • Render the active palette (gradient stops written by the app)
//   • Re-render whenever the app calls `WidgetCenter.shared.reloadAllTimelines()`
//
// The `.containerBackground(for: .widget)` modifier is iOS 17+ and is
// required — without it the widget renders blank in iOS 17+.

import SwiftUI
import WidgetKit

// MARK: - Timeline

struct SimpleEntry: TimelineEntry {
    let date: Date
    let quote: String
    let author: String
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(
            date: Date(),
            quote: "Loading…",
            author: "Allegedly"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
        completion(sampleEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
        // Spike: one entry, never expire. Phase 7B will compute multiple
        // entries scheduled at upcoming time-of-day boundaries.
        let timeline = Timeline(entries: [sampleEntry()], policy: .never)
        completion(timeline)
    }

    private func sampleEntry() -> SimpleEntry {
        SimpleEntry(
            date: Date(),
            quote: "Behind every dead body on Mount Everest was once a highly motivated individual.",
            author: "Allegedly"
        )
    }
}

// MARK: - View

/// Renders both `.systemSmall` and `.systemMedium`. The widget's text size
/// scales down with `minimumScaleFactor` so long quotes don't overflow.
struct QuoteWidgetEntryView: View {
    let entry: SimpleEntry
    @Environment(\.widgetFamily) private var family

    private var quoteFontSize: CGFloat { family == .systemSmall ? 13 : 16 }
    private var bylineFontSize: CGFloat { family == .systemSmall ? 10 : 12 }
    private var pad: CGFloat { family == .systemSmall ? 14 : 18 }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("\u{201C}\(entry.quote)\u{201D}")
                .font(.system(size: quoteFontSize, design: .serif))
                .foregroundColor(Color(red: 245/255, green: 240/255, blue: 232/255))
                .lineLimit(family == .systemSmall ? 5 : 4)
                .minimumScaleFactor(0.7)
                .multilineTextAlignment(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)

            Spacer(minLength: 4)

            Text("— \(entry.author)")
                .font(.system(size: bylineFontSize, design: .serif).italic())
                .foregroundColor(Color(red: 168/255, green: 160/255, blue: 149/255))
        }
        .padding(pad)
        .containerBackground(for: .widget) {
            // Noir palette stops from src/theme/palettes.ts:
            //   #0A0A0A → #2D1B2E → #3D2818
            LinearGradient(
                colors: [
                    Color(red: 10/255, green: 10/255, blue: 10/255),
                    Color(red: 45/255, green: 27/255, blue: 46/255),
                    Color(red: 61/255, green: 40/255, blue: 24/255),
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }
}

// MARK: - Widget

struct QuoteWidget: Widget {
    let kind: String = "QuoteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            QuoteWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Allegedly")
        .description("A new quote three times a day.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview (Xcode canvas only)

#Preview(as: .systemSmall) {
    QuoteWidget()
} timeline: {
    SimpleEntry(
        date: .now,
        quote: "Behind every dead body on Mount Everest was once a highly motivated individual.",
        author: "Allegedly"
    )
}

#Preview(as: .systemMedium) {
    QuoteWidget()
} timeline: {
    SimpleEntry(
        date: .now,
        quote: "Behind every dead body on Mount Everest was once a highly motivated individual.",
        author: "Allegedly"
    )
}
