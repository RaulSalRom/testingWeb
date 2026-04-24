import Pocketbase from 'pocketbase';

const POCKETBASE_API_URL = "https://corina-server.tail4f61af.ts.net";

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient };
