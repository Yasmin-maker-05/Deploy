import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path: path.join(__dirname, "../.env")});
const MONGO_URI = process.env.MONGO_URI;

async function conectarDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Banco de dados conectado com sucesso!");
  } catch (erro) {
    console.log(`Erro ao se conectar com o banco de dados: ${erro.message}`);
  }
}

export default conectarDB;