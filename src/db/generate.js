const fs = require("fs");
const path = require("path");

const generateUsuarios = (count) => {
  const usuarios = [];
  const historial_usuario = [];
  for (let i = 1; i <= count; i++) {
    values = {
      id: i.toString().padStart(4, "0"),
      nombre: `Nombre${i}`,
      apellido: `Apellido${i}`,
      email: `usuario${i}@mail.com`,
      teléfono: `123456${i.toString().padStart(3, "0")}`,
      sede: `Sede ${i % 10 === 0 ? "Central" : `#${i % 10}`}`,
      fecha_de_creación: new Date().toISOString(),
    }
    usuarios.push(values);
    historial_usuario.push({
      id: values["id"],
      user_id: values["id"],
      fecha: new Date().toISOString(),
      new_values: values,
      is_new_value: true,
      is_deleted: false
    })
  }
  return [usuarios, historial_usuario];
};

const generateSedes = (count) => {
  const sedes = [];
  const historial_sedes = [];
  for (let i = 1; i <= count; i++) {
    values = {
      id: i.toString().padStart(4, "0"),
      nombre: `Sede #${i}`,
      dirección: `Calle ${i * 10}`,
      ciudad: `Ciudad${i}`,
      fecha_de_creación: new Date().toISOString(),
    };
    sedes.push(values);
    historial_sedes.push({
      id: values["id"],
      sede_id: values["id"],
      fecha: new Date().toISOString(),
      new_values: values,
      is_new_value: true,
      is_deleted: false
    })
  }
  return [sedes, historial_sedes];
};

const generateDb = () => {
  const usuarios = generateUsuarios(100);
  const sedes = generateSedes(100);

  const db = {
    Usuarios: usuarios[0],
    HistorialUsuarios: usuarios[1],
    Sedes: sedes[0],
    HistorialSedes: sedes[1],
    HistorialMigración: [],
  };

  const filePath = path.join(__dirname, "../db/db1.json");
  fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf8");
  console.log("Archivo db1.json generado con éxito.");
};

generateDb();