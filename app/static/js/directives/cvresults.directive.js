'use strict';

angular.module('lion.guardians.cvresults.directive', [])

.directive('cvresults', function($uibModal) {
    return {
        transclude: true,
        restrict: 'EA',
        scope : true ,
        template: function(element, attrs) {
          switch (attrs.type) { //view selection. Put type='new' or type='search'
            case 'search':
              return '<button class="btn btn-primary" data-animation="am-fade-and-slide-top" ng-click="show()"><i class="icon icon-flash"></i>CV Results</button>';
            default:
              return '<p><a class="btn btn-lg btn-default btn-block" data-animation="am-fade-and-slide-top" ng-click="show()"><i class="icon icon-flash"></i> VIEW CV RESULTS</a></p>';
          }
        },
        scope: {
          useTemplateUrl: '@',
          useCtrl: '@',
          formSize: '@',
          imagesetId: '='
        },
        link: function(scope, element, attrs) {
          scope.show = function(){
            var modalInstance = $uibModal.open({
              animation: true,
              backdrop: true,
              templateUrl: scope.useTemplateUrl,
              controller:  scope.useCtrl,
              size: scope.formSize,
              resolve: {
                imagesetId: function () {
                  return scope.imagesetId;
                }
              }
            });
            modalInstance.result.then(function (result) {
              //scope.gotoImagesetAction();
              console.log('Modal ok' + result);
            }, function () {
              console.log('Modal dismissed at: ' + new Date());
            });
          };
        }
    };
})
