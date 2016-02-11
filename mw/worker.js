var net = require('net'),
    usage = require('usage'),
    actorify = require('actorify');

/**
 * Funcion para calcular fibonacci a partir de un numero
 * @function
 * @param  {int} n
 * @return {int}   Resultado
 */
function fib(n) {
  if (n<2)
    return 1;
  else
    return fib(n-2) + fib(n-1);
}

/**
 * Function Object que se exporta como modulo en Node.js y permite instanciar un objeto Worker
 * @class Worker
 * @param  {string} host Dirección del servidor
 * @param  {int} port Puerto del servidor
 * @param  {int} clientPid  Pid del proceso cliente
 */
module.exports = function Worker (host, port, clientPid) {
  var self = this;
  // me conecto al servidor y transformo el socket en un Actor.
  this.server = actorify(net.connect({host: host, port: port}));
  this.pid = clientPid;

  /**
   * Metodo del Worker para incorporarse al Manager
   * @function
   * @memberof Worker
   */
  this.add = function () {
    // envia el mensaje 'add' al Manager para avisarle que quiere incorporarse a su listado de Workers.
    this.server.send('add', this.pid);
    // define una funcion callback que se ejecuta una sola vez cuando recibe el mensaje 'start <actual_pid>'.
    this.server.once('start '+this.pid, function (value, times) {
      self.calc(value, times);
    });
    // define una funcion callback que se ejecuta una sola vez cuando recibe el mensaje 'end <actual_pid>'.
    this.server.once('end '+this.pid, function (value, times) {
      console.log('Termine!');
      process.exit();
    });
  };

  /**
   * Metodo del Worker para salir del listado de nodos del servidor.
   * @function
   * @memberof Worker
   */
  this.remove = function () {
    // envia el mensaje 'add' al Manager para avisarle que quiere incorporarse a su listado de Workers.
    this.server.send('remove', this.pid);
    // define una funcion callback que se ejecuta una sola vez cuando recibe el mensaje 'end <actual_pid>'.
    this.server.once('removed '+this.pid, function (value, times) {
      console.log('Me desconecte!');
      process.exit();
    });
  };

  /**
   * Metodo del Worker para calcular fibonacci una x cantidad de veces, mientras analiza el consumo de memoria y procesamiento de la operacion en curso.
   * @function
   * @memberof Worker
   * @param  {int} value Numero de donde partir a calcular fibonacci
   * @param  {int} times Cantidad de pruebas
   */
  this.calc = function (value, times) {
    var interval;
    var i = 1;
    // defino un intervalo que se ejecuta cada 2000 ms. No era algo necesario en esto, pero lo agregue para dar cierto tiempo de delay entre cada prueba.
    interval = setInterval(function () {
      var pid = process.pid;
      var options = { keepHistory: true }
      console.log('Prueba ' + i + '. Calcular fibonacci para: '+value);
      fib(value);
      usage.lookup(pid, options, function(err, result) {
        console.log('Resultado: ');
        console.log(result);
        // envio los resultados a mi Manager
        self.server.send('result', self.pid, result, (times == 0));
      });
      i++;
      times--;
      if (times == 0) {
        // cuando terminaron todas las pruebas, elimino el intervalo que cree.
        clearInterval(interval);
      }
      // al finalizar la prueba borro la auditoria que se realizo sobre la carga de memoria y procesamiento actual.
      usage.clearHistory(pid);
    }, 2000);
  };
};
