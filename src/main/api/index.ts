import "../config/module-alias";
import { PersonController } from "@/application/controllers/index";

const p = new PersonController();
console.log(p.speak("João"));
