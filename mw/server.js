/**
 * Script para instanciar un manager (server)
 * @module manager-worker/server
 */
var program = require('commander'),
    Manager = require(__dirname + '/manager'),
    inquirer = require("inquirer");

/**
 * Crea un manager servidor para medir la perfomance de los workers
 * @function comando default
 * @param port -p | --port Puerto default=3000
 */
program
    .description('Crea un manager servidor para medir la perfomance de los workers')
    .option('-p, --port <n>', 'Puerto del servidor (default=3000)', parseInt)
    .option('-f, --fib <n>', 'Numero fibonacci', parseInt)
    .option('-t, --times <n>', 'Cantidad de pruebas', parseInt)
    .parse(process.argv);

program.port = program.port || 3000;

// si no se cargan todas las opciones necesarias por consola, se muestra el informacion de ayuda y termina la ejecucion
if (!program.fib || !program.times) program.help();

// si se cargaron todas las opciones correctamente, se instancia el Manager y queda a la espera
// de que el usuario active el Manager para distribuir la tarea entre los Workers conectados.
console.log("Servidor iniciado en el puerto: " + program.port);

// defino un array de preguntas para utilizar con el modulo inquiry
var questions = [{
    type: "confirm",
    name: "start",
    message: "Quiere comenzar las ejecucion de los workers",
    default: false
}];
// instancia el Manager pasando al constructor un puerto
var manager = new Manager(program.port);

// defino una funcion para mostrar en la terminal la pregunta: Quiere comenzar las ejecucion de los workers?
// si el manager.start retorna que no puede comenzar, vuelve a mostrar la pregunta.
// si el usuario ingresa "no" entonces el servidor finaliza.
function showPrompt() {
    inquirer.prompt(questions, function (answers) {
        if (answers.start) {
            if (!manager.start(program.fib, program.times)) {
                showPrompt();
            }
        } else {
            process.exit();
        }
    });
}

showPrompt();
