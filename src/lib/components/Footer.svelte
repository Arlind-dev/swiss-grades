<script lang="ts">
  const version = __APP_VERSION__;
  const commit = __APP_COMMIT__;
  const buildDate = __APP_BUILD_DATE__;
  const year = new Date().getFullYear();
</script>

<footer class="mt-16 pb-12 pt-8 border-t border-ctp-surface0">
  <div class="container mx-auto max-w-3xl px-4 flex flex-col items-center gap-4 text-center">
    <div class="text-sm font-bold text-ctp-subtext1">
      © {year} Arlind Sulejmani
    </div>
    
    <div class="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs font-medium text-ctp-overlay1">
      <a
        href="https://github.com/Arlind-dev/swiss-grades"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-ctp-lavender transition-colors underline decoration-dotted underline-offset-4"
      >
        GitHub
      </a>
      <span class="w-1 h-1 rounded-full bg-ctp-surface1 hidden sm:block"></span>
      <div class="flex items-center gap-2">
        <span class="badge bg-ctp-surface0 border-none text-ctp-subtext1 text-[10px] font-black tracking-widest">{version}</span>
        <span class="opacity-50">({commit})</span>
      </div>
      <span class="w-1 h-1 rounded-full bg-ctp-surface1 hidden sm:block"></span>
      <div class="opacity-50">{buildDate}</div>
    </div>
  </div>
</footer>
