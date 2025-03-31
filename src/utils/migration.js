const path = require("path");
const fs = require("fs");
const { logger } = require('../logger.js');

// Migra los datos de db1.json a db2.json
const migrationScript = () => {
    const filePath1 = path.join(__dirname, "../db/db1.json");
    const filePath2 = path.join(__dirname, "../db/db2.json");

    if (!fs.existsSync(filePath1)) {
        throw new Error("El archivo db1.json no existe.");
    } else if (!fs.existsSync(filePath2)) {
        fs.writeFileSync(filePath2, JSON.stringify({}, null, 4), "utf8");
    }
    let db1 = JSON.parse(fs.readFileSync(filePath1, "utf8"));
    let db2 = JSON.parse(fs.readFileSync(filePath2, "utf8"));

    if (!db1.HistorialMigración.length) {
        // Si nunca hubo una migracion, copia todo el contenido de db1 a db2
        db2 = {...db1};
    } else {
        // Si ya hubo migraciones, solo copia los registros nuevos
        // basado en la fecha de la ultima migracion y la fecha de HistorialMigración e HistorialUsuarios
        const last_migration_date = new Date(db1.HistorialMigración[db1.HistorialMigración.length - 1].fecha);
        
        let history_values = {
            HistorialUsuarios: [],
            HistorialSedes: []
        };

        // Recorre el HistorialUsuarios e HistorialSedes de db1 desde el ultimo hasta la fecha de la ultima migracion
        try {
            // Primero itera el HistorialUsuarios de arriba a abajo para ordenar los registros de manera ascendente
            for (let i = db1.HistorialUsuarios.length - 1; i >= 0; i--) {
                current_user_history_date = new Date(db1.HistorialUsuarios[i].fecha);
                if (current_user_history_date > last_migration_date) {
                    // Hace un append al principio del array para que se mantenga el orden
                    history_values.HistorialUsuarios.unshift(db1.HistorialUsuarios[i]);
                } else break
            }
            // Y despues se iteran los registros ordenados para modificar los valores de Usuarios y Sedes en db2
            // Es importante hacer esto para no perder el orden de los registros
            for (let i = 0; i < history_values.HistorialUsuarios.length; i++) {
                const user_history = history_values.HistorialUsuarios[i];
                if (user_history.is_new_value) {
                    // Agrega el nuevo usuario a db2.Usuarios
                    // Simula un INSERT en SQL
                    db2.Usuarios.push(user_history.new_values);
                }
                else if (user_history.is_deleted) {
                    // Elimina el usuario de db2.Usuarios
                    // Simula un DELETE en SQL
                    db2.Usuarios = db2.Usuarios.filter(user => user.id !== user_history.user_id);
                } else {
                    // Actualiza el usuario en db2.Usuarios
                    // Simula un UPDATE en SQL
                    const user = db2.Usuarios.find(user => user.id === user_history.user_id);
                    if (user) {
                        Object.assign(user, user_history.new_values);
                    }
                }
            }
            // Inserta el historial en la db2
            db2.HistorialUsuarios = [...db2.HistorialUsuarios, ...history_values.HistorialUsuarios];

            // Ahora se hace lo mismo con el HistorialSedes
            for (let i = db1.HistorialSedes.length - 1; i >= 0; i--) {
                current_sede_history_date = new Date(db1.HistorialSedes[i].fecha);
                if (current_sede_history_date > last_migration_date) {
                    history_values.HistorialSedes.unshift(db1.HistorialSedes[i]);
                } else break
            }

            for (let i = 0; i < history_values.HistorialSedes.length; i++) {
                const sede_history = history_values.HistorialSedes[i];
                if (sede_history.is_new_value) {
                    db2.Sedes.push(sede_history.new_values);
                }
                else if (sede_history.is_deleted) {
                    db2.Sedes = db2.Sedes.filter(sede => sede.id !== sede_history.sede_id);
                } else {
                    const sede = db2.Sedes.find(sede => sede.id === sede_history.sede_id);
                    if (sede) {
                        Object.assign(sede, sede_history.new_values);
                    }
                }
            }
            console.log(history_values.HistorialSedes)
            db2.HistorialSedes = [...db2.HistorialSedes, ...history_values.HistorialSedes];
        } catch (error) {
            throw new Error("Error al modificar datos en la db2: " + error.message);
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

    // Guarda los cambios en ambos archivos
    try {
        fs.writeFileSync(filePath1, JSON.stringify(db1, null, 4), "utf8");
        fs.writeFileSync(filePath2, JSON.stringify(db2, null, 4), "utf8");
    } catch (error) {
        throw new Error("Error al guardar los cambios en la base de datos: " + error.message);
    }
}

module.exports = {
    migrationScript
};