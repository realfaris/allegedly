// Square share card. Rendered hidden off-screen inside QuoteScreen so we
// can snapshot it via captureRef regardless of what's visible. The ref is
// what view-shot grabs.
//
// Design choices:
//   - Square (1:1) — universal; crops to Stories cleanly, fits the IG feed,
//     fits TikTok's static images. Could ship a 9:16 variant later.
//   - Watermark bottom-center, small caps with healthy letter-spacing —
//     reads as a brand mark, not a stamp.
//   - Quote text is sized to fit at typical lengths; long quotes shrink via
//     adjustsFontSizeToFit so we don't overflow.
//   - Edges use the gradient stops from the live palette so the share image
//     matches whatever the user is looking at.
//
// `collapsable={false}` on Android is required for view-shot.

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { Palette } from '../theme/palettes';
import type { Quote } from '../types';
import { QuoteBackground } from './QuoteBackground';
import { fontFamily } from '../theme/typography';

export const SHARE_SIZE = 1080;

interface Props {
  quote: Quote;
  palette: Palette;
}

export const ShareCard = forwardRef<View, Props>(({ quote, palette }, ref) => {
  return (
    <View
      ref={ref}
      collapsable={false}
      style={styles.container}
      pointerEvents="none"
    >
      <QuoteBackground palette={palette} style={styles.background}>
        <View style={styles.content}>
          <Text
            style={[
              styles.quote,
              { color: palette.text },
            ]}
            adjustsFontSizeToFit
            numberOfLines={6}
            allowFontScaling={false}
          >
            “{quote.text}”
          </Text>
          <Text
            style={[
              styles.byline,
              { color: palette.textMuted, marginTop: 32 },
            ]}
          >
            — {quote.author}
          </Text>
        </View>
        <Text
          style={[
            styles.watermark,
            { color: palette.textMuted },
          ]}
        >
          MADE WITH ALLEGEDLY
        </Text>
      </QuoteBackground>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  container: {
    width: SHARE_SIZE,
    height: SHARE_SIZE,
    // Hidden offscreen; ref still measurable for capture.
    position: 'absolute',
    top: -10_000,
    left: -10_000,
  },
  background: {
    flex: 0,
    width: SHARE_SIZE,
    height: SHARE_SIZE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 96,
    paddingTop: 96,
    paddingBottom: 160, // leave room for watermark
    justifyContent: 'center',
  },
  quote: {
    fontFamily: fontFamily.serifRegular,
    fontSize: 72,
    lineHeight: 92,
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  byline: {
    fontFamily: fontFamily.serifItalic,
    fontSize: 32,
    letterSpacing: 0.5,
  },
  watermark: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fontFamily.serifMedium,
    fontSize: 18,
    letterSpacing: 4,
    opacity: 0.7,
  },
});
