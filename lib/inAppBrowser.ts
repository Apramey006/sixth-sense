// Detects common in-app browsers (webviews embedded inside other apps).
// Google's OAuth flow rejects these with `disallowed_useragent`, so we use
// this to hide the Google button and tell the user to open in Safari/Chrome.

const IN_APP_PATTERNS = [
  "FBAN", "FBAV",            // Facebook
  "FB_IAB",                  // Facebook in-app browser
  "Instagram",
  "Line/",
  "Twitter",                 // also covers X
  "LinkedInApp",
  "TikTok", "musical_ly", "BytedanceWebview",
  "Snapchat",
  "Pinterest",
  "MicroMessenger",          // WeChat
  "KAKAOTALK",
  "Threads",
  "Discord",
];

const IN_APP_REGEX = new RegExp(IN_APP_PATTERNS.join("|"), "i");

export function isInAppBrowser(userAgent?: string): boolean {
  const ua = userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  if (!ua) return false;
  if (IN_APP_REGEX.test(ua)) return true;
  // Android WebView marker.
  if (/Android.*;\s*wv\)/.test(ua)) return true;
  return false;
}
