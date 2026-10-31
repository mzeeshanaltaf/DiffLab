type Axis = "x" | "y";

/**
 * Turns `bar` into one always-visible scrollbar driving every element in `scrollers`, which stay in
 * lockstep whichever of them is scrolled (wheel, keyboard, cursor movement). Panes can have different
 * scroll ranges, so the bar spans the widest one and shorter panes simply stop at their own end.
 * Returns a cleanup function.
 */
export function attachSharedScrollbar(bar: HTMLElement, scrollers: HTMLElement[], axis: Axis): () => void {
  const position = axis === "x" ? "scrollLeft" : "scrollTop";
  const scrollSize = axis === "x" ? "scrollWidth" : "scrollHeight";
  const clientSize = axis === "x" ? "clientWidth" : "clientHeight";

  const spacer = document.createElement("div");
  if (axis === "x") spacer.style.height = "1px";
  else spacer.style.width = "1px";
  bar.append(spacer);

  const range = (el: HTMLElement) => Math.max(0, el[scrollSize] - el[clientSize]);
  let current = scrollers[0]?.[position] ?? 0;

  function handleScroll(event: Event) {
    const source = event.currentTarget as HTMLElement;
    // Our own programmatic writes (possibly clamped by a shorter pane) fire scroll events too.
    // The 1px tolerance absorbs fractional scroll offsets on high-DPI screens.
    if (Math.abs(source[position] - Math.min(current, range(source))) <= 1) return;
    current = source[position];
    for (const el of [bar, ...scrollers]) if (el !== source) el[position] = current;
  }

  function measure() {
    const max = Math.max(0, ...scrollers.map(range));
    // A vertical bar stays put: hiding it would resize the panes and could toggle the horizontal one.
    if (axis === "x") bar.style.display = max > 0 ? "block" : "none";
    spacer.style[axis === "x" ? "width" : "height"] = `${bar[clientSize] + max}px`;
    current = Math.min(current, max);
    bar[position] = current;
  }

  const observer = new ResizeObserver(measure);
  observer.observe(bar);
  for (const el of scrollers) {
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
  }

  for (const el of [bar, ...scrollers]) el.addEventListener("scroll", handleScroll, { passive: true });
  measure();

  return () => {
    observer.disconnect();
    for (const el of [bar, ...scrollers]) el.removeEventListener("scroll", handleScroll);
    spacer.remove();
    if (axis === "x") bar.style.display = "none";
  };
}
