/**
 * Script cliente para instanciar workers
 * @module manager-worker/client
 */
var program = require('commander'),
    Worker = require(__dirname + '/worker'),
    os = require("os");

/**
 * Comando para crear un worker
 * @function comando default
 * @param host -h | --host Dirección del servidor default=localhost
 * @param port -p | --port Puerto default=3000
 */
program
    .description('Crea un worker')
    .option('-h, --host', 'Dirección del servidor (default=localhost)')
    .option('-p, --port <n>', 'Puerto del servidor (default=3000)', parseInt);

program.parse(process.argv);

program.host = program.host || os.hostname();
program.port = program.port || 3000;

var pid = os.hostname() + '-' + Date.now();
// instancio un Worker enviando al constructor el host, puerto del servidor y el pid del actual proceso.
var worker = new Worker(program.host, program.port, pid);
// el Worker se agrega al servidor (Manager).
worker.add();

console.log('Worker ' + pid + ' esperando por trabajo de: ' + program.host + ':' + program.port);

process.on('SIGINT', function () {
    worker.remove();
});
