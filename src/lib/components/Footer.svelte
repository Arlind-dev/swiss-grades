<script lang="ts">
  const version = __APP_VERSION__;
  const commit = __APP_COMMIT__;
  const buildDate = __APP_BUILD_DATE__;
</script>

<footer class="border-t border-line">
  <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-4 text-xs text-faint">
    <a href="/average" class="text-faint hover:text-muted">Swiss Grades</a>
    <span aria-hidden="true">·</span>
    <span class="tnum">{version}</span>
    <span aria-hidden="true">·</span>
    <a
      href="https://github.com/Arlind-dev/swiss-grades"
      class="text-faint hover:text-muted"
      rel="noreferrer">{commit}</a
    >
    <span aria-hidden="true">·</span>
    <span class="tnum">{buildDate}</span>
  </div>
</footer>
