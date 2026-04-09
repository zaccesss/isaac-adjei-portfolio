<script>
	import { createApp, ref } from "vue";

	// <div id="message">{{message}}</div>

	createApp({
		setup() {
			const message = ref("Welcome VUE!");
			return { message };
		},
	}).mount("#message");
</script>
