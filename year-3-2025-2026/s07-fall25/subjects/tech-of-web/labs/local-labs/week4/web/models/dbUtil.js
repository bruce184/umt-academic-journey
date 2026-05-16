import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'assets', 'data.json');

async function readData() {
	try {
		const raw = await fs.readFile(DATA_FILE, 'utf8');
		return JSON.parse(raw || '[]');
	} catch (err) {
		if (err.code === 'ENOENT') return [];
		throw err;
	}
}

async function writeData(data) {
	await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function getAll() {
	return await readData();
}

export async function getById(id) {
	const arr = await readData();
	return arr.find((i) => i.id === id);
}

export async function add(item) {
	const arr = await readData();
	const id = Date.now().toString();
	const newItem = { id, ...item };
	arr.push(newItem);
	await writeData(arr);
	return newItem;
}

export async function update(id, updated) {
	const arr = await readData();
	const idx = arr.findIndex((i) => i.id === id);
	if (idx === -1) return null;
	arr[idx] = { ...arr[idx], ...updated };
	await writeData(arr);
	return arr[idx];
}

export async function remove(id) {
	const arr = await readData();
	const idx = arr.findIndex((i) => i.id === id);
	if (idx === -1) return false;
	arr.splice(idx, 1);
	await writeData(arr);
	return true;
}

// Backwards-compatible named exports used by merged modules
export { readData, writeData };

