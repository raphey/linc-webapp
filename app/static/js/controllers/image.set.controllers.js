'use strict';

angular.module('lion.guardians.image.set.controllers', [])

.controller('ImageSetCtrl', ['$scope', '$rootScope', '$state', '$timeout', '$uibModal', '$interval', 'NotificationFactory', 'LincServices', 'organizations', 'imageset', function ($scope, $rootScope, $state, $timeout, $uibModal, $interval, NotificationFactory, LincServices, organizations, imageset) {

  $scope.imageset = imageset;

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
  var nose_color     = {'NOSE_COLOUR_BLACK': 'Black', 'NOSE_COLOUR_PATCHY': 'Patchy', 'NOSE_COLOUR_PINK': 'Pink', 'NOSE_COLOUR_SPOTTED': 'Spotted'};
  var scars          = {'SCARS_BODY_LEFT': 'Body Left', 'SCARS_BODY_RIGHT': 'Body Right', 'SCARS_FACE': 'Face', 'SCARS_TAIL': 'Tail'};

  var Set_Tags = function(){
    if($scope.imageset.cvresults) $scope.imageset["action"] = 'cvresults';
    else if($scope.imageset.cvrequest) $scope.imageset["action"] = 'cvpending';
    else $scope.imageset["action"] = 'cvrequest';

    var TAGS = [];
    try{
      TAGS = JSON.parse($scope.imageset.tags);
    }catch(e){
      TAGS = $scope.imageset.tags.split(",");
    }
    $scope.imageset.eye_damage = labels(eye_damages,_.intersection(TAGS, ['EYE_DAMAGE_BOTH', 'EYE_DAMAGE_LEFT', 'EYE_DAMAGE_RIGHT']));
    $scope.imageset.broken_teet = labels(broken_teeths,_.intersection(TAGS, ['TEETH_BROKEN_CANINE_LEFT', 'TEETH_BROKEN_CANINE_RIGHT', 'TEETH_BROKEN_INCISOR_LEFT', 'TEETH_BROKEN_INCISOR_RIGHT']));
    $scope.imageset.ear_markings = labels(ear_markings,_.intersection(TAGS, ['EAR_MARKING_BOTH', 'EAR_MARKING_LEFT', 'EAR_MARKING_RIGHT']));
    $scope.imageset.mount_markings =labels(mount_markings, _.intersection(TAGS, ['MOUTH_MARKING_BACK', 'MOUTH_MARKING_FRONT', 'MOUTH_MARKING_LEFT', 'MOUTH_MARKING_RIGHT']));
    $scope.imageset.tail_markings = labels(tail_markings,_.intersection(TAGS, ['TAIL_MARKING_MISSING_TUFT']));
    $scope.imageset.nose_color = labels(nose_color,_.intersection(TAGS, ['NOSE_COLOUR_BLACK', 'NOSE_COLOUR_PATCHY', 'NOSE_COLOUR_PINK', 'NOSE_COLOUR_SPOTTED']));
    $scope.imageset.scars = labels(scars,_.intersection(TAGS, ['SCARS_BODY_LEFT', 'SCARS_BODY_RIGHT', 'SCARS_FACE']));
  };
  Set_Tags();
  // Metadata Options
  $scope.metadata_options = { type: 'imageset', edit: 'edit', data: $scope.imageset};
  // Updated in Metadata
  $scope.update_imageset = function (data){
    _.merge($scope.imageset, $scope.imageset, data);
    $scope.imageset.organization = _.find(organizations, {'id': $scope.imageset.owner_organization_id}).name;
    Set_Tags();
  }
  // Image Gallery
  $scope.gallery_options = { type: 'imageset', edit: 'edit', id: $scope.imageset.id};
  // Location History
  var label = 'Image Set ' + $scope.imageset.id;
  var date = (new Date($scope.imageset.updated_at)).toLocaleDateString();
  $scope.location_options = { type: 'imageset', history: { count: 1,
                 locations: [{'id': $scope.imageset.id, 'label': label, 'updated_at': date, 'longitude': $scope.imageset.longitude, 'latitude': $scope.imageset.latitude }]}
  };

  $scope.location_goto = function (imageset_id){
    //$state.go("imageset", {id: imageset_id});
  }

  $scope.Delete = function (){
    $scope.modalTitle = 'Delete Image Set';
    $scope.modalMessage = 'Are you sure you want to delete the Image Set?';
    $scope.SucessMessage = 'Lions was successfully deleted.';
    $scope.ErrorMessage = 'Unable to delete this Image Set.';
    $scope.modalContent = 'Form';
    $scope.modalInstance = $uibModal.open({
        templateUrl: 'Delete.tmpl.html',
        scope:$scope
    });
    $scope.modalInstance.result.then(function (result) {
      LincServices.DeleteImageSet($scope.imageset.id, function(results){
        NotificationFactory.success({
          title: $scope.modalTitle, message: $scope.SucessMessage,
          position: "right", // right, left, center
          duration: 2000     // milisecond
        });
        LincServices.ClearAllCaches();
        $rootScope.remove_history('imageset', $scope.imageset.id);
        $state.go("searchimageset");
      },
      function(error){
        NotificationFactory.error({
          title: "Fail: " + $scope.modalTitle, message: $scope.ErrorMessage,
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
  var requestCVResults = function (ReqObjid){
    NotificationFactory.info({
      title: "Notify", message:'Trying to get CV Results',
      position: "right", // right, left, center
      duration: 2000     // milisecond
    });
    LincServices.putCVResults(ReqObjid, function(result){
      var cvresult = result.data.data;
      if(cvresult.status == "queued"){
        $scope.imageset.action = 'cvresults';
        $scope.imageset.cvresults = cvresult.obj_id;
        cancel_intervals();
      }
      else if (cvresult.status == "error"){
        NotificationFactory.error({
          title: "Error", message: 'Unable to Get CV Results',
          position: 'right', // right, left, center
          duration: 5000   // milisecond
        });
      }
    }, function(error){
      cancel_intervals();
    });
  }
  $scope.CVReqSuccess = function (imageset_Id, requestObj) {
    $scope.imageset.action = 'cvpending';
    $scope.imageset.cvrequest = requestObj.obj_id;
    console.log('Success CV Request');
    $timeout(function() {
      LincServices.postCVResults(requestObj.id, function(result){
        var cvresult = result.data.data;
        if(cvresult.status == "finished"){
          $scope.imageset.action = 'cvresults';
          $scope.imageset.cvresults = cvresult.obj_id;
          console.log('Success Results CV');
        }
        else if (cvresult.status == "queued"){
          $scope.requesCVpromise = $interval(
            requestCVResults('PUT', requestObj.id), 60000);
        }
        else{
          NotificationFactory.error({
            title: "Error", message: 'Unable to Get CV Results',
            position: 'right', // right, left, center
            duration: 5000   // milisecond
          });
        }
      });
    }, 180000);
  };

  $scope.Change_results = function (change, ImagesetId) {
    $scope.imageset["action"] = 'cvrequest';
    LincServices.ClearAllImagesetsCaches();
    LincServices.ClearImagesetProfileCache(ImagesetId);
  }
}])

.controller('SearchImageSetCtrl', ['$scope', '$timeout', '$interval', '$stateParams', '$bsTooltip', 'NotificationFactory','LincServices', 'imagesets_filters', 'imagesets', function ($scope, $timeout, $interval, $stateParams, $bsTooltip, NotificationFactory, LincServices, imagesets_filters, imagesets) {

  var tag_labels    = {'EYE_DAMAGE_BOTH': 'Eye Damage Both', 'EYE_DAMAGE_LEFT': 'Eye Damage Left', 'EYE_DAMAGE_RIGHT': 'Eye Damage Right', 'TEETH_BROKEN_CANINE_LEFT': 'Broken Teeth Canine Left', 'TEETH_BROKEN_CANINE_RIGHT': 'Broken Teeth Canine Right', 'TEETH_BROKEN_INCISOR_LEFT': 'Broken Teeth Incisor Left', 'TEETH_BROKEN_INCISOR_RIGHT': 'Broken Teeth Incisor Right',
  'EAR_MARKING_BOTH': 'Ear Marking Both', 'EAR_MARKING_LEFT': 'Ear Marking Left', 'EAR_MARKING_RIGHT': 'Ear Marking Right',
  'MOUTH_MARKING_BACK': 'Mounth Marking Back', 'MOUTH_MARKING_FRONT': 'Mounth Marking Front', 'MOUTH_MARKING_LEFT': 'Mounth Marking Left', 'MOUTH_MARKING_RIGHT': 'Mounth Marking Right', 'TAIL_MARKING_MISSING_TUFT': 'Tail Marking Missing Tuft', 'NOSE_COLOUR_BLACK': 'Nose Color Black', 'NOSE_COLOUR_PATCHY': 'Nose Color Patchy', 'NOSE_COLOUR_PINK': 'Nose Color Pink',
  'NOSE_COLOUR_SPOTTED': 'Nose Color Spotted', 'SCARS_BODY_LEFT': 'Scars Body Left', 'SCARS_BODY_RIGHT': 'Scars Body Right', 'SCARS_FACE': 'Scars Face', 'SCARS_TAIL': 'Scars Tail'};

  var tool_title =  "Eye Damage: Left, Right or Both; Broken Teeth: Canine Left/Right and Incisor Left/Right; \n"; +
    "Ear Marking: Left, Right, or Both; Mounth Marking: Back, Front, Left and Right; \n" +
    "Tail Marking: Missing Tuft; Nose Color: Black, Patchy, Pink, or Spotted; Scars: Body Left/Right, Face and Tail";

  $scope.title_tooltip = {'title': 'tips: ' + tool_title, 'checked': true};

  var get_features = function (tag_labels, TAGS){
    var label = "";
    TAGS.forEach(function (elem, i){
      label += tag_labels[elem];
      if(i<TAGS.length-1) label += ', ';
    });
    return label;
  }

  $scope.imagesets = _.map(imagesets, function(element, index) {
    var elem = {};
    if(element.cvresults) elem["action"] = 'cvresults';
    else if(element.cvrequest) elem["action"] = 'cvpending';
    else  elem["action"] = 'cvrequest';

    var TAGS = [];
    try{ TAGS = JSON.parse(element['tags']);
    }catch(e){ TAGS = element['tags'].split(","); }
    if(TAGS==null) TAGS = [];
    elem['features'] = get_features(tag_labels, TAGS);

    return _.extend({}, element, elem);
  });

  $scope.organizations = imagesets_filters.organizations;
  $scope.genders = imagesets_filters.genders;
  //$scope.isCollapsed = true;
  $scope.isAgeCollapsed = imagesets_filters.isAgeCollapsed;
  $scope.isOrgCollapsed = imagesets_filters.isOrgCollapsed;
  $scope.isNameIdCollapsed = imagesets_filters.isNameIdCollapsed;
  $scope.isFeaturesCollapsed = imagesets_filters.isFeaturesCollapsed;
  $scope.isGenderCollapsed = imagesets_filters.isGenderCollapsed;
  // Filters  scopes
  //$scope.LionAge = { min: 0, max: 30, ceil: 30, floor: 0 };
  $scope.LionAge = imagesets_filters.LionAge;
  //$scope.name_or_id ='';
  $scope.name_or_id = imagesets_filters.name_or_id;
  // tags
  $scope.tag_features = imagesets_filters.features;
  // Order by
  //$scope.reverse = false;
  $scope.reverse = imagesets_filters.reverse;
  //$scope.predicate = 'id';
  $scope.predicate = imagesets_filters.predicate;
  $scope.order = function(predicate) {
    $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
    $scope.predicate = predicate;
    imagesets_filters.predicate = $scope.predicate;
    imagesets_filters.reverse = $scope.reverse;
  };
  $scope.PerPages = [
      {'index': 0, 'label' : '10 Image Sets', 'value': 10, 'disabled': false},
      {'index': 1, 'label' : '20 Image Sets', 'value': 20, 'disabled': imagesets.length < 10 ?  true : false},
      {'index': 2, 'label' : '30 Image Sets', 'value': 30, 'disabled': imagesets.length < 20 ?  true : false},
      {'index': 3, 'label' : '60 Image Sets', 'value': 60, 'disabled': imagesets.length < 30 ?  true : false},
      {'index': 4, 'label' : '100 Image Sets', 'value' : 100, 'disabled': imagesets.length < 60 ?  true : false}
    ];

  $scope.PerPage = imagesets_filters.PerPage;
  $scope.changeItensPerPage = function(){
    $scope.setPage(0);
    var min_val = ($scope.filtered_image_sets==undefined) ? $scope.imagesets.length : $scope.filtered_image_sets.length;
    switch ($scope.PerPage){
      case 0:
        $scope.itemsPerPage = Math.min(10, min_val);
        imagesets_filters.PerPage = $scope.PerPages[0].index;
      break;
      case 1:
        $scope.itemsPerPage = Math.min(20, min_val);;
        imagesets_filters.PerPage = $scope.PerPages[1].index;
      break;
      case 2:
        $scope.itemsPerPage = Math.min(30, min_val);;
        imagesets_filters.PerPage = $scope.PerPages[2].index;
      break;
      case 3:
        $scope.itemsPerPage = Math.min(60, min_val);;
        imagesets_filters.PerPage = $scope.PerPages[2].index;
      break;
      default:
        $scope.itemsPerPage = Math.min(100, min_val);;
        imagesets_filters.PerPage = $scope.PerPages[3].index;;
    }
  }

  // Change Name_or_Id input
  $scope.change_name_or_id = function(){
    imagesets_filters.name_or_id = $scope.name_or_id;
    $scope.setPage(0);
  }
  $scope.change_organizations = function(){
    $scope.setPage(0);
  }
  $scope.change_features = function(){
    $scope.setPage(0);
  }
  $scope.change_gender = function(){
    $scope.setPage(0);
  }
  $scope.change_age_colapsed = function(){
    $scope.isAgeCollapsed = !$scope.isAgeCollapsed
    imagesets_filters.isAgeCollapsed = $scope.isAgeCollapsed;
  }
  $scope.change_org_colapsed = function(){
    $scope.isOrgCollapsed = !$scope.isOrgCollapsed
    imagesets_filters.isOrgCollapsed = $scope.isOrgCollapsed;
  }
  $scope.change_name_id_colapsed = function(){
    $scope.isNameIdCollapsed = !$scope.isNameIdCollapsed
    imagesets_filters.isNameIdCollapsed = $scope.isNameIdCollapsed;
  }
  $scope.change_features_is_collapsed = function(){
    $scope.isFeaturesCollapsed = !$scope.isFeaturesCollapsed
    imagesets_filters.isFeaturesCollapsed = $scope.isFeaturesCollapsed;
  }
  $scope.change_gender_colapsed = function(){
    $scope.isGenderCollapsed = !$scope.isGenderCollapsed
    imagesets_filters.isGenderCollapsed = $scope.isGenderCollapsed;
  }
  $scope.setPage = function(n) {
    $scope.currentPage = n;
    imagesets_filters.currentPage = $scope.currentPage;
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
    return Math.ceil($scope.filtered_image_sets.length/$scope.itemsPerPage);
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
    var label = "0 image sets found";
    if($scope.filtered_image_sets != undefined && $scope.filtered_image_sets.length){
      label = ($scope.filtered_image_sets.length).toString() + " image sets found - " +
              ($scope.currentPage*$scope.itemsPerPage+1).toString() + " to " +
              (Math.min((($scope.currentPage+1)*$scope.itemsPerPage),$scope.filtered_image_sets.length)).toString();
    }
    return label;
  }
  $scope.changeItensPerPage();
  // Pagination scopes
  $scope.currentPage = imagesets_filters.currentPage;
  
  var cancel_intervals = function (){
    if($scope.requesCVpromise != null){
      $interval.cancel($scope.requesCVpromise);
      $scope.requesCVpromise = undefined;
      console.log('Interval cancel');
    }
  }

  var requestCVResults = function (index, ReqObjid){
    NotificationFactory.info({
      title: "Notify", message:'Trying to get CV Results',
      position: "right", // right, left, center
      duration: 2000     // milisecond
    });
    LincServices.putCVResults(ReqObjid, function(result){
      var cvresult = result.data.data;
      if(cvresult.status == "queued"){
        $scope.imagesets[index].action = 'cvresults';
        $scope.imagesets[index].cvresults = cvresult.obj_id;
        cancel_intervals();
      }
      else if (cvresult.status == "error"){
        NotificationFactory.error({
          title: "Error", message: 'Unable to Get CV Results',
          position: 'right', // right, left, center
          duration: 5000   // milisecond
        });
      }
    }, function(error){
      cancel_intervals();
    });
  }
  $scope.CVReqSuccess = function (imageset_Id, requestObj) {
    var index = _.indexOf($scope.imagesets, _.find($scope.imagesets, {id: imageset_Id}));
    $scope.imagesets[index].action = 'cvpending';
    $scope.imagesets[index].cvrequest = requestObj.obj_id;
    console.log('Success CV Request');
    $timeout(function() {
      LincServices.postCVResults(requestObj.id, function(result){
        var cvresult = result.data.data;
        if(cvresult.status == "finished"){
          $scope.imagesets[index].action = 'cvresults';
          $scope.imagesets[index].cvresults = cvresult.obj_id;
          console.log('Success Results CV');
        }
        else if (cvresult.status == "queued"){
          $scope.requesCVpromise = $interval(
            requestCVResults('PUT', index, requestObj.id), 60000);
        }
        else{
          NotificationFactory.error({
            title: "Error", message: 'Unable to Get CV Results',
            position: 'right', // right, left, center
            duration: 5000   // milisecond
          });
        }
      });
    }, 180000);
  };
  $scope.Change_results = function (change, ImagesetId) {
    var index = _.indexOf($scope.imagesets, _.find($scope.imagesets, {id: ImagesetId}));
    $scope.imagesets[index]["action"] = 'cvrequest';
    LincServices.ClearAllImagesetsCaches();
    LincServices.ClearImagesetProfileCache(ImagesetId);
  }

  $scope.filters = $stateParams.filter ? $stateParams.filter : {};

  if(Object.keys($scope.filters).length){
    $scope.name_or_id = $scope.filters.hasOwnProperty('name') ? $scope.filters.name : '';
    var id_filter = $scope.filters.hasOwnProperty('id') ? $scope.filters.id : '';
    $scope.name_or_id = $scope.name_or_id + id_filter;
    $scope.LionAge = $scope.filters.hasOwnProperty('age') ? $scope.filters.age : $scope.LionAge;
  }

}]);
