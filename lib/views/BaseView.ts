import { MarkdownPostProcessorContext } from "obsidian";

export abstract class BaseView {
	public abstract codeblock: string;

	// Changed return type from string to HTMLElement or void
	public abstract render(source: string, ctx: MarkdownPostProcessorContext): HTMLElement | string | void;

	public register(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		const div = el.createEl("div");
		try {
			const result = this.render(source, ctx);

			// Handle different return types from render
			if (result instanceof HTMLElement) {
				div.appendChild(result);
			} else if (typeof result === 'string') {
				div.innerHTML = result;
			} else {
				// If render returns void (modifies div directly)
				console.log("Rendering code block", this.codeblock);
			}
		} catch (e) {
			console.error("Error rendering code block", e);
			// Using a type assertion to handle the potential error type mismatch
			const errorMessage = e instanceof Error ? e.message : String(e);
			div.innerHTML = `<div class="notice">Error parsing stats block: ${errorMessage}</div>`;
		}
	}
}
