import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import { config } from '../config';

/**
 * Logs an error to console and optionally to a Discord webhook.
 * @param context - Where the error occurred (e.g., 'Startup', 'Command: /search').
 * @param error - The error object or message.
 */
export const logError = async (context: string, error: unknown) => {
  // Always log to console
  console.error(`[${context}] Error:`, error);

  if (!config.ERROR_WEBHOOK_URL) return;

  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : 'No stack trace';

    // Discord embed limits: Title 256, Description 4096.
    // We'll put the stack in a code block description, truncated if needed.
    const description = `\`\`\`js\n${stack?.slice(0, 4000) || 'No stack trace'}\n\`\`\``;

    const embed = new EmbedBuilder()
      .setTitle(`🚨 Error in ${context}`)
      .setColor(0xff0000)
      .addFields({ name: 'Message', value: errorMessage })
      .setDescription(description)
      .setTimestamp();

    // Webhooks accept JSON bodies directly
    await axios.post(config.ERROR_WEBHOOK_URL, {
      embeds: [embed.toJSON()],
    });
  } catch (webhookError) {
    console.error('Failed to send error to webhook:', webhookError);
  }
};
