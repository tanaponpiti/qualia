<script lang="ts">
  import ChatWindow from "$lib/components/ChatWindow.svelte";
</script>

<div class="flex flex-col h-screen p-4 bg-base-300">
  <ChatWindow />
</div>

<style>
  /* Ensure the container allows the chat window to take full height */
  :global(body, html) {
    height: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  :global(#svelte-announcer) {
    display: none;
  }
</style>
