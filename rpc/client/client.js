/**
 * Script cliente para leer o escribir sobre un archivo remoto
 * @module rpc/client
 */

var dnode = require('dnode'),
    program = require('commander');

/**
 * Comando para leer un archivo remoto
 * @function comando read
 * @param host -h | --host Dirección del servidor default=localhost
 * @param port -p | --port Puerto default=3000
 * @param file -f | --file Nombre del archivo
 * @param length -l | --length Logitud del buffer
 */
program
    .command('read')
    .option('-h, --host <s>', 'Dirección del servidor (default=localhost)')
    .option('-p, --port <n>', 'Puerto (default=3000)', parseInt)
    .option('-f, --file <s>', 'Nombre del archivo')
    .option('-l, --length <n>', 'Logitud del buffer', parseInt)
    .description('leer remotamente un archivo')
    .action(function (env) {
        var ok = true;
        env.host = env.host || require("os").hostname();
        env.port = env.port || 3000;

        if (!env.file) {
            console.log('Debe indicar un nombre de archivo -f o --file');
            ok = false;
        }

        if (!env.length) {
            console.log('Debe indicar la longitud del buffer -l o --length');
            ok = false;
        }

        if (!(ok)) {
            process.exit(1);
        }

        console.log('Conectandose a ' + env.host + ':' + env.port);
        var d = dnode.connect({
            server: env.host,
            port: env.port
        });
        d.on('remote', function (remote) {
            // callback que se da cuando se abre la conexion y se obtiene el objeto remoto exportado (remote)
            // ejecuto la funcion remota read, enviando los parametros necesarios junto al callback final
            remote.read(env.file, env.length, function (result, bytesReaded, err) {
                if (err) {
                    console.log(err);
                } else {
                    // Buffer es un tipo de objeto de Node.js y permite crear buffers de distintas formas, una de ellas es mediante un string como parametro.
                    var buffer = new Buffer(result);
                    console.log(bytesReaded + ' bytes leidos correctamente de "' + env.file + '"');
                    console.log('Mensaje: ' + buffer.toString('utf8', 0, bytesReaded));
                }
                // cierro la conexion
                d.end();
            });
        });
    });

/**
 * Comando para escribir un archivo remoto
 * @function comando write
 * @param host -h | --host Dirección del servidor default=localhost
 * @param port -p | --port Puerto default=3000
 * @param file -f | --file Nombre del archivo
 * @param data -d | --data Datos/string a escribir en el archivo
 */
program
    .command('write')
    .option('-h, --host <s>', 'Dirección del servidor (default=localhost)')
    .option('-p, --port <n>', 'Puerto (default=3000)', parseInt)
    .option('-f, --file <s>', 'Nombre del archivo')
    .option('-d, --data <s>', 'Datos/string a escribir en el archivo')
    .description('escribir remotamente en un archivo')
    .action(function (env) {
        var ok = true;
        env.host = env.host || require("os").hostname();
        env.port = env.port || 3000;

        if (!env.file) {
            console.log('Debe indicar un nombre de archivo -f o --file');
            ok = false;
        }

        if (!env.data) {
            console.log('Debe indicar un string para escribir en el archivo -d o --data');
            ok = false;
        }

        if (!(ok)) {
            process.exit(1);
        }

        console.log('Conectandose a ' + env.host + ':' + env.port);
        var d = dnode.connect({
            server: env.host,
            port: env.port
        });
        d.on('remote', function (remote) {
            // callback que se da cuando se abre la conexion y se obtiene el objeto remoto exportado (remote)
            // ejecuto la funcion remota write, enviando los parametros necesarios junto al callback final
            remote.write(env.file, env.data, function (result) {
                console.log(result);
                // cierro la conexion
                d.end();
            });
        });
    });

program.parse(process.argv);

// si el script no recibe todas las opciones necesarias muestra en pantalla la ayuda
if (process.argv.length <= 2) {
    program.help();
}
