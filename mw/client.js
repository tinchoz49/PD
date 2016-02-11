/**
 * Script cliente para instanciar workers
 * @module manager-worker/client
 */
var program = require('commander'),
    Worker = require(__dirname+'/worker');

/**
 * Comando para crear un worker
 * @function create
 * @param server -s | --server
 * @param port -p | --port
 */
program
  .command('create')
  .description('Crea un worker')
  .option('-s, --server <n>', 'Puerto del servidor', parseInt)
  .action(function(env){
    if (!env.server) this.help();
    // instancio un Worker enviando al constructor el puerto del servidor y el pid del actual proceso.
    var worker = new Worker(env.server, process.pid);
    // el Worker se agrega al servidor (Manager).
    worker.add();
    console.log('Worker '+process.pid+' esperando por trabajo.');
  });

program.parse(process.argv);

// si el script no recibe todas las opciones necesarias muestra en pantalla la ayuda
if (process.argv.length <= 2) {
  program.help();
}
