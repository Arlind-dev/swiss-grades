<script lang="ts">
  const version = __APP_VERSION__;
  const commit = __APP_COMMIT__;
  const buildDate = __APP_BUILD_DATE__;
  const year = new Date().getFullYear();
</script>

<footer>
  <span>© {year} Arlind Sulejmani</span>
  <span class="sep">|</span>
  <a
    href="https://github.com/Arlind-dev/swiss-grades/commits/main"
    target="_blank"
    rel="noopener noreferrer"
    class="meta"
  >
    {version}
    <span class="commit">({commit})</span>
    <span class="sep">·</span>
    <span class="date">{buildDate}</span>
  </a>
</footer>

<style>
  footer {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 0.75rem;
    border-top: 2px solid var(--ctp-surface1);
    color: var(--ctp-overlay1);
    font-size: 1rem;
  }

  .meta {
    color: inherit;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 120ms ease, color 120ms ease;
  }

  .meta:hover {
    color: var(--ctp-text);
    border-color: currentColor;
  }

  .meta:focus-visible {
    outline: 2px solid var(--ctp-lavender);
    outline-offset: 2px;
    border-color: transparent;
  }

  .commit {
    opacity: 0.7;
  }

  .sep {
    opacity: 0.4;
  }

  .date {
    opacity: 0.7;
  }
</style>
