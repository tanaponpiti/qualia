<script lang="ts">
  import * as m from "$lib/paraglide/messages";
  import { sendToServer } from "$lib/apiClient";
  import { onMount } from 'svelte'; // For auto-scroll

  let userInput = "";
  let messages: Array<{ text: string; sender: "user" | "ai" }> = [];
  let isLoading = false;
  let chatContainer: HTMLElement; // For auto-scroll

  async function handleSendMessage() {
    if (!userInput.trim()) return;

    const newUserMessage = { text: userInput, sender: "user" as const };
    messages = [...messages, newUserMessage];
    const currentInput = userInput;
    userInput = ""; // Clear input after sending

    isLoading = true;
    try {
      const apiResult: unknown = await sendToServer(currentInput);
      let aiMessageText: string | undefined;

      if (typeof apiResult === 'string') {
        aiMessageText = apiResult;
      } else if (apiResult && typeof (apiResult as any).text === 'string') {
        aiMessageText = (apiResult as any).text;
      } else if (apiResult && typeof (apiResult as any).message === 'string') {
        aiMessageText = (apiResult as any).message;
      } else {
        if (apiResult && (apiResult as any).data && typeof (apiResult as any).data.text === 'string') {
          aiMessageText = (apiResult as any).data.text;
        } else if (apiResult && (apiResult as any).data && typeof (apiResult as any).data.message === 'string') {
          aiMessageText = (apiResult as any).data.message;
        }
      }

      if (aiMessageText) {
        const aiResponse = { text: aiMessageText, sender: "ai" as const };
        messages = [...messages, aiResponse];
      } else {
        console.error("Unexpected or empty AI response format:", apiResult);
        const errorResponse = {
          text: m.error_unexpected_response() || "Sorry, I received an unexpected response from the AI.",
          sender: "ai" as const
        };
        messages = [...messages, errorResponse];
      }
    } catch (error) {
      console.error("Error sending message or receiving AI response:", error);
      const errorResponse = {
        text: m.error_ai_connection() || "Sorry, I couldn't connect to the AI. Please try again later.",
        sender: "ai" as const
      };
      messages = [...messages, errorResponse];
    } finally {
      isLoading = false;
    }
  }

  // Auto-scroll to bottom when new messages are added
  $: if (messages && chatContainer) {
    // Wait for the DOM to update
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 0);
  }

</script>

<div class="card bg-base-100 shadow-xl flex flex-col h-full">
  <div class="card-body p-4 flex flex-col h-full flex-grow">
    <div class="flex-1 overflow-y-auto mb-4 space-y-2" bind:this={chatContainer}>
      {#each messages as message}
        <div class="chat {message.sender === 'user' ? 'chat-start' : 'chat-end'}">
          <div class="chat-bubble {message.sender === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}">
            {message.text}
          </div>
        </div>
      {/each}
      {#if isLoading}
        <div class="chat chat-end">
          <div class="chat-bubble chat-bubble-secondary">
            <span class="loading loading-dots loading-sm"></span>
          </div>
        </div>
      {/if}
    </div>

    <div class="flex items-center mt-auto ">
      <textarea
        class="textarea textarea-bordered flex-1 mr-2 resize-none h-full"
        placeholder={m.chat_placeholder?.() || 'Type your message...'}
        bind:value={userInput}
        disabled={isLoading}
        on:keydown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      ></textarea>
      <button class="btn btn-primary h-full w-20" on:click={handleSendMessage} disabled={isLoading || !userInput.trim()}>
        {#if isLoading}
          <span class="loading loading-spinner"></span>
        {:else}
          {m.send_chat_button?.() || 'Send'}
        {/if}
      </button>
    </div>
  </div>
</div>
