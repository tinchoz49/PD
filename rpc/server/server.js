/**
 * Script server para instanciar un servidor que escucha mensajes de lectura y escritura de clientes
 * @module rpc/server
 */

var dnode = require('dnode'),
    fs = require('fs'),
    path = require('path'),
    program = require('commander');

/**
 * Comando para leer un archivo remoto
 * @function comando server
 * @param port -p | --port Puerto (OPCIONAL)
 */
program
    .option('-p, --port <p>', 'Puerto', parseInt)
    .description('leer remotamente un archivo')
    .parse(process.argv);

program.port = program.port || 3000;

/**
 * Instancia server
 * @name server
 * @extends dnode
 */
var server = dnode({
    /**
     * Metodo remoto read que permite leer un archivo local utilizando un buffer.
     * @function
     * @param  {string}   fileName Filepath del archivo
     * @param  {int}   length   Longitud del buffer de lectura
     * @param  {Function} cb       Funcion callback para retornar el resultado
     */
    read: function (fileName, length, cb) {
        debugger;
        // con path.join puedo concatenar paths sin tenerme que preocupar si estoy en windows manejando '\' o en linux usando '/'
        fileName = path.join(__dirname, fileName);
        fs.open(fileName, 'r', function (err, fd) {
            if (err) {
                cb(undefined, undefined, err);
            } else {
                var buffer = new Buffer(length);
                // funcion de fs para leer datos de un archivo mediante un buffer
                fs.read(fd, buffer, 0, buffer.length, null, function (err, bytesRead, buffer) {
                    if (err) {
                        cb(undefined, undefined, err);
                    } else {
                        var mensaje = 'Se realizo una lectura sobre el archivo: ' + fileName;
                        console.log(mensaje);
                        cb(mensaje, bytesRead);
                    }
                });
            }
            // cierro el archivo
            fs.close(fd)
        });
    },
    /**
     * Metodo remoto write que permite escribir un string en un archivo local utilizando un buffer.
     * @function
     * @param  {string}   fileName Filepath del archivo
     * @param  {string}   data     Datos a escribir en el archivo
     * @param  {Function} cb       Funcion callback para retornar el resultado
     */
    write: function (fileName, data, cb) {
        // con path.join puedo concatenar paths sin tenerme que preocupar si estoy en windows manejando '\' o en linux usando '/'
        fileName = path.join(__dirname, fileName);
        // abro el archivo en modo appending
        fs.open(fileName, 'a', function (err, fd) {
            if (err) {
                cb(err);
            } else {
                var buffer = new Buffer(data);
                // funcion de fs para escribir datos en un archivo mediante un buffer
                fs.write(fd, buffer, 0, buffer.length, null, function (err, bytesWrited) {
                    var mensaje = err || 'Se escribieron ' + bytesWrited + ' bytes sobre el archivo: ' + path.basename(fileName);
                    console.log(mensaje);
                    cb(mensaje);
                });
            }
            // cierro el archivo
            fs.close(fd)
        });
    }
});
// inicio el servidor a "escuchar" en el puerto 3000
server.listen(program.port);

console.log('Servidor ejecutandose en el puerto ' + program.port);
