<script lang="ts">
  import { m } from '$lib/i18n';
  import { createShareUrl, type SharePayload } from '$lib/utils/share';
  import Button from './Button.svelte';

  let { payload }: { payload: () => SharePayload } = $props();

  type State = 'idle' | 'copied' | 'failed' | 'tooLarge';
  let state = $state<State>('idle');
  let timer: ReturnType<typeof setTimeout> | undefined;

  function flash(next: State) {
    state = next;
    clearTimeout(timer);
    timer = setTimeout(() => (state = 'idle'), 2200);
  }

  async function share() {
    let url: string;
    try {
      url = createShareUrl(payload());
    } catch {
      flash('tooLarge');
      return;
    }
    // Native share sheet first (mobile), then clipboard, then prompt.
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // otherwise fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flash('copied');
    } catch {
      const copied = window.prompt($m.share.copyPrompt, url);
      if (copied === null) flash('failed');
    }
  }

  const label = $derived(
    state === 'copied'
      ? $m.share.copied
      : state === 'failed'
        ? $m.share.failed
        : state === 'tooLarge'
          ? $m.share.tooLarge
          : $m.share.action
  );
</script>

<Button variant="secondary" onclick={share} title={$m.share.action}>
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
  {label}
</Button>
