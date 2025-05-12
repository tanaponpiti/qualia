<script lang="ts">
  import * as m from "$lib/paraglide/messages";
  import { sendToServer } from "$lib/apiClient"; 

  let userInput = "";
  let messages: Array<{ text: string; sender: "user" | "ai" }> = [];
  let isLoading = false;

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
        // Fallback for other possible object structures if the text is nested
        // For example, if the response is { data: { text: "response" } }
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
</script>

<div class="flex flex-col h-screen p-4">
  <div class="flex-1 overflow-y-auto mb-4 space-y-2">
    {#each messages as message}
      <div class:chat-start={message.sender === 'user'} class:chat-end={message.sender === 'ai'} class="chat">
        <div class="chat-bubble {message.sender === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}">
          {message.text}
        </div>
      </div>
    {/each}
  </div>

  <div class="flex items-center">
    <textarea
      class="textarea textarea-bordered flex-1 mr-2"
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
    <button class="btn btn-primary" on:click={handleSendMessage} disabled={isLoading || !userInput.trim()}>
      {#if isLoading}
        <span class="loading loading-spinner"></span>
        {m.sending_chat_button?.() || 'Sending...'}
      {:else}
        {m.send_chat_button?.() || 'Send'}
      {/if}
    </button>
  </div>
</div>

<style>
  /* Basic styling to ensure the chat bubbles are distinct */
  .chat-bubble-primary {
    background-color: hsl(var(--p));
    color: hsl(var(--pc));
  }
  .chat-bubble-secondary {
    background-color: hsl(var(--s));
    color: hsl(var(--sc));
  }
</style>
