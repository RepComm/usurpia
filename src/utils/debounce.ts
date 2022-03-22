
export interface DebounceInfo {
  timeLast: number;
  timeDebounce: number;
}

export function debounce (info: DebounceInfo): boolean {
  if (Date.now() - info.timeLast >= info.timeDebounce) {
    info.timeLast = Date.now();
    return true;
  }
  return false;
}
