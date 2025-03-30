const path = require("path");
const fs = require("fs");
const { logger } = require('../logger.js');

// Migra los datos de db1.json a db2.json
const migrationScript = () => {
    const filePath1 = path.join(__dirname, "../db/db1.json");
    const filePath2 = path.join(__dirname, "../db/db2.json");

    if (!fs.existsSync(filePath1) || !fs.existsSync(filePath2)) {
        logger.error("El archivo db1.json o db2.json no existe.");
        return;
    }
    let db1 = JSON.parse(fs.readFileSync(filePath1, "utf8"));
    let db2 = JSON.parse(fs.readFileSync(filePath2, "utf8"));

    if (!db1.HistorialMigración.length) {
        // Si nunca hubo una migracion, copia todo el contenido de db1 a db2
        db2 = {...db1};
    } else {
        // Si ya hubo migraciones, solo copia los registros nuevos
        // badado en la fecha de la ultima migracion y la fecha de HistorialMigración e HistorialUsuarios
        const last_migration_date = new Date(db1.HistorialMigración[db1.HistorialMigración.length - 1].fecha);
        
        let values_to_append = {
            Usuarios: [],
            HistorialUsuarios: [],
            Sedes: [],
            HistorialSedes: []
        };
        let values_to_update = {
            Usuarios: [],
            Sedes: []
        };
        let values_to_delete = {
            Usuarios: [],
            Sedes: []
        };

        // Recorre el HistorialUsuarios y HistorialSedes de db1 desde el ultimo hasta la fecha de la ultima migracion
        for (let i = db1.HistorialUsuarios.length - 1; i >= 0; i--) {
            current_user_history_date = new Date(db1.HistorialUsuarios[i].fecha);
            if (current_user_history_date > last_migration_date) {
                // Cuando es un append se agrega al principio del array para que se mantenga el orden
                values_to_append.HistorialUsuarios.unshift(db1.HistorialUsuarios[i]);
                if (db1.HistorialUsuarios[i].is_new_value) {
                    values_to_append.Usuarios.unshift(db1.HistorialUsuarios[i].new_values);
                } else if (db1.HistorialUsuarios[i].is_deleted) {
                    values_to_delete.Usuarios.push(db1.HistorialUsuarios[i].user_id);
                } else {
                    values_to_update.Usuarios.push(db1.HistorialUsuarios[i].new_values);
                }
            } else break
        }
        for (let i = db1.HistorialSedes.length - 1; i >= 0; i--) {
            current_sede_history_date = new Date(db1.HistorialSedes[i].fecha);
            if (current_sede_history_date > last_migration_date) {
                values_to_append.HistorialSedes.unshift(db1.HistorialSedes[i]);
                if (db1.HistorialSedes[i].is_new_value) {
                    values_to_append.Sedes.unshift(db1.HistorialSedes[i].new_values);
                } else if (db1.HistorialSedes[i].is_deleted) {
                    values_to_delete.Sedes.push(db1.HistorialSedes[i].sede_id);
                } else {
                    values_to_update.Sedes.push(db1.HistorialSedes[i].new_values);
                }
            } else break
        }
        
        // Valores a agregar a db2
        db2.Usuarios.push(...values_to_append.Usuarios);
        db2.HistorialUsuarios.push(...values_to_append.HistorialUsuarios);
        db2.Sedes.push(...values_to_append.Sedes);
        db2.HistorialSedes.push(...values_to_append.HistorialSedes);
        
        // Valores a eliminar de db2
        db2.Usuarios = db2.Usuarios.filter(user => !values_to_delete.Usuarios.includes(user.id));
        db2.Sedes = db2.Sedes.filter(sede => !values_to_delete.Sedes.includes(sede.id));

        // Valores a actualizar de db2
        for (let i = 0; i < values_to_update.Usuarios.length; i++) {
            const user = db2.Usuarios.find(user => user.id === values_to_update.Usuarios[i].id);
            if (user) {
                Object.assign(user, values_to_update.Usuarios[i]);
            }
        }
        for (let i = 0; i < values_to_update.Sedes.length; i++) {
            const sede = db2.Sedes.find(sede => sede.id === values_to_update.Sedes[i].id);
            if (sede) {
                Object.assign(sede, values_to_update.Sedes[i]);
            }
        }
    }
    
    // Agregar el historial de migración a ambos archivos
    migrationHistory = {
        id: db1.HistorialMigración.length + 1,
        source: "db1.json",
        target: "db2.json",
        fecha: new Date().toISOString(),
    }
    db1.HistorialMigración = [...db1.HistorialMigración, migrationHistory];
    db2.HistorialMigración = [...db2.HistorialMigración, migrationHistory];

    // Guardar los cambios en ambos archivos
    fs.writeFileSync(filePath1, JSON.stringify(db1, null, 4), "utf8");
    fs.writeFileSync(filePath2, JSON.stringify(db2, null, 4), "utf8");
}

module.exports = {
    migrationScript
};