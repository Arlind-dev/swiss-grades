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

<button 
  type="button" 
  class="btn btn-ghost btn-sm text-ctp-subtext1 gap-2 rounded-lg hover:bg-ctp-surface0 transition-all border border-ctp-surface1 px-4" 
  aria-label={$m.share.action} 
  title={$m.share.action} 
  onclick={handleShare}
>
  <ShareNodesOutline class="w-4 h-4" />
  <span aria-live="polite" class="text-xs font-bold uppercase tracking-wider">{statusText}</span>
</button>
