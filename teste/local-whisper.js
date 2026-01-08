/* Execução local (Node 18+): transcreve um MP3 público via Cloudflare Workers AI */
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "15d816f9860d7764ccb5644d673f09ee";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "HyjlavYhFdqn0UMV_MoQyl1FqvVMzt7s-X7D9qzK"; // defina via variável de ambiente

// Altere se quiser outro áudio
const AUDIO_URL = process.env.AUDIO_URL || "https://github.com/lavyoliveira/ai-transcriptor/raw/refs/heads/master/parte-1.wav";
const MODEL = "@cf/openai/whisper-large-v3-turbo";

async function fetchMp3Base64(url) {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Falha ao baixar MP3: ${res.status} ${res.statusText}`);
	}
	const buf = Buffer.from(await res.arrayBuffer());
	return buf.toString("base64");
}

async function transcribe(base64Audio) {
	if (!API_TOKEN) {
		throw new Error("Defina a variável de ambiente CLOUDFLARE_API_TOKEN com seu API Token.");
	}
	const endpoint = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/openai/whisper-large-v3-turbo`;
	console.log(endpoint);
	const body = { audio: base64Audio };
	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${API_TOKEN}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok || data?.success === false) {
		const msg = data?.errors?.length ? JSON.stringify(data.errors) : res.statusText;
		throw new Error(`Falha na API Workers AI: ${res.status} ${msg}`);
	}
	return data?.result ?? data;
}

async function main() {
	try {
		console.log("Baixando áudio...");
		const base64 = await fetchMp3Base64(AUDIO_URL);
		console.log("Chamando Workers AI (Whisper)...");
		const result = await transcribe(base64);
		console.log("Resultado:");
		console.log(JSON.stringify(result, null, 2));
	} catch (err) {
		console.error(err);
		process.exitCode = 1;
	}
}

main();


