<script lang="ts">
  import { onDestroy } from 'svelte';
  import { TrashBinOutline } from 'flowbite-svelte-icons';

  let {
    onConfirm,
    label,
    confirmLabel,
    class: klass = ''
  }: { onConfirm: () => void; label: string; confirmLabel: string; class?: string } = $props();

  let confirm = $state(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });

  function handle() {
    // On touch devices, require a second tap to confirm; on desktop act immediately.
    if (window.matchMedia('(pointer: coarse)').matches) {
      if (confirm) {
        confirm = false;
        if (timer) clearTimeout(timer);
        onConfirm();
      } else {
        confirm = true;
        timer = setTimeout(() => (confirm = false), 3000);
      }
    } else {
      onConfirm();
    }
  }
</script>

<button
  type="button"
  class="btn btn-ghost transition-all {klass}"
  class:text-ctp-subtext1={!confirm}
  class:hover:bg-ctp-surface0={!confirm}
  class:bg-ctp-red={confirm}
  class:text-ctp-base={confirm}
  onclick={handle}
>
  <TrashBinOutline class="w-5 h-5" />
  {confirm ? confirmLabel : label}
</button>
