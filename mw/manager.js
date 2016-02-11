var net = require('net'),
    actorify = require('actorify');

/**
 * Abstraccion del worker para que el Manager opere con un entidad estandar.
 * Un objeto Node actua como interfaz adaptador, para que el Manager pueda comunicarse con los Workers.
 * @class Node
 * @param {Manager} manager Objeto Manager que necesita conocer el Worker asi sabe a quien responder cuando necesita enviar un mensaje.
 * @param {int} pid     pid del Worker para identificarlo en la red. Utilizar el pid para identificar un worker en una red no es la mejor opcion pero lo implemente asi para no complicar el ejercicio.
 */
var Node = function Node(manager, pid) {
  var self = this;
  this.manager = manager;
  this.actor = manager.actor;
  this.pid = pid;

  /**
   * Metodo del objeto Node que se encarga de comunicarse con el Worker asociado para avisarle que comience a trabajar.
   * @function
   * @memberof Node
   * @param  {int} value Numero de donde partir a calcular fibonacci
   * @param  {int} times Cantidad de pruebas
   */
  this.start = function (value, times) {
    // envio un mensaje: start <pid>. Esto hara que solo reciba el mensaje de start worker asociado a ese pid.
    this.actor.send('start '+self.pid, value, times);
    // declaro un funcion callback que se ejecuta cuando recibo un mensaje 'result' de algun Worker.
    this.actor.on('result', function(pid, result, finish) {
      console.log('Resultado del worker '+pid+': ');
      console.log(result);
      // si el worker me dice que termino le envio un ultimo mensaje dandole permiso a que termine su ejecucion y lo elimino de mi lista de nodos activos.
      if (finish) {
        self.actor.send('end '+pid);
        self.manager.nodes.splice(self.manager.nodes.indexOf(self), 1);
        console.log('Worker '+pid+' termino!');
        // si ya no tengo nodos activos significa que termino la tarea en todos mis workers y por ende termino el trabajo.
        if (self.manager.nodes.length == 0) {
          console.log('Termino el trabajo para todos!');
          process.exit();
        }
      }
    });
  };

  /**
   * Metodo para que la actual instancia de Node se elimine de la lista de workers.
   * @function
   * @memberof Node
   */
  this.remove = function() {
    self.manager.nodes.splice(self.manager.nodes.indexOf(self), 1);
    self.actor.send('removed '+self.pid);
    console.log('El worker ' + self.pid + ' se desconecto.');
  };
};

/**
 * Manager encargado de ejecutar un servidor, procesar workers y distribuir los trabajos a cada worker
 * @class Manager
 * @param  {int} port Puerto donde va a estar escuchando el servidor.
 */
module.exports = function Manager (port) {
  var self = this;
  this.port = port;
  this.nodes = [];

  // creo un servidor que retorna un socket en su callback el cual lo transformo en un actor.
  net.createServer(function(sock){
    self.actor = actorify(sock);

    // declaro una funcion callback que se ejecuta cuando recibo un mensaje 'add' de alguno de los workers.
    self.actor.on('add', function(workerPid){
      // creo un objeto Node y lo agrego al listado de nodes activos
      self.nodes.push(new Node(self, workerPid));
    });

    // declaro una funcion callback que se ejecuta cuando recibo un mensaje 'remove' de alguno de los workers.
    self.actor.on('remove', function(workerPid){
      // retorno un array de nodos con todos los nodos que son distintos al node que quiere salir
      var node = self.nodes.find(function (node) {
        return (node.pid === workerPid);
      });
      if (node) {
        node.remove();
      }
    });
  }).listen(this.port);

  /**
   * Metodo que permite comenzar la ejecucion de los workers conectados.
   * @function
   * @memberof Manager
   * @param  {int} value Numero de donde partir a calcular fibonacci
   * @param  {int} times Cantidad de pruebas
   * @return {boolean}       Retorna true si se puede ejecutar la tarea o false en caso contrario
   */
  this.start = function (value, times) {
    if (self.nodes.length == 0) {
      console.log('El Manager no encuentra Workers disponibles.');
      return false;
    }
    // activo todos mis nodos
    self.nodes.forEach(function (node) {
      node.start(value, times);
    });
    return true;
  };
};
