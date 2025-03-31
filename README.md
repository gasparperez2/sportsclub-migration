# sportsclub-migration

Muchas gracias por la oportunidad, aca van las instrucciones

Esta es una app en node que simula la migración de una base de datos a otra.
Todos los cambios que se hacen en la DB1 van a ser aplicados en la DB2 despues de ejecutar un POST en el endpoint  /api/migrate.

Al ser una base de datos fake, en formato json, hice algunas suposiciones.
- Cada vez que se inserta, modifica o se borra un dato de Usuarios o Sedes, se va a insertar un registro en HistorialUsuarios o HistorialSedes.
- HistorialSedes e HistorialUsuarios tiene el id del registro del historial, el id del registro que esta haciendo referencia, los nuevos valores del registro y dos booleans, uno que indica si el registro fue creado en ese momento, y otro que indica si fue borrado.
- Para simplificar un poco el uso, hice algunos scripts para insertar, borrar y modificar datos que voy a detallar despues.

Primero que nada es importante hacer `npm install` para instalar las dependencias.

Despues, hay 4 scripts para simular la base de datos y se corren de la siguiente manera.


### Generate DB
`node src/db/generate.js generate`

Al correr este comando va a crear un archivo json llamado db1 con 100 objetos en Sedes, Usuario, HistorialSedes y HistorialUsuarios

### INSERT
`node src/db/generate.js insert {nombre de la tabla} {Valores a insertar en formato json}`

Ej: `node src/db/generate.js insert Sedes '{"nombre": "Sede Nueva", "dirección": "Calle 123", "ciudad": "Ciudad Nueva"}'`

Se usa para insertar un valor en la tabla Sedes o Usuarios a la vez que insertarlo en el historial

### UPDATE
`node src/db/generate.js update {nombre de la tabla} {Valores a insertar en formato json} {id del registro a modificar}`

Ej: `node src/db/generate.js update Usuarios '{"nombre": "Juan", "apellido": "Pérez", "email": "juan.perez@mail.com", "teléfono": "123456789", "sede": "Sede Central"}' 1`

Se usa para insertar un valor en la tabla Sedes o Usuarios a la vez que insertarlo en el historial

### DELETE
`node src/db/generate.js delete {nombre de la tabla} {} {id del registro a borrar}`

Ej: `node src/db/generate.js delete Sedes {} 1`

Se usa para borrar un registro en la base de datos a la vez que insertarlo en el historial

### EXPRESS APP

`npm start` Para iniciar la app

#### Request
```
curl -i -H 'Accept: application/json' -d {} http://localhost:3000/api/migrate
```

#### Response
```
HTTP/1.1 200 OK
X-Powered-By: Express
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 197
Date: Mon, 31 Mar 2025 01:40:23 GMT
X-RateLimit-Reset: 1743386094
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept
Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE
Content-Type: application/json; charset=utf-8
Content-Length: 32
ETag: W/"20-ipR43gUqVj3qhiLUHg3K0wXYLbQ"
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Migración exitosa"}
```