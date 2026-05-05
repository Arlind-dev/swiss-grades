<script lang="ts">
  import { onDestroy } from 'svelte';
  import { ShareNodesOutline } from 'flowbite-svelte-icons';
  import { m } from '$lib/i18n';
  import { MAX_SHARE_URL_LENGTH } from '$lib/utils/share';

  let { getUrl }: { getUrl: () => string } = $props();

  type ShareStatus = 'idle' | 'copied' | 'failed' | 'too-large';

  let status = $state<ShareStatus>('idle');
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  let statusText = $derived.by(() => {
    if (status === 'copied') return $m.share.copied;
    if (status === 'failed') return $m.share.failed;
    if (status === 'too-large') return $m.share.tooLarge;
    return $m.share.action;
  });

  onDestroy(() => {
    if (resetTimer) clearTimeout(resetTimer);
  });

  function isShareCancel(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
  }

  function showStatus(nextStatus: ShareStatus) {
    status = nextStatus;
    if (resetTimer) clearTimeout(resetTimer);
    if (nextStatus !== 'idle') {
      resetTimer = setTimeout(() => {
        status = 'idle';
        resetTimer = null;
      }, 2200);
    }
  }

  async function copyUrl(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      showStatus('copied');
      return true;
    } catch {
      window.prompt($m.share.copyPrompt, url);
      showStatus('failed');
      return false;
    }
  }

  async function handleShare() {
    let url = '';
    try {
      url = getUrl();
    } catch {
      showStatus('too-large');
      return;
    }

    if (!url) {
      showStatus('failed');
      return;
    }

    if (url.length > MAX_SHARE_URL_LENGTH) {
      showStatus('too-large');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        showStatus('idle');
        return;
      } catch (error) {
        if (isShareCancel(error)) {
          showStatus('idle');
          return;
        }
      }
    }

    await copyUrl(url);
  }
</script>

<button type="button" class="share-button" aria-label={$m.share.action} title={$m.share.action} onclick={handleShare}>
  <ShareNodesOutline class="icon" />
  <span aria-live="polite">{statusText}</span>
</button>

<style>
  .share-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 12px;
    padding: 5px 10px;
    border-radius: 3px;
    background: none;
    color: var(--ctp-subtext0);
    border-color: var(--ctp-surface2);
  }

  .share-button:hover {
    border-color: var(--ctp-lavender);
    color: var(--ctp-lavender);
    background: none;
  }

  .share-button :global(.icon) {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
  }
</style>
