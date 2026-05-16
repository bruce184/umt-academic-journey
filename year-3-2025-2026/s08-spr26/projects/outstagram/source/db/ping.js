import "dotenv/config";
import knexInit from "knex";
import rootKnexConfig from "../knexfile.js";

const knex = knexInit(rootKnexConfig.development);

async function main() {
    const r = await knex.raw("select now()");
    console.log("Database ping placeholder");
    console.log(r.rows[0]);
    await knex.destroy();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
