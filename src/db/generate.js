const assert = require("assert");
const fs = require("fs");
const path = require("path");

const generateUsuarios = (count) => {
  const usuarios = [];
  const historial_usuario = [];
  for (let i = 1; i <= count; i++) {
    values = {
      id: i,
      nombre: `Nombre${i}`,
      apellido: `Apellido${i}`,
      email: `usuario${i}@mail.com`,
      teléfono: `123456${i.toString().padStart(3, "0")}`,
      sede: `Sede ${i % 10 === 0 ? "Central" : `#${i % 10}`}`,
      fecha_de_creación: new Date().toISOString(),
    }
    usuarios.push(values);
    historial_usuario.push({
      id: i,
      user_id: i,
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
      id: i,
      nombre: `Sede #${i}`,
      dirección: `Calle ${i * 10}`,
      ciudad: `Ciudad${i}`,
      fecha_de_creación: new Date().toISOString(),
    };
    sedes.push(values);
    historial_sedes.push({
      id: i,
      sede_id: i,
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

const insertRecord = (table, record) => {
  const filePath = path.join(__dirname, "../db/db1.json");
  let db = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (table == "Usuarios") {
    // Exit function if any of the required fields are missing
    assert(record.nombre, "nombre es requerido");
    assert(record.apellido, "apellido es requerido");
    assert(record.email, "email es requerido");
    assert(record.teléfono, "teléfono es requerido");
    assert(record.sede, "sede es requerido");
  } if (table == "Sedes") {
    assert(record.nombre, "nombre es requerido");
    assert(record.dirección, "dirección es requerido");
    assert(record.ciudad, "ciudad es requerido");
  }
  record.id = db[table].length + 1;
  record.fecha_de_creación = new Date().toISOString();

  const historyString = "Historial" + table;
  const idString = table === "Usuarios" ? "user_id" : "sede_id";
  
  db[table].push(record);
  db[historyString].push({
    id: db[historyString].length + 1,
    [idString]: record.id,
    fecha: new Date().toISOString(),
    new_values: record,
    is_new_value: true,
    is_deleted: false
  });
  fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf8");
}

const deleteRecord = (table, id) => {
  const filePath = path.join(__dirname, "../db/db1.json");
  let db = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const idString = table === "Usuarios" ? "user_id" : "sede_id";
  const historyString = "Historial" + table;

  const record = db[table].find((record) => record.id === id);
  if (record) {
    db[table] = db[table].filter((record) => record.id !== id);
    db[historyString].push({
      id: db[historyString].length + 1,
      [idString]: record.id,
      fecha: new Date().toISOString(),
      new_values: {},
      is_new_value: false,
      is_deleted: true
    });
    fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf8");
  } else {
    console.log(`No se encontró el registro con id ${id} en la tabla ${table}`);
  }
}

const updateRecord = (table, id, newValues) => {
  const filePath = path.join(__dirname, "../db/db1.json");
  let db = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const idString = table === "Usuarios" ? "user_id" : "sede_id";
  const historyString = "Historial" + table;

  const record = db[table].find((record) => record.id === id);
  if (record) {
    Object.assign(record, newValues);
    db[historyString].push({
      id: db[historyString].length + 1,
      [idString]: record.id,
      fecha: new Date().toISOString(),
      new_values: newValues,
      is_new_value: false,
      is_deleted: false
    });
    fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf8");
  } else {
    console.log(`No se encontró el registro con id ${id} en la tabla ${table}`);
  }
}

// CLI arguments
const args = process.argv.slice(2);
const command = args[0];
const table = args[1];
const newValues = JSON.parse(args[2] || "{}");
const id = args[3];
if (command === "generate") {
  generateDb();
}
else if (command === "insert") {
  const record = newValues;
  insertRecord(table, record);
} else if (command === "delete") {
  deleteRecord(table, Number(id));
} else if (command === "update") {
  updateRecord(table, Number(id), newValues);
} else {
  console.log("Comando no reconocido");
}
