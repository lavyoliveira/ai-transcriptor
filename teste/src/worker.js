import { Buffer } from 'node:buffer';

const URL = "https://pub-dbcf9f0bd3af47ca9d40971179ee62de.r2.dev/02f6edc0-1f7b-4272-bd17-f05335104725/audio.mp3";

export default {
	async fetch(request, env, ctx) {
		try {
			const mp3 = await fetch(URL);
			if (!mp3.ok) {
				return Response.json({ error: `Failed to fetch MP3: ${mp3.status}` }, { status: 502 });
			}
			const mp3Buffer = await mp3.arrayBuffer();
			const base64 = Buffer.from(mp3Buffer).toString("base64");

			const res = await env.AI.run("@cf/openai/whisper-large-v3-turbo", {
				audio: base64
			});

			return Response.json(res);
		} catch (e) {
			console.error(e);
			return Response.json({ error: "An unexpected error occurred" }, { status: 500 });
		}
	},
};


