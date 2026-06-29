<script lang="ts">
  import Button from './Button.svelte';

  let {
    label,
    confirmLabel,
    onConfirm
  }: {
    label: string;
    confirmLabel: string;
    onConfirm: () => void;
  } = $props();

  let armed = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function click() {
    if (!armed) {
      armed = true;
      clearTimeout(timer);
      timer = setTimeout(() => (armed = false), 3000);
      return;
    }
    armed = false;
    clearTimeout(timer);
    onConfirm();
  }
</script>

<Button variant={armed ? 'danger' : 'ghost'} onclick={click}>
  {armed ? confirmLabel : label}
</Button>
