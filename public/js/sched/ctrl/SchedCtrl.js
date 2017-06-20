
// Remove Max and Ruben as columns and add an On-Call column with who is on-call.
wiwApp.controller('SchedCtrl',[
    'SchedFactory',
    'AuthFactory',
    '$rootScope',
    '$scope',
    '$cookies',
    '$state',
    '$mdDialog', 
    '$mdMedia',
    '$filter',
    '$interval',
    function(SchedFactory,AuthFactory,$rootScope, $scope, $cookies, $state, $mdDialog, $mdMedia,$filter,$interval){
		
        /*
         *  LOCAL VARIABLES 
         *
         */ 
        var wiwDateFormat = 'EEE, dd MMM yyyy HH:mm:ss Z';
        var shortdate = 'M/d/yy';
        var shiftCutoff = 10; // Time at which to stop counting shifts as days 
        var token;
        var user_id;
        var dbNewShifts;
        var numWeeks = 5;
        var menuEv;
        
        var xusers = {};
        var xpos = {};
        var xblocks = {};
        
        var now = new Date();
        
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
    
        /*
         *  SCOPE VARIABLES
         */
        $scope.site_title = $rootScope.site_title;
        $scope.loading = true;
        $scope.showUnpub = false;
        $scope.Schedule = {};
		
        $scope.Schedule.newShifts = {};
        $scope.Schedule.newShifts.days = [];
        $scope.Schedule.newShifts.shifts = [];
        $scope.Schedule.newShifts.removed = [];

        $scope.Schedule.users = [];

        $scope.Schedule.start = start;
        $scope.Schedule.end = end;

        $scope.closeOthers = false;
        $scope.isOpen = true;

        $scope.showInfo = showInfo;
        $scope.getGrad = getGrad;
        
        var addShift = function(shift,shift_date,sh,d,wk){
		
			var newShift = {};

			var date = new Date(shift_date);
			if(shift.selected_pos){
				if(shift.selected_pos.removed){
					if($scope.Schedule.newShifts.days[date.toDateString()] && $scope.Schedule.newShifts.days[date.toDateString()][shift.user_id]){
						delete $scope.Schedule.newShifts.days[date.toDateString()][shift.user_id];

						delete shift.selected_pos;
						var temp1 = shift.user_id;
						var temp2 = shift.position;
						delete $scope.Schedule.weeks[wk].days[d].shifts[sh];
						$scope.Schedule.weeks[wk].days[d].shifts[sh] = {};
						$scope.Schedule.weeks[wk].days[d].shifts[sh].user_id = temp1;
						$scope.Schedule.weeks[wk].days[d].shifts[sh].position = temp2;
						$scope.Schedule.newShifts.removed[parseInt(wk+''+d+''+sh)] = angular.copy($scope.Schedule.newShifts.shifts[parseInt(wk+''+d+''+sh)]);
						delete $scope.Schedule.newShifts.shifts[parseInt(wk+''+d+''+sh)];

						var cnt = 0;
						for(var i in $scope.Schedule.newShifts.shifts){
							var shift = $scope.Schedule.newShifts.shifts[i];
							if(shift){
								cnt++;
							}
						}
						if(!cnt){

							delete $scope.Schedule.newShifts.shifts;
							$scope.Schedule.newShifts.shifts = [];
						}
					reCalc();
					}

				} else {

					var now = new Date();
					var stime = shift.selected_pos.block.start_time.split(':');
					var etime = shift.selected_pos.block.end_time.split(':');
					var end = new Date(date.getFullYear(),
						date.getMonth(),
						date.getDate(),
						etime[0],etime[1],etime[2]);
					var start = new Date(date.getFullYear(),
						date.getMonth(),
						date.getDate(),
						stime[0],stime[1],stime[2]);

					newShift.color = shift.selected_pos.color;
					newShift.created_at = $filter('date')(now,wiwDateFormat);
					newShift.date = $filter('date')(start,shortdate);
					newShift.end_time = $filter('date')(end,wiwDateFormat);

					newShift.location_id = $rootScope.user.location;
					newShift.notes = shift.selected_pos.block.notes;
					newShift.position_id = shift.selected_pos.id;
					newShift.published = false;
					newShift.published_date = null;
					newShift.start_time = $filter('date')(start,wiwDateFormat);
					newShift.user_id = shift.user_id;

					if(!$scope.Schedule.newShifts.days[date.toDateString()])$scope.Schedule.newShifts.days[date.toDateString()] = {};
					$scope.Schedule.newShifts.days[date.toDateString()][shift.user_id] = newShift;
					var temp = shift.selected_pos;
					$scope.Schedule.weeks[wk].days[d].shifts[sh] = newShift;
					$scope.Schedule.weeks[wk].days[d].shifts[sh].selected_pos = temp;
					$scope.Schedule.weeks[wk].days[d].shifts[sh].position = {};
					$scope.Schedule.weeks[wk].days[d].shifts[sh].position.name = "";

					$scope.Schedule.newShifts.shifts[parseInt(wk+''+d+''+sh)] = newShift;
					delete $scope.Schedule.newShifts.removed[parseInt(wk+''+d+''+sh)];
					reCalc();
				}

			}
		};
        
        /*
		 * construct
		 * @param {function} getUser
		 * @returns {void}
		 */
		var construct = function(next){
			if($scope.Schedule.weeks)$scope.Schedule.weeks = [];
			$scope.Schedule.weeks = [];
			
			$scope.loading = true;
			var now = new Date($scope.Schedule.start);
			start =  new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
			05,00,00);
			end = new Date(
				$scope.Schedule.end.getFullYear(),
				$scope.Schedule.end.getMonth(),
				$scope.Schedule.end.getDate(),23,59,58);

			var dayOffset = 0;
			var newStart = start;

			var newEnd = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate()+dayOffset,23,59,58);

			$scope.Schedule.start = start;
			$scope.Schedule.end = end;

			$scope.Schedule.weeks[0] = {};	
			$scope.Schedule.weeks[0].start = start;

			for(var k=0;newStart <= end; k++){
				$scope.Schedule.weeks[k] = {};
				$scope.Schedule.weeks[k].days = [];

				if(k===0){
					var daysInWk = 7-now.getDay();
				} else {
					var daysInWk = 7;
				}
				for(var j = 0;j < daysInWk ; j++){

					$scope.Schedule.weeks[k].days[j] = {};
					$scope.Schedule.weeks[k].days[j].shifts = [];
					$scope.Schedule.weeks[k].days[j].Day = 0;
					$scope.Schedule.weeks[k].days[j].Afternoon = 0;

					newStart = new Date(
						now.getFullYear(),
						now.getMonth(),
						now.getDate()+dayOffset,5,0,0);

					newEnd = new Date(
						now.getFullYear(),
						now.getMonth(),
						now.getDate()+dayOffset,23,59,58);

					$scope.Schedule.weeks[k].days[j].start = newStart;
					$scope.Schedule.weeks[k].days[j].end = newEnd;
					if(j===0)$scope.Schedule.weeks[k].start = newStart;
					dayOffset++;

					if(newEnd >= end){
						break;
					}
				}
				$scope.Schedule.weeks[k].end = newEnd;
				if(newEnd >= end){
					break;
				}
				
			}
			if(typeof next === 'function'){
				next();
			}
		};
        
        /*
		 * final
		 * @returns {void}
		 */
		var final = function(){
			//$scope.Schedule.weeks =	Schedule.weeks;
			//console.log(new Date().getSeconds()+'.'+new Date().getMilliseconds());
			
			setTimeout(function(){
				if($rootScope.user.role < 3)$scope.showUnpub = true;
				$scope.loading = false;
				$scope.$apply();
			},500);
		
		};
		
        /*
		 * getGrad
		 * @param {type} color
		 * @returns {SchedCtrl_L9.$scope.getGrad.obj_nocol|SchedCtrl_L9.$scope.getGrad.obj_col}
		 */
		function getGrad(color)
		{
			if(color)
			{
				var r = parseInt(color.substring(0,2),16);
				var g = parseInt(color.substring(2,4),16);
				var b = parseInt(color.substring(4,6),16);
			}
			var obj_col = {
				'background': 'rgba('+r+','+g+','+b+',.7)',
				'background': 'radial-gradient(rgba(220,220,220,1),rgba('+r+','+g+','+b+',1))',
				'background': '-webkit-radial-gradient(rgba(220,220,220,1),rgba('+r+','+g+','+b+',1))'
				
			};
			var obj_nocol = {
				'background': 'rgba(196,224,71,.7)',
				'background': 'radial-gradient(rgba(196,224,71,.5),rgba(196,224,71,.8))',
				'background': '-webkit-radial-gradient(rgba(196,224,71,.5),rgba(196,224,71,.8))'
				
			};
			return color ? obj_col :obj_nocol;
		};
        
        /*
		 * getShifts
		 * @param {int} m
		 * @param {int} id
		 * @param {function} final
		 * @returns {void}
		 */
		var getShifts = function(m,id){
			
			SchedFactory.shifts.get(
			{
				'start': $scope.Schedule.start,
				'end':  $scope.Schedule.end,
				'user_id': id,
				'unpublished': true,
				'W-Token': token
			},function(obj){
				
				placeShifts(m,obj.shifts);				
			});
		};
		
        /*
		 * getUser
		 * @param {function} getUsers
		 * @returns {void}
		 */
        var getUser = function(getUsers){

			$rootScope.user = SchedFactory.user.get(
            {
                'id': user_id,
                'W-Token': token
            },
            function(data){
                
				$rootScope.user = data.user;
				$rootScope.user.location = data.locations[0].id;
				
				AuthFactory.authSesh.authed(
				{
					  'uid': user_id,
					  'tok': token
				},
                function(res){ 
                    SchedFactory.user_settings.get(null,function(result){

                        if(result.settings){
                            $rootScope.user.settings = result.settings;
                        } else {
                            $rootScope.user.settings = {};
                        }
                    });

                    SchedFactory.new_shifts.get(null,function(data){
                        var result = data.shifts;

                        dbNewShifts = result;

                    });
                });
				getUsers(getShifts);
				
				// GET LOCATIONS
				SchedFactory.locations.get(
				{
					'W-Token': token
				}
				,function(data){
					
					$rootScope.user.locations = data.locations;
					
				},function(err){
					console.log(err);
                    
                    $cookies.remove('uid');
                    $cookies.remove('tok');
                    
					$state.go('login');
				});
			},
            function(err){
                $cookies.remove('uid');
                $cookies.remove('tok');
                console.log(err);
                $state.go('login');
            });
			
			SchedFactory.positions.get({
				show_deleted: true,
				'W-Token': token
			},function(posData){
					
				$scope.Schedule.positions = posData.positions;
				xpos[0] = {name:""};
				for(var i in posData.positions){
					xpos[parseInt(posData.positions[i].id)] = posData.positions[i];
				}
				
				SchedFactory.blocks.get(
				{
					'W-Token':token
				},function(blkData){
					$scope.Schedule.blocks = blkData.blocks;
					for(var i in posData.positions){
						
						for(var b in blkData.blocks){
						
							if(blkData.blocks[b].position_id === posData.positions[i].id){
								$scope.Schedule.positions[i].block = blkData.blocks[b];
								xpos[parseInt(posData.positions[i].id)].block = blkData.blocks[b];
								break;
							}
						}
					}
				},function(err){
                    $cookies.remove('uid');
                    $cookies.remove('tok');
					console.log(err);
					$state.go('login');
				});
			},function(err){
                console.log(err);
                $state.go('login');
            });
        };
		
		/*
		 * getUsers
		 * @param {function} getShifts
		 * @returns {void}
		 */
        var getUsers = function(getShifts){

			SchedFactory.users.get(
			{
				'W-Token': token,
				'location_id':$rootScope.user.location
			},
			function(data){

				$scope.Schedule.users = [];
				var deled;
				for (var m in data.users){
					if(data.users[m].id === 3868711){
						delete data.users[m];
						deled = m;
						//data.users.splice(m,1);
					} else {
						if(m > deled){
							xusers[data.users[m].id] = m-1;
							$scope.Schedule.users[m-1] = data.users[m];
							$scope.Schedule.users[m-1].numShifts = 0;
							getShifts(m-1,$scope.Schedule.users[m-1].id);
						} else{
							xusers[data.users[m].id] = m;
							$scope.Schedule.users[m] = data.users[m];
							$scope.Schedule.users[m].numShifts = 0;
							getShifts(m,$scope.Schedule.users[m].id);
						}
					}
				}
				
				final();
				
			},
			function(err){
				console.log(err);
				$state.go('login');
			});
		};
        
		var placeShifts = function(u,shifts){
			for(var p in dbNewShifts){
				shifts.push(dbNewShifts[p]);
			}
			for(var k in $scope.Schedule.weeks){
				
				for(var d in $scope.Schedule.weeks[k].days){
                    $scope.Schedule.weeks[k].days[d].shifts[u] = [];
					if(shifts.length === 0){
						$scope.Schedule.weeks[k].days[d].shifts[u].push({
                            user_id : $scope.Schedule.users[u].id,
                            position : {
                                name : ""
                            }
                        });
					}
					for(var i in shifts){
						// GET DATE STRING OF THE START TIME AS CREATED BY THE CONSTRUCT() FUNCTION

						var shift = shifts[i];
						var myStart =$scope.Schedule.weeks[k].days[d].start.toDateString();

						// GET DATE STRING OF THE START TIME FROM THE RETURNED SHIFT OBJECT 
						var theirStart = new Date(shift.start_time).toDateString();

						// IF THE DATES MATCH
						if(myStart === theirStart && u === xusers[shift.user_id]){

							var shiftStart = new Date(shift.start_time);

							// STORE THE SHIFT IN THE CONSTRUCTED OBJECT
                            var newShift = angular.copy(shift);
							//$scope.Schedule.weeks[k].days[d].shifts[u] = angular.copy(shift);
                            var newShiftArray = [];
							newShift.start_time = new Date(shift.start_time);
							newShift.end_time = new Date(shift.end_time);
							if(newShift.published)newShift.published_date = new Date(shift.published_date);
							if(newShift.acknowledged)newShift.acknowledged_at = new Date(shift.acknowledged_at);
							if(!shift.selected_pos){
                                if(shift.position_id){
                                    newShift.position = xpos[shift.position_id];
                                } else {
                                    newShift.position = {
                                        name: newShift.start_time.toTimeString()
                                    };
                                }
                            }else{
								addShift($scope.Schedule.weeks[k].days[d].shifts[u],myStart,u,d,k);
							}
							console.log(newShift);
							//COUNTING SHIFTS IN A DAY
							if(newShift.position && newShift.position.name !== 'TRAVEL' && showPubUnpub(newShift.published)){
								$scope.Schedule.users[u].numShifts++;
                                if(shiftStart.getHours() < shiftCutoff){
									$scope.Schedule.weeks[k].days[d].Day++;
								} else {
									$scope.Schedule.weeks[k].days[d].Afternoon++;
								}
							}
                            
                            $scope.Schedule.weeks[k].days[d].shifts[u].push(newShift);
                            if($scope.Schedule.weeks[k].days[d].shifts[u].length > 1){
                                $scope.Schedule.users[u].numShifts--;
                            }
							// REMOVE SHIFT
							//shifts.splice(i,1);
							//break;

						} else if(myStart !== theirStart && $scope.Schedule.weeks[k].days[d].shifts[u].length === 0){
							// SHIFT DOES NOT MATCH THE DATE
							// CREATE BASIC OBJECT TO FILL SPACE
							if( shifts.length === 0){
                                $scope.Schedule.weeks[k].days[d].shifts[u].push({
                                    user_id : $scope.Schedule.users[u].id,
                                    position : {
                                        name : ""
                                    }
                                });
                            
                            }
						} // End if match shift to day
					} // End for shifts
				} // End for days
			} // End for weeks
			
			if(u === $scope.Schedule.users.length - 1){
				final();
			}
		};
        
        var reCalc = function(){
            for(var b in $scope.Schedule.users){
                $scope.Schedule.users[b].numShifts = 0;
            }

            for(var k in  $scope.Schedule.weeks){

                for(var j in  $scope.Schedule.weeks[k].days){

                    $scope.Schedule.weeks[k].days[j].Day = 0;
                    $scope.Schedule.weeks[k].days[j].Afternoon = 0;

                    for(var i in $scope.Schedule.weeks[k].days[j].shifts){
                        var shifts = $scope.Schedule.weeks[k].days[j].shifts[i];
                        
                        for(var s in shifts){
                            var shift = shifts[s];
                            if(shift.id ||shift.selected_pos){
                                var shiftStart;
                                if(showPubUnpub(shift.published)&& shift.position.name !== 'TRAVEL' && shift.position.name !== 'On-Call' || shifts.length === 1)$scope.Schedule.users[xusers[shift.user_id]].numShifts++;

                                shiftStart = new Date(shift.start_time);

                                        //COUNTING SHIFTS IN A DAY
                                if(shift.position.name !== 'TRAVEL' && shift.position.name !== 'On-Call' && showPubUnpub(shift.published)){
                                    if(shiftStart.getHours() < shiftCutoff){
                                            $scope.Schedule.weeks[k].days[j].Day++;
                                    } else {
                                            $scope.Schedule.weeks[k].days[j].Afternoon++;
                                    }
                                }	
                            }
                        }
                    }
                }
            }
		};
        /*
		* showInfo
		* @param {type} ev
		* @returns {undefined}
		*/
		function showInfo(ev,shift) {
			var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
			$mdDialog.show({
			  controller: DialogController,
			  templateUrl: 'html/sched/shInfo.html',
			  parent: angular.element(document.body),
			  targetEvent: ev,
			  clickOutsideToClose:true,
			  fullscreen: useFullScreen,
			  locals:{
				  shift: shift,
				  user: $scope.Schedule.users[xusers[shift.user_id]],
				  creator: $scope.Schedule.users[xusers[shift.creator_id]]
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
        
        function showPubUnpub(published){
		   return ($scope.showUnpub || published);
		}
        
        function update(){
            construct(function(){
				getUser(getUsers);			
			});
        }
		/******************************* 
         *******************************
		 ****** SCOPE FUNCTIONS  *******
		 *******************************
		 *******************************/
	   
		$scope.addShift = addShift;
		
        /*
         * 
         * @param {type} id
         * @returns {undefined}
         */
        $scope.changeLoc = function(id){
            if($rootScope.user.location !== id){
             $rootScope.user.location = id;
             construct(function(){
                  getUsers(getShifts);
              });
          }

        };
        
        $scope.changePub = function(){
            $scope.showUnpub = !$scope.showUnpub;
            reCalc();
        };
        
		$scope.createShifts = function(){
			
			for(var i in $scope.Schedule.newShifts.shifts){
				var shift = $scope.Schedule.newShifts.shifts[i];
				if(shift){
					SchedFactory.new_shifts.save(
					{
						'shift':shift
					},
					function(result){
						console.log(result);
					});
				}
			}
			for(var i in $scope.Schedule.newShifts.removed){
				var del = $scope.Schedule.newShifts.removed[i];
				if(del){
					SchedFactory.new_shifts.remove(
					{
						'user_id':parseInt(del['user_id']),
						'date':del['date']
					},
					function(result){
						console.log(result);
						delete $scope.Schedule.newShifts.removed[i];
					});
				}
			}
			
		};
        
        $scope.dateChange = function(){
             construct(function(){
                 getUsers(getShifts);
             });
        };
        
		$scope.formatAvatar = function(url){
			return sprintf(url,'sm');
		};
        
        $scope.getDate = function(date,time){
			
			return new Date(new Date().getFullYear(),
				new Date().getMonth(),
				new Date().getDate()
				,date.split(':')[0],
				date.split(':')[1],
				date.split(':')[2]);
			
		};
        
	   /*
		* 
		* @param {type} id
		* @returns {String}
		*/        
		$scope.getSettings = function(shift,type){
			if($rootScope.user.settings){
				var settings = Object.getOwnPropertyNames($rootScope.user.settings);
			} else {
				var settings = [];
			}
		
			var ret = {};
			if(shift.selected_pos){
				ret['border-color'] = '#'+shift.selected_pos.color;
			} else {
				ret['border-color'] = '#ccc';
			}
			for(var i in settings){
				var split = settings[i].split('-');
				if(split[0] === type){
					ret[split[1]+'-'+split[2]] = $rootScope.user.settings[settings[i]]; 
				}
			}
			
			return ret;
		};
        
        $scope.getUserByID = function(id){
			for(var i in $scope.Schedule.users){
				if($scope.Schedule.users[i].id === id){
					return $scope.Schedule.users[i].first_name+' '+$scope.Schedule.users[i].last_name;
				}
			}
		};
        
        $scope.showPubUnpub = showPubUnpub;
        
		$scope.showSettings = function(ev){
			
			var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
			$mdDialog.show({
				controller: SettingsCtrl,
				templateUrl: 'html/user/settings.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:false,
				fullscreen: useFullScreen,
				locals:{
				  user: $rootScope.user,
				  SchedFactory: SchedFactory
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
		};			
		
		/*****************
		/*
		/*   MAIN PROGRAM 
		/* 
		/*****************/
		
        if($cookies.get('uid') && $cookies.get('tok') ){
			if(!$rootScope.user){
				$rootScope.user = {};
				$rootScope.user.user = {};
				$rootScope.user.login = {};
				$rootScope.user.user.id = $cookies.get('uid');
				$rootScope.user.login.token = $cookies.get('tok');
			}
			
			token = $cookies.get('tok');
			user_id = $cookies.get('uid');
			
			update();
            
            //$interval(update,10800000);
		
        } else {
            $state.go('login');
        }
		
		setTimeout(function(){
			console.log($scope);
		},1000);
    }
]);
function SettingsCtrl ($rootScope, $scope, $mdDialog, user,SchedFactory){
		var previous = angular.copy($rootScope.user.settings);
		$scope.user = user;
		
		$scope.Manager = [
			{
				name: "Border Style",
				stage: 'new',
				setting: 'border-style',
				items: [
					"dotted",
					"dashed",
					"solid",
					"double",
					"groove",
					"ridge",
					"inset",
					"outset"
				]
			},
			{
				name: "Border Width",
				stage: 'new',
				setting: 'border-width',
				items:[
					".5px",
					"1px",
					"2px",
					"3px",
					"4px",
					"5px",
					"6px",
					"7px",
					"8px",
					"9px",
					"10px"
				]
			},
			{
				name: "Border Style",
				stage: 'unpub',
				setting: 'border-style',
				items: [
					"dotted",
					"dashed",
					"solid",
					"double",
					"groove",
					"ridge",
					"inset",
					"outset"
				]
			},
			{
				name: "Border Width",
				stage: 'unpub',
				setting: 'border-width',
				items:[
					".5px",
					"1px",
					"2px",
					"3px",
					"4px",
					"5px",
					"6px",
					"7px",
					"8px",
					"9px",
					"10px"
				]
			},
			{
				name: "Border Style",
				stage: 'pub',
				setting: 'border-style',
				items: [
					"dotted",
					"dashed",
					"solid",
					"double",
					"groove",
					"ridge",
					"inset",
					"outset"
				]
			},
			{
				name: "Border Width",
				stage: 'pub',
				setting: 'border-width',
				items:[
					".5px",
					"1px",
					"2px",
					"3px",
					"4px",
					"5px",
					"6px",
					"7px",
					"8px",
					"9px",
					"10px"
				]
			}
			
		];
		
		$scope.apply = function(){
			SchedFactory.user_settings.save({
				'user':$rootScope.user
			},function(result){
				
			});
			$mdDialog.hide();
		};
		
		$scope.cancel = function(){
			
			$rootScope.user.settings = previous;
			
			$mdDialog.hide();
		};
};
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