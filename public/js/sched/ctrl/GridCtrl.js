wiwApp.controller('GridCtrl',[
    'SchedFactory',
	'AuthFactory',
    '$rootScope',
    '$scope',
    '$cookies',
    '$state',
	'$mdDialog', 
	'$mdMedia',
	'$filter',
	'uiGridConstants',
    function(SchedFactory,AuthFactory,$rootScope, $scope, $cookies, $state, $mdDialog, $mdMedia,$filter,uiGridConstants){
		
		   /////////////////////////////////////////////////////////
		  ////// 'Class' Object definition for WiW instances //////
		 //////  Just one created per person logged in      //////
		/////////////////////////////////////////////////////////
		var Wiw = {

			init : function(id,tok,callback){
			  /////////////////////////////////////
			 ///// PUBLIC Wiw VARIABLES /////////
			/////////////////////////////////////
			
				this.user_id = parseInt(id);
				this.token = tok;
				this.locations = [];				
				this.user = {};				
				this.xpos = [];
				this.xloc = [];
				this.positions = [];
			  ////////////////////////////////
			 //// PRIVATE Wiw Variables ////
			////////////////////////////////
			
				var wiw = this;
				var user_id = this.user_id;
				var token = this.token;
					
			  ///////////////////////////////////////
			 /////// PRIVATE Wiw Functions ////////
			///////////////////////////////////////
			
				var getUser = function(callback){
					var user = {};
					
					SchedFactory.user.get(
					{
						'id': user_id,
						'W-Token': token
					},
					function(data){

						user = data.user;

						AuthFactory.authSesh.authed(
						{
							'uid': user_id,
							'tok': token
						},
						function(res){ 
							SchedFactory.user_settings.get(null,
							function(result){

								if(result.settings){
									user.settings = result.settings;
								} else {
									user.settings = {};
								}
								
								callback(user);
							},
							function(err){
								console.log(err);
								callback(err);
							});
						},
						function(err){
							console.log(err);
							callback(err);
						});
					});
				};
				var getLoc = function(callback){
					var token = wiw.token;
					var xloc = wiw.xloc = [];
					
					// GET LOCATIONS
					SchedFactory.locations.get(
					{
						'W-Token': token
					}
					,function(data){

						callback(data.locations);
						for(var l in data.locations){
							xloc[data.locations[l].id] = data.locations[l];
						}					
						
					},function(err){
						console.log(err);
						callback(err);
					});
				};
				var getPos  = function(callback){
					var positions = wiw.positions;	
					var token = wiw.token;
					var xpos = wiw.xpos = [];
				
					SchedFactory.positions.get({
						show_deleted: true,
						'W-Token': token
					},function(data){

						positions = data.positions;

						for(var i in positions){
							xpos[parseInt(data.positions[i].id)] = positions[i];
						}
						SchedFactory.blocks.get(
						{
							'W-Token':token
						},function(blkData){

							for(var i in positions){
								positions[i].blocks = [];
								for(var b in blkData.blocks){

									if(blkData.blocks[b].position_id === positions[i].id){
										positions[i].blocks.push(blkData.blocks[b]);
										xpos[parseInt(positions[i].id)].blocks.push(blkData.blocks[b]);
										
									}
								}
							}
							callback(positions);

						},function(err){
							console.log(err);
							callback(err);
						});
					},function(err){
						console.log(err);
						callback(err);
					});
				};
				
				 /////////////////////////////////////////////
				////// CONSTRUCTING THE Wiw Object /////////
			   /////////////////////////////////////////////
				getUser(function(myUser){
					
					wiw.user = myUser;
					
					getLoc(function(locs){
						wiw.locations =  locs;
						
						getPos(function(poss){
							wiw.positions  = poss;
							callback();
							var colors = [];
							var colorStyles = "";
							for(var p in poss){
								if(poss[p].blocks.length){
									for(var b in poss[p].blocks){
										
										if(poss[p].blocks[b].color){
											
											var color = poss[p].blocks[b].color;
											if(!colors[color.toString()]){
												colors[color.toString()] = color;
												var r = parseInt(color.substring(0,2),16);
												var g = parseInt(color.substring(2,4),16);
												var b = parseInt(color.substring(4,6),16);
												colorStyles = colorStyles+ "\n.shift"+color+"{\n "+
													"background: rgba("+r+","+g+","+b+",.7) !important;\n"+
													"background: radial-gradient(rgba(220,220,220,1),rgba("+r+","+g+","+b+",1)) !important;\n"+
													"background: -webkit-radial-gradient(rgba(220,220,220,1),rgba("+r+","+g+","+b+",1)) !important;\n"+
													"}\n";
											}
										}
									}
								}
							}
							$scope.style = colorStyles;
						});	
					});
				});				
			}
		};
		///////////////////////
	   ///// Wiw  END ////////
	  ///////////////////////
  
  
		///////////////////////
	   ///// Site  START /////
	  ///////////////////////
		var Site = function(id,wiw,callback){
			
			  ////////////////////////////////
			 //// PRIVATE Site Variables ////
			////////////////////////////////
			var site = this; // site becomes the way to access public variables from within nested functions
	
			var wiwDateFormat = 'EEE, dd MMM yyyy HH:mm:ss Z';
			var token = wiw.token;
			var users = site.users;
			var xusers = site.xusers;
			var now = new Date();
			var numWeeks = 5;
			var start =  new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				05,00,00);
			var end = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate()+(7*numWeeks), 23,59,58
			);
	
			/////////////////////////////////////////////////////////////////////////
		   /// SETTING GRID OPTIONS AND COLUMN DEFINITIONS FOR EMPLOYEE COLUMNS ////
		  /////////////////////////////////////////////////////////////////////////
			this.gridOptions = {
				
				columnDefs: [],
				data: [],
				enableRowHeaderSelection: false,
				enableSortings : false,
				enableFiltering: true,
				enableCellEdit: false,	
				enableGridMenu: true,
				enableRowSelection: false,
				enableSelectAll: true,
				minRowsToShow: 15,
				modifierKeysToMultiSelectCells: true,
				multiSelect: true,
				showGridFooter: false,
				showColumnFooter: true,
				onRegisterApi: function(gridApi) {
					$scope.gridApi = gridApi;
					var cellTemplate = 'ui-grid/selectionRowHeader';   // you could use your own template here
					$scope.gridApi.core.addRowHeaderColumn( 
					{ 
						name: 'date', 
						field: 'date', 
						'min-width': '4%', 
						width:'4%', 
						'max-width':'40px', 
						type:'date', 
						cellFilter: 'date:"MM/dd"',
						footerCellTemplate:  function(){
							return '<div class="ui-grid-footer-panel ui-grid-footer-aggregates-row"><!-- tfooter --><div class="ui-grid-footer ui-grid-footer-viewport"><div class="ui-grid-footer-canvas center"><div class="ui-grid-footer-cell-wrapper" ng-style="colContainer.headerCellWrapperStyle()"><div role="row" class="center ui-grid-footer-cell-row"><div ui-grid-footer-cell role="gridcell" style="text-align:center" ng-repeat="col in colContainer.renderedColumns track by col.uid" col="col" render-index="$index" class="ui-grid-footer-cell ui-grid-clearfix center">DATE</div></div></div></div></div></div>';
						}
					});
				}				
			};
			
			  /////////////////////////////////////
			 ///// PUBLIC Site VARIABLES /////////
			/////////////////////////////////////
			if(callback){
				this.callbk = callback;
			} else {
				this.callbk = function(){
					
				};
			}
			this.location = wiw.xloc[id];
			this.location_id = id;
			this.xusers = [];
			this.users = [];
			this.start = start;
			this.end = end;
			this.copyPaste = {};
			
			  ///////////////////////////////////////
			 /////// PRIVATE Site Functions ////////
			///////////////////////////////////////
			var getUsers = function(callback){
				
				var location_id = site.location_id;
				
				SchedFactory.users.get(
				{
					'W-Token':	token,
					'location_id':location_id
				},
				function(data){
					callback(data.users);
					
				},
				function(err){
					console.log(err);
					callback(err);
				});
			};
			var getShifts = function(start,end,c,callback){
				SchedFactory.shifts.get(
				{
					'start': start,
					'end':  end,
					'unpublished': true,
					'W-Token': token,
					'location_id': site.location_id
				},function(obj){
					callback(obj,start,c);
				});
			};
			
			  ///////////////////////////////////
			 ////// PUBLIC Site Functions //////
			///////////////////////////////////
			this.refresh = function(callback){
				
				for(var c = 0 , i = site.start;i.getTime() < site.end.getTime(); i = new Date(i.getFullYear(),i.getMonth(),i.getDate()+1,05,00,00), c++){
					
					var dayEnd = new Date(i.getFullYear(),i.getMonth(),i.getDate(),23,59,58);

					getShifts($filter('date')(i,wiwDateFormat),$filter('date')(dayEnd,wiwDateFormat),c,
						
						function(ret,start,d){
							
							var obj = {date:new Date(start)};
							
							obj['days'] = 0;
							
							obj['afternoons'] = 0;
							
							for(var s in ret.shifts){
								
								var shift = ret.shifts[s];
								
								var user = site.users[site.xusers[shift.user_id]];
								
								if(user){
									
									var start = new Date(shift.start_time);
									
									user.numShifts++;
									
									shift.user = user;
									shift.start_time = new Date(shift.start_time);
									shift.end_time = new Date(shift.end_time);
									shift.created_at = new Date(shift.created_at);
									
									if(shift.published)shift.published_date = new Date(shift.published_date);
									if(shift.acknowledged)shift.acknowledged_at = new Date(shift.acknowledged_at);
									
									shift.position = wiw.xpos[shift.position_id];
									
									obj[user.first_name+''+user.last_name] = shift;
									
									if(shift.position.name && shift.position.name !== 'TRAVEL'){
										
										if(start.getHours() < 10){
											obj['days']++;
										} else {
											obj['afternoons']++;
										}
									}
								}
							}
					
							site.gridOptions.data[d] = obj;
							
							if(d === Math.floor((site.end.getTime() - site.start.getTime())/86400000)){
							//	if(callback){
							//		callback();
							//	}
							}
						}
					);						
				}	
				setTimeout(function(){
					if(callback){
						callback();
					}
				},1000);
			};
			this.dateChange = function(callbk){
				var start = $scope.Schedule.start;
				var end = $scope.Schedule.end;
				site.start = new Date(start.getFullYear(),start.getMonth(),start.getDate(),05,00,00);
				site.end = new Date(end.getFullYear(),end.getMonth(),end.getDate(),23,59,58);
				site.refresh(function(){
					callbk(site,id);
				});
			};
			  ////////////////////////////////////////////////
			 ////// FOR LESSER PUBLIC FUNCTIONS /////////////
			////////////////////////////////////////////////
			this.func = {};
			
			this.func.showInfo = function(e,grid,row,col){
				
				if(!e.ctrlKey){
					var shift = row.entity[col.name];
					var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
					$mdDialog.show({
					  controller: DialogController,
					  templateUrl: 'html/sched/shInfo.html',
					  parent: angular.element(document.body),
					  targetEvent: e,
					  clickOutsideToClose:true,
					  fullscreen: useFullScreen,
					  locals:{
						  shift: shift,
						  user: $scope.site.users[site.xusers[shift.user_id]],
						  creator: $scope.site.users[site.xusers[shift.creator_id]]
					  }
					})
					.then(function(answer) {
					  $scope.status = 'You said the information was "' + answer + '".';
					}, function() {
					  $scope.status = 'You cancelled the dialog.';
					});
					$scope.$watch(function() {
					  return $mdMedia('xs') || $mdMedia('sm');
					}, function(wantsFullScreen) {
					  $scope.customFullscreen = (wantsFullScreen === true);
					});
				}
			};
			
			
			  /////////////////////////////////////////////
			 ////// CONSTRUCTING THE Site Object /////////
			/////////////////////////////////////////////
			getUsers(function(myUsers){
				for (var m =0;m < myUsers.length;m++){
					if(myUsers[m].id === 3868711){

						myUsers.splice(m,1);
						m--;
						continue;
					} 
					this.name = myUsers[m].first_name+''+myUsers[m].last_name;
					
					function cntShifts(rows){
						for(var r in rows){
							if(rows[r].entity[this.name]){
								
								return rows[r].entity[this.name].user.numShifts;
							}
						}
					}
					site.xusers[parseInt(myUsers[m].id)] = parseInt(m);
					myUsers[m].numShifts = 0;
					
					  ////////////////////////////////////////////////////////
					 /// SETTING COLUMN DEFINITIONS FOR EMPLOYEE COLUMNS ////
					////////////////////////////////////////////////////////
					
					site.gridOptions.columnDefs.push({
						name: myUsers[m].first_name+''+myUsers[m].last_name,
						field: myUsers[m].first_name+''+myUsers[m].last_name+'.position.name',
						aggregationType: cntShifts,
						enableSorting: false,
						enableCellEdit: true,
						aggregationHideLabel: false,
						cellTemplate: function(){
							
							return '<div class="ui-grid-cell-contents" ng-class="grid.appScope.selectedStyle(grid,row,col)">\n\
									<div ng-cloak class="shift-name text-center shift-mu" title ="Click for more info." ng-click="grid.appScope.site.func.showInfo($event,grid,row,col)" ng-mousedown="grid.appScope.buttEff($event)" ng-mouseleave="grid.appScope.buttEff($event)" ng-mouseup="grid.appScope.buttEff($event)" ng-bind="COL_FIELD CUSTOM_FILTERS" ng-class="\'shift\'+row.entity[col.name].color">\n\
									</div></div>';
						}
					}); 
				}
				
				site.gridOptions.columnDefs.push({
					name: 'days',
					field: 'days',
					width: '4%',
					allowCellFocus : false,
					enableSorting:false,
					enableCellEdit: false
				},{
					name: 'afternoons',
					field: 'afternoons',
					width: '6%',
					allowCellFocus : false,
					enableSorting:false,
					enableCellEdit: false
				});
				site.gridOptions.rowTemplate = '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader,\'weekend\':row.entity[\'date\'].getDay() === 0 || row.entity[\'date\'].getDay() === 6}" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ui-grid-cell></div>';
				
				
				site.users = myUsers;
				
				site.refresh(function(){
					
					site.callbk(site,id);
				});
			});
		};			
		///////////////////////
	   //   END OF Site //////
	  ///////////////////////
	
		var Util = {
			
			formatAvatar : function(url){
				return sprintf(url,'sm');
			},
			captureCopy : function(nav){
				var selection = nav.getCurrentSelection(),
						nwCell;
			
				angular.forEach(selection,function(cell, key){
					
					var uid = cell.col.uid.split('-')[1];
					
					if(!nwCell){
						nwCell = cell;
					}else if(nwCell && uid < nwCell.col.uid.split('-')[1]){
						nwCell = cell;
					} else if (nwCell && uid === nwCell.col.uid.split('-')[1]){
						if(cell.row.entity.date < nwCell.row.entity.date){
							nwCell = cell;
						} 
					} else {
						
					}
				});
				
				return [selection,nwCell];
			},
			pasteShifts: function(grid,selection,nwSelCell){
				var occupied;
				var newNWCell = grid.cellNav.getFocusedCell();
				var first = newNWCell.col.displayName.split(" ")[0];
				var last = newNWCell.col.displayName.split(" ")[1];
				for(var u in $scope.site.users){
					var user = $scope.site.users[u];
					
					if(user.first_name === first && user.last_name === last){
						newNWCell.uIndex = u;
					}
				}
				for(var s in selection){
					var sCell = selection[s];
					sCell.offCol = parseInt(sCell.col.uid.split('-')[1],36) - parseInt(nwSelCell.col.uid.split('-')[1],36);
					sCell.offRow = Math.floor((sCell.row.entity.date.getTime() - nwSelCell.row.entity.date.getTime())/86400000);
					for(var r in $scope.gridOptions.data){
						var day = $scope.gridOptions.data[r];
						
						if(new Date(day.date.getFullYear(),day.date.getMonth(),day.date.getDate()).toDateString() === new Date(newNWCell.row.entity.date.getFullYear(),newNWCell.row.entity.date.getMonth(),newNWCell.row.entity.date.getDate()+sCell.offRow).toDateString()){
							var newU = $scope.site.users[parseInt(newNWCell.uIndex)+sCell.offCol];
							
							sCell.newDate = day.date;

							if(day[newU.first_name+newU.last_name]){
								sCell.occupied = true;
								occupied = true;
							} else {
								sCell.occupied = false;
							}
							
							if(sCell.row.entity[sCell.col.name]){
								sCell[newU.first_name+newU.last_name] = {};
								var newShift = sCell[newU.first_name+newU.last_name];
								var oldShift = sCell.row.entity[sCell.col.name];
								newShift.position = oldShift.position;
								newShift.end_time = new Date(sCell.newDate.getFullYear(),sCell.newDate.getMonth(),sCell.newDate.getDate(),oldShift.end_time.getHours(),oldShift.end_time.getMinutes(),oldShift.end_time.getSeconds());
								newShift.start_time = new Date(sCell.newDate.getFullYear(),sCell.newDate.getMonth(),sCell.newDate.getDate(),oldShift.start_time.getHours(),oldShift.start_time.getMinutes(),oldShift.start_time.getSeconds());
								newShift.user = newU;
								newShift.user_id = newU.id;
								newShift.position_id = newShift.position.id;
								newShift.location_id = $scope.site.location_id;
								newShift.creator_id = $scope.wiw.user_id;
								newShift.account_id = oldShift.account_id;
								newShift.created_at = new Date();
							}
						}
					}
				}
				
				if(occupied && confirm("You are going to be overwriting a shift. Is that okay?")){
					for(var s in selection){
						var sCell = selection[s];

						for(var r in $scope.gridOptions.data){
							var day = $scope.gridOptions.data[r];
							if(new Date(day.date.getFullYear(),day.date.getMonth(),day.date.getDate()).toDateString() === new Date(newNWCell.row.entity.date.getFullYear(),newNWCell.row.entity.date.getMonth(),newNWCell.row.entity.date.getDate()+sCell.offRow).toDateString()){
								var newU = $scope.site.users[parseInt(newNWCell.uIndex)+sCell.offCol];
								if(sCell[newU.first_name+newU.last_name]){
									day[newU.first_name+newU.last_name] = sCell[newU.first_name+newU.last_name];
								} else {
									delete day[newU.first_name+newU.last_name];
								}
							}
						}
					}

				} else if(!occupied){
					for(var s in selection){
						var sCell = selection[s];

						for(var r in $scope.gridOptions.data){
							var day = $scope.gridOptions.data[r];
							if(new Date(day.date.getFullYear(),day.date.getMonth(),day.date.getDate()).toDateString() === new Date(newNWCell.row.entity.date.getFullYear(),newNWCell.row.entity.date.getMonth(),newNWCell.row.entity.date.getDate()+sCell.offRow).toDateString()){
								var newU = $scope.site.users[parseInt(newNWCell.uIndex)+sCell.offCol];
								if(sCell[newU.first_name+newU.last_name]){
									day[newU.first_name+newU.last_name] = sCell[newU.first_name+newU.last_name];
								} else {
									delete day[newU.first_name+newU.last_name];
								}
							}
						}
					}
				}
				console.log(selection);
				console.log(nwSelCell);
			}
		};
		
		$scope.selectedStyle = function(grid,row,col){

			for(var c in $scope.site.copyPaste.selection){
				var cell = $scope.site.copyPaste.selection[c];
				if(cell.col.name === col.name && cell.row.entity.date === row.entity.date){
					
					return 'selected-cell';						
				} 
			}
			
			return '';
		};
		$scope.dateChange = function(){
			$scope.site.dateChange(function(site,id){
				$scope.gridOptions = $scope.site.gridOptions;
			});
		};
		$scope.buttEff = function(e){
			var shiftMu = 
				{
					top:'-1px',
					left:'-1px',
					'box-shadow':'3px 3px 3px gray'
				};
			var shiftMd = 
				{
					top:'1px',
					left:'1px',
					'box-shadow':'1px 1px 2px gray'
				};
			if(e.type === 'mousedown'){
				
				$(e.target).animate(shiftMd,80);
			} else if(e.type === 'mouseup'){
				$(e.target).animate(shiftMu,80);
			} else if(e.type === 'mouseleave'){
				$(e.target).animate(shiftMu,80);
			}
		};
		$scope.showPubUnpub = function(row,col){
			var published = row.entity[col.name].published;
		   return ($scope.showUnpub || published);
		};
	
		$scope.menuOptions = function(grid){
			
			this.nav = grid.cellNav;
			return [
				['Copy', function(){
					var retArr = Util.captureCopy(this.nav);
					var selection =retArr[0];
					var nw = retArr[1];
					$scope.site.copyPaste.selection = selection;
					$scope.site.copyPaste.nwSelCell = nw;
					setTimeout(function(){
					
						$scope.$apply();
					},1500);
					
				}],
				['Paste', function () {
				
					Util.pasteShifts(grid,$scope.site.copyPaste.selection,$scope.site.copyPaste.nwSelCell);
				},
				function(){
					if($scope.site.copyPaste.selection){
						return true;
					} else {
						return false;
					}
				}],
				null, // Dividier
				['Remove', function ($itemScope) {
					$scope.items.splice($itemScope.$index, 1);
				}]
			];
		};
		$scope.changeLoc  = function(id){
			
			for(var i in sites){

				if(sites[i].location_id === id){
					
					$scope.site = sites[i];
					$scope.gridOptions = sites[i].gridOptions;
					$scope.gridOptions.columnDefs = sites[i].gridOptions.columnDefs;
					$scope.loading = false;
				}
			}
		};
		  ////////////////////////////////////
		 ////// MAIN METHOD FOR GridCtrl ////
		////////////////////////////////////
		
			
		if($cookies.get('uid') && $cookies.get('tok') ){
			var sites = [];
			
			$scope.formatAvatar = Util.formatAvatar;
			$scope.captureCopy = Util.captureCopy;

			$scope.loading = true;
			var wiw = $scope.wiw = new Wiw.init($cookies.get('uid') , $cookies.get('tok'),
				function(){

					$rootScope.user = wiw.user;
					$rootScope.user.locations = wiw.locations;  // To support the old Schedule for now.

					// Loop through each location and create a Site object for each stored as an array.
					for(var i in $rootScope.user.locations){

						sites[i] = new Site(wiw.locations[i].id,wiw,function(site,id){
							
							if($state.params['site'] === site.location.name){
								$scope.site = site;
								$scope.gridOptions = jQuery.extend(true,{},$scope.site.gridOptions);
								$scope.Schedule = {};
								$scope.Schedule.start = $scope.site.start;
								$scope.Schedule.end = $scope.site.end;
								setTimeout(function(){
									$scope.loading = false;
									$scope.$apply();
									console.log($scope);
									setTimeout(function(){

										$(".ui-grid-footer-cell").addClass("center");
										
										$scope.gridApi.core.queueRefresh();
										$scope.gridApi.core.queueGridRefresh();
									},500);
								},500);
							}
							console.log(site);
		
						});
					}
				}
			);
		} else {
			$state.go('login');
		}
				
	}	

]);
function DialogController($scope, $mdDialog,shift,user,creator) {
	$scope.shift = shift;
	$scope.user = user;
	$scope.creator = creator;
	$scope.shift.start_time = new Date(shift.start_time);
	$scope.shift.end_time = new Date(shift.end_time);
	
	
	$scope.formatAvatar = function(url){
		return sprintf(url,'sm');
	};
	$scope.hide = function() {
	  $mdDialog.hide();
	};
	$scope.cancel = function() {
	  $mdDialog.cancel();
	};
	$scope.answer = function(answer) {
	  $mdDialog.hide(answer);
	};
}

//// OBSOLETE SHIT I COULDN'T DELETE 

//$scope.selectCells = function(e,grid,row,col){
//	if(e.button === 0){
//		console.log(row);
//
//		var firstCell = $($(e.target)[0].parentElement)[0].parentElement;
//		var x = e.clientX-2;
//		var y = e.clientY-2;
//		var selectBox = document.createElement("div");
//		var lastCorner;
//		var lastMx, lastMy;
//		document.body.appendChild(selectBox);
//
//		$(selectBox).css({'top':y,'left':x,'z-index':9,'position':'absolute','border-style': 'dotted', 'border-width': '3px','border-color': '#777777','background-color':'rgba(75,75,75,0.3)'});
//		$(document).on('keydown',function(e){
//			if(e.ctrlKey && lastCorner){
//
//				$(selectBox).width($('.ui-grid-coluiGrid-0005').width()+ lastCorner.x-x-4);
//				$(selectBox).height($('.ui-grid-coluiGrid-0005').height()+$('.ui-grid').position().top+lastCorner.y-y-4);
//				$(document).one('keyup',function(e){
//
//					if(e.keyCode === 17){
//						$(selectBox).width(lastMx - x-5);
//						$(selectBox).height(lastMy - y-5);
//					}				
//				});
//			}
//		});
//
//		$(document).on('mousemove',function(e){
//			if(!e.ctrlKey){
//				$(selectBox).width(e.clientX - x-5);
//				$(selectBox).height(e.clientY - y-5);
//				lastMx = e.clientX;
//				lastMy = e.clientY;
//			}
//		});
//		$(document).one('mouseup',function(e){
//
//			$(document).off('mousemove');
//			$('.seCellCorner').off('mouseenter');
//			$(selectBox).remove();
//
//		});		
//		$('.seCellCorner').on('mouseenter',function(e){
//			if(!e.ctrlKey){
//				var parent = $($(this)[0].parentElement)[0].parentElement;
//				lastCorner = {'x':$(parent).position().left+$(parent).width(),'y':$(parent).position().top+$(parent).height()};
//			}
//		});
//
//		var target = e.target.parentElement.id?e.target.parentElement:e.target.parentElement.parentElement;
//
//		var mLeave = function(e){
//			var thisTarget = e.target;
//			var nextTarget = e.toElement;
//			$(thisTarget).off('mouseup');
//			$(nextTarget).one('mouseleave',mLeave);
//			$(nextTarget).one('mouseup',function(e){
//				console.log(e);
//			});
//		};
//		$(target).one('mouseleave',mLeave);
//	}
//};