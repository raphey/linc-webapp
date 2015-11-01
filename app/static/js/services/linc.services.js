angular.module('lion.guardians.services', [])

.factory('LincServices', ['$http', '$cacheFactory', '$q', 'notificationFactory', function($http, $cacheFactory, $q, notificationFactory) {

  var urlBase = 'http://localhost:5080';
  var $httpcache = $cacheFactory.get('$http');

  var databases = {};
    databases['lions'] =         {label: 'Lions List', url: '/lions/list'};
    databases['organizations'] = {label: 'Organizations List',  url: '/organizations/list'};
    databases['imagesets'] =     {label: 'Imagesets List', url: '/imagesets/list'};
    databases['images'] =        {label: 'Images List', url: '/images/list'};

  var Get = function (url, label){
    //var url = base + path;
    var cache = $httpcache.get(url);
    var deferred = $q.defer();
    if(cache){
      var responde = JSON.parse(cache[1]);
      deferred.resolve(responde);
    }
    else{
      $http.get(url, {cache: true})
      .success(function (response) {
        deferred.resolve(response);
      })
      .error(function (error) {
        notificationFactory.error({
          title: "Error", message: 'Unable to load ' + label + ' data',
          position: 'right', // right, left, center
          duration: 5000   // milisecond
        });
        deferred.reject(error);
      });
    }
    return deferred.promise;
  }
  var GetLists = function(names, fn){
    var requests = [];
    var promises = names.map(function(name) {
      var url = databases[name].url;
      var label = databases[name].label;
      return Get(url, label);
    });
    $q.all(promises).then(function (results) {
      var dados = {};
      results.forEach( function (result, index) {
        var key = names[index];
        dados[key] = result.data;
      })
      /*notificationFactory.success({
        title: "Database", message:'Database Successfully Loaded',
        position: "right", // right, left, center
        duration: 2000     // milisecond
      });*/
      fn(dados);
    },
    function (reason) {
      console.log(reason);
    });
  };
  var Get_All_Lists = function (fn) {
    var names = Object.keys(databases);
    return (GetLists(names,fn));
  }
  // Get Datas
  var dataFactory = {};

  dataFactory.getlists = GetLists;
  dataFactory.getAlllists = Get_All_Lists;

  return dataFactory;
}]);
