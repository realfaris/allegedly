// Widget bundle entry point. The @main attribute tells WidgetKit which
// type owns the extension's run loop. We keep the bundle thin — one
// widget for v1; if we add a second size or a Live Activity later, list
// them here.

import SwiftUI
import WidgetKit

@main
struct AllegedlyWidgetBundle: WidgetBundle {
    var body: some Widget {
        QuoteWidget()
    }
}
