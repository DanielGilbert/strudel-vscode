import { StrudelRepl } from '@strudel/repl';

const app = () => {
	() => customElements.define('strudel-editor', StrudelRepl);
	console.log("test234");
}

document.addEventListener('DOMContentLoaded', app);