'use strict';

angular.module('lion.guardians.lions.controllers', [])

.controller('LionCtrl', ['$scope', '$rootScope', '$state', '$uibModal', 'NotificationFactory', 'LincServices', 'organizations', 'lion', function ($scope, $rootScope, $state, $uibModal, NotificationFactory, LincServices, organizations, lion) {

  $scope.lion = lion;

  var labels = function (damages, labels){
    var label = "";
    labels.forEach(function (elem, i){
      label += damages[elem];
      if(i<labels.length-1) label += ', ';
    });
    return label;
  }

  var eye_damages    = {'EYE_DAMAGE_BOTH': 'Both', 'EYE_DAMAGE_LEFT': 'Left', 'EYE_DAMAGE_RIGHT': 'Right'};
  var broken_teeths  = {'TEETH_BROKEN_CANINE_LEFT': 'Canine Left', 'TEETH_BROKEN_CANINE_RIGHT': 'Canine Right', 'TEETH_BROKEN_INCISOR_LEFT': 'Incisor Left', 'TEETH_BROKEN_INCISOR_RIGHT': 'Incisor Right'};
  var ear_markings   = {'EAR_MARKING_BOTH': 'Both', 'EAR_MARKING_LEFT': 'Left', 'EAR_MARKING_RIGHT': 'Right'};
  var mount_markings = {'MOUTH_MARKING_BACK': 'Back', 'MOUTH_MARKING_FRONT': 'Front', 'MOUTH_MARKING_LEFT': 'Left', 'MOUTH_MARKING_RIGHT': 'Right'};
  var tail_markings  = {'TAIL_MARKING_MISSING_TUFT': 'Missing Tuft'};
  var nose_color     = {'NOSE_COLOUR_BLACK': 'Black', 'NOSE_COLOUR_PATCHY': 'Patchy', 'NOSE_COLOUR_PINK': 'Pynk', 'NOSE_COLOUR_SPOTTED': 'Spotted'};
  var scars          = {'SCARS_BODY_LEFT': 'Body Left', 'SCARS_BODY_RIGHT': 'Body Right', 'SCARS_FACE': 'Face', 'SCARS_TAIL': 'Tail'};

  var Set_Tags = function(){
    var TAGS = [];
    try{
      TAGS = JSON.parse($scope.lion.tags);
    }catch(e){
      TAGS = $scope.lion.tags.split(",");
    }
    $scope.lion.eye_damage = labels(eye_damages,_.intersection(TAGS, ['EYE_DAMAGE_BOTH', 'EYE_DAMAGE_LEFT', 'EYE_DAMAGE_RIGHT']));
    $scope.lion.broken_teet = labels(broken_teeths,_.intersection(TAGS, ['TEETH_BROKEN_CANINE_LEFT', 'TEETH_BROKEN_CANINE_RIGHT', 'TEETH_BROKEN_INCISOR_LEFT', 'TEETH_BROKEN_INCISOR_RIGHT']));
    $scope.lion.ear_markings = labels(ear_markings,_.intersection(TAGS, ['EAR_MARKING_BOTH', 'EAR_MARKING_LEFT', 'EAR_MARKING_RIGHT']));
    $scope.lion.mount_markings =labels(mount_markings, _.intersection(TAGS, ['MOUTH_MARKING_BACK', 'MOUTH_MARKING_FRONT', 'MOUTH_MARKING_LEFT', 'MOUTH_MARKING_RIGHT']));
    $scope.lion.tail_markings = labels(tail_markings,_.intersection(TAGS, ['TAIL_MARKING_MISSING_TUFT']));
    $scope.lion.nose_color = labels(nose_color,_.intersection(TAGS, ['NOSE_COLOUR_BLACK', 'NOSE_COLOUR_PATCHY', 'NOSE_COLOUR_PINK', 'NOSE_COLOUR_SPOTTED']));
    $scope.lion.scars = labels(scars,_.intersection(TAGS, ['SCARS_BODY_LEFT', 'SCARS_BODY_RIGHT', 'SCARS_FACE']));
  };
  Set_Tags();
  // Metadata Options
  $scope.metadata_options = { type: 'lion', edit: 'edit', data: $scope.lion};
  // Updated in Metadata
  $scope.update_lion = function (data){
    _.merge($scope.lion, $scope.lion, data);
    $scope.lion.organization =  _.find(organizations, {id: $scope.lion.organization_id}).name;
    Set_Tags();
  }
  // Image Gallery
  $scope.gallery_options = { type: 'lion', edit: 'edit', id: $scope.lion.primary_image_set_id};
  // Location History
  $scope.location_options = { type: 'lion', lion_id: $scope.lion.id};

  $scope.location_goto = function (imageset_id){
    $state.go("imageset", {id: imageset_id});
  }
  $scope.goto_search_imageset = function (){
    $state.go("searchimageset", {filter: {id: lion.primary_image_set_id}});
  }

  $scope.Delete = function (){
    $scope.modalTitle = 'Delete Lion';
    $scope.modalMessage = 'Are you sure you want to delete the lion?';
    $scope.SucessMessage = 'Lions was successfully deleted.';
    $scope.ErrorMessage = 'Unable to delete this Lion.';
    $scope.modalContent = 'Form';
    $scope.modalInstance = $uibModal.open({
        templateUrl: 'Delete.tmpl.html',
        scope:$scope
    });
    $scope.modalInstance.result.then(function (result) {
      LincServices.DeleteLion($scope.lion.id, function(results){
        NotificationFactory.success({
          title: $scope.modalTitle, message: $scope.SucessMessage,
          position: "right", // right, left, center
          duration: 2000     // milisecond
        });
        LincServices.ClearAllCaches();
        $rootScope.remove_history('lion', $scope.lion.id);
        $state.go("searchlion");
      },
      function(error){
        NotificationFactory.error({
          title: "Fail: "+$scope.modalTitle, message: $scope.ErrorMessage,
          position: 'right', // right, left, center
          duration: 5000   // milisecond
        });
      });
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
    $scope.ok = function (){
      $scope.modalInstance.close();
    }
    $scope.cancel = function(){
      $scope.modalInstance.dismiss();
    }
  };
}])

.controller('SearchLionCtrl', ['$scope', 'lions', 'lion_filters', function ($scope, lions, lion_filters) {

  $scope.lions = lions;

  $scope.organizations = lion_filters.organizations;
  //$scope.isCollapsed = true;
  $scope.isAgeCollapsed = lion_filters.isAgeCollapsed;
  $scope.isOrgCollapsed = lion_filters.isOrgCollapsed;
  $scope.isNameIdCollapsed = lion_filters.isNameIdCollapsed;
  // Filters  scopes
  //$scope.LionAge = { min: 0, max: 30, ceil: 30, floor: 0 };
  $scope.LionAge = lion_filters.LionAge;
  //$scope.name_or_id ='';
  $scope.name_or_id = lion_filters.name_or_id;
  // Order by
  //$scope.reverse = false;
  $scope.reverse = lion_filters.reverse;
  //$scope.predicate = 'id';
  $scope.predicate = lion_filters.predicate;

  $scope.order = function(predicate) {
    $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
    $scope.predicate = predicate;
    lion_filters.predicate = $scope.predicate;
    lion_filters.reverse = $scope.reverse;
  };
  $scope.PerPages = [{'index': 0, 'label' : '10 Lions'}, {'index': 1, 'label' : '20 Lions'}, {'index': 2, 'label' : '30 Lions'}, {'index': 4, 'label' : 'All Lions'}];

  $scope.PerPage = lion_filters.PerPage;
  $scope.changeItensPerPage = function(){
    var min_val = ($scope.filtered_lions==undefined) ? $scope.lions.length : $scope.filtered_lions.length;
    switch ($scope.PerPage){
      case 0:
        $scope.itemsPerPage = Math.min(10, min_val);
        lion_filters.PerPage = $scope.PerPages[0].index;
      break;
      case 1:
        $scope.itemsPerPage = Math.min(20, min_val);;
        lion_filters.PerPage = $scope.PerPages[1].index;
      break;
      case 2:
        $scope.itemsPerPage = Math.min(30, min_val);;
        lion_filters.PerPage = $scope.PerPages[2].index;
      break;
      default:
        $scope.itemsPerPage = $scope.lions.length;
        lion_filters.PerPage = $scope.PerPages[3].index;;
    }
  }
  $scope.changeItensPerPage();
  //$scope.currentPage = 0;
  $scope.currentPage = lion_filters.currentPage;
  // Change Name_or_Id input
  $scope.change_name_or_id = function(){
    lion_filters.name_or_id = $scope.name_or_id;
    $scope.setPage(0);
  }
  $scope.change_organizations = function(){
    $scope.setPage(0);
  }
  $scope.change_age_colapsed = function(){
    $scope.isAgeCollapsed = !$scope.isAgeCollapsed
    lion_filters.isAgeCollapsed = $scope.isAgeCollapsed;
  }
  $scope.change_org_colapsed = function(){
    $scope.isOrgCollapsed = !$scope.isOrgCollapsed
    lion_filters.isOrgCollapsed = $scope.isOrgCollapsed;
  }
  $scope.change_name_id_colapsed = function(){
    $scope.isNameIdCollapsed = !$scope.isNameIdCollapsed
    lion_filters.isNameIdCollapsed = $scope.isNameIdCollapsed;
  }

  $scope.setPage = function(n) {
    $scope.currentPage = n;
    lion_filters.currentPage = $scope.currentPage;
  };
  $scope.prevPage = function() {
    if ($scope.currentPage > 0)
      $scope.setPage($scope.currentPage - 1);
  };
  $scope.nextPage = function() {
    if ($scope.currentPage < $scope.pageCount()-1)
      $scope.setPage($scope.currentPage + 1);
  };
  $scope.firstPage = function() {
    $scope.setPage(0)
  };
  $scope.lastPage = function() {
    if ($scope.currentPage < $scope.pageCount()-1)
      $scope.setPage($scope.pageCount()-1);
  };
  $scope.prevPageDisabled = function() {
    return $scope.currentPage === 0 ? "disabled" : "";
  };
  $scope.nextPageDisabled = function() {
    return ($scope.currentPage === $scope.pageCount()-1 || !$scope.pageCount())? "disabled" : "";
  };
  $scope.pageCount = function() {
    return Math.ceil($scope.filtered_lions.length/$scope.itemsPerPage);
  };
  $scope.range = function() {
    var rangeSize = Math.min(5, $scope.pageCount());
    var ret = [];
    var start = $scope.currentPage -3;
    if ( start < 0 ) start = 0;
    if ( start > $scope.pageCount()-(rangeSize-3) ) {
      start = $scope.pageCount()-rangeSize+1;
    }
    var max = Math.min(start+rangeSize,$scope.pageCount());
    for (var i=start; i<max; i++) {
      ret.push(i);
    }
    return ret;
  };
  $scope.viewer_label = function(){
    var label = "0 lions found";
    if($scope.filtered_lions){
      label = ($scope.filtered_lions.length).toString() + " lions found - " +
              ($scope.currentPage*$scope.itemsPerPage+1).toString() + " to " +
              (Math.min((($scope.currentPage+1)*$scope.itemsPerPage),$scope.filtered_lions.length)).toString();
    }
    return label;
  }

}]);
