<script lang="ts">
  import { locale } from '$lib/i18n';
  import type { Locale } from '$lib/i18n';

  const locales: { code: Locale; label: string }[] = [
    { code: 'de', label: 'DE' },
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'it', label: 'IT' }
  ];
</script>

<select
  value={$locale}
  onchange={(e) => locale.set(e.currentTarget.value as Locale)}
  aria-label="Language"
  class="h-9 rounded-md border border-input-line bg-input px-2 text-sm text-text transition-colors hover:border-accent"
>
  {#each locales as { code, label } (code)}
    <option value={code}>{label}</option>
  {/each}
</select>
