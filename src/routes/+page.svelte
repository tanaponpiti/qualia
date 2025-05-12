<script lang="ts">
  import * as m from "$lib/paraglide/messages";
  import { sendToServer } from "$lib/apiClient";
  let textareaValue = "";
  let isLoading = false;

  async function handleSend() {
    isLoading = true;
    try {
      await sendToServer(textareaValue);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">{m.page_title()}</h1>
      <p class="py-6">
        {m.page_description()}
      </p>
      <div class="card bg-base-100 shadow-xl p-6 space-y-4">
        <textarea
          class="textarea textarea-bordered textarea-lg w-full h-32"
          placeholder={m.textarea_placeholder()}
          bind:value={textareaValue}
          disabled={isLoading}
        ></textarea>
        <button class="btn btn-primary btn-lg w-full" on:click={handleSend} disabled={isLoading}>
          {#if isLoading}
            <span class="loading loading-spinner"></span>
            {m.loading_button?.() || 'Loading...'}
          {:else}
            {m.generate_button()}
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>
