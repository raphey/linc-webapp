'use strict';

angular.module('lion.guardians.cvresults.controller', ['lion.guardians.cvresults.directive'])

.controller('CVResultsCtrl', ['$scope', '$state', '$uibModalInstance', 'LincServices', 'NotificationFactory', 'imagesetId', 'cvrequestId', 'cvresults', function ($scope, $state, $uibModalInstance, LincServices, NotificationFactory, imagesetId, cvrequestId, cvresults) {

  $scope.title = 'CV Results';
  $scope.content = 'Form';

  $scope.cvresults = cvresults;

  $scope.Close = function () {
    $uibModalInstance.dismiss("close");
  };
  $scope.open_new_lion = function(id){
    var url = $state.href("lion", { 'id': id },  {absolute: true});
    window.open(url,'_blank');
  }
  $scope.ClearResults= function () {
    LincServices.deleteCVRequest(cvrequestId, function(){
      console.log("Results cleared");
      $uibModalInstance.close(true);
    });
  };
  $scope.Associate = function (id){
    _.forEach($scope.cvresults, function(lion) {
      lion.associated = false;
    });
    var index = _.indexOf($scope.cvresults, _.find($scope.cvresults, {id: id}));
    var data = {'lion_id': id};
    LincServices.Associate(imagesetId, data, function(){
      $scope.cvresults[index].associated = true;
      LincServices.ClearAllCaches();
      NotificationFactory.success({
        title: "Associate", message:'Lion (id: ' + id + ') was associated',
        position: "right", // right, left, center
        duration: 2000     // milisecond
      });
    },
    function(error){
      NotificationFactory.error({
        title: "Error", message: 'Unable to Associate the Lion (id: ' + id + ') ',
        position: 'right', // right, left, center
        duration: 5000   // milisecond
      });
      console.log(error);
    });
  };

  $scope.Dissociate = function (id){
    var index = _.indexOf($scope.cvresults, _.find($scope.cvresults, {id: id}));
    var data = {'lion_id': null};
    LincServices.Associate(imagesetId, data, function(){
      $scope.cvresults[index].associated = false;
      LincServices.ClearAllImagesetsCaches();
      LincServices.ClearImagesetProfileCache(imagesetId);
      NotificationFactory.success({
        title: "Dissociate", message:'Lion (id: ' + id + ') was dissociated',
        position: "right", // right, left, center
        duration: 2000     // milisecond
      });
    },
    function(error){
      NotificationFactory.error({
        title: "Error", message: 'Unable to Dissociate the Lion (id: ' + id + ')',
        position: 'right', // right, left, center
        duration: 5000   // milisecond
      });
      console.log(error);
    });
  };
}]);
