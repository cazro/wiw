test.controller('GridCtrl',[
    'SchedFactory',
	'AuthFactory',
    '$rootScope',
    '$scope',
    '$cookies',
    '$state',
	'$filter',
    function(SchedFactory,AuthFactory,$rootScope, $scope, $cookies, $state,$filter){
		
		var Wiw = {

			init : function(id,tok,callback){
				var wiw = this;
				
				this.user_id = parseInt(id);
				this.token = tok;
				this.locations = [];
				var user_id = this.user_id;
				var token = this.token;
				
				this.user = {};
				
				this.xpos = [];
				this.xloc = [];
				
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
					var positions;	
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

								for(var b in blkData.blocks){

									if(blkData.blocks[b].position_id === positions[i].id){
										positions[i].block = blkData.blocks[b];
										xpos[parseInt(positions[i].id)].block = blkData.blocks[b];
										break;
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
				getUser(function(myUser){
					
					wiw.user = myUser;
					
					getLoc(function(locs){
						wiw.locations =  locs;
						
						getPos(function(poss){
							wiw.positions  = poss;
							callback();
						});	
					});
				});				
			}
		};
		
	///////////////////////
   ///// Site  START /////
  ///////////////////////
		var Site = function(id,wiw){
			var site = this;
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
			this.gridOptions = {
				enableSortings : false,
				columnDefs: [
					{name: 'date', field:'date', displayName: 'Date', type: 'date'}
				],
				data: []
		
			};
			
			this.location = wiw.xloc[id];
			this.location_id = id;
			this.xusers = [];
			this.users = [];
			this.start = start;
			this.end = end;
			
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
			getShifts = function(start,end,c,callback){
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
			this.refresh = function(callback){
				//L
				for(var c = 0 , i = site.start;i.getTime() < site.end.getTime(); i = new Date(i.getFullYear(),i.getMonth(),i.getDate()+1,05,00,00), c++){
					var dayEnd = new Date(i.getFullYear(),i.getMonth(),i.getDate(),23,59,58);

					
					getShifts($filter('date')(i,wiwDateFormat),$filter('date')(dayEnd,wiwDateFormat),c,
						function(ret,start,d){
							var obj = {date:new Date(start)};
							for(var s in ret.shifts){
								//if(d===0){console.log(ret.shifts);}
								var user = site.users[site.xusers[ret.shifts[s].user_id]];
								if(user){
									obj[user.first_name+''+user.last_name] = ret.shifts[s];
								}
							}

							site.gridOptions.data[d] = obj;
						}

					);				
				}
				//site.gridOptions.data = site.days;
				while(i.getTime() < site.end.getTime()){
					if(i.getTime() >= site.end.getTime()){
						callback();
						console.log('callback');
						break;
					}
				}
				
			};
			this.init = function(callback){
				getUsers(function(myUsers){

					for (var m =0;m < myUsers.length;m++){
						if(myUsers[m].id === 3868711){

							myUsers.splice(m,1);
							m--;
							continue;
						} 

						site.xusers[parseInt(myUsers[m].id)] = parseInt(m);
						myUsers[m].numShifts = 0;
						site.gridOptions.columnDefs.push({
							name: myUsers[m].first_name+''+myUsers[m].last_name,
							field: 'position_id'
						}); 

					}
					site.users = angular.copy(myUsers);

					site.refresh(function(){
						callback();
					});
				});
			};
		};			
	///////////////////////
   //   END OF Site //////
  ///////////////////////
	
		var Util = {
			formatAvatar : function(url){
				return sprintf(url,'sm');
			},
			changeLoc : function(id){
				for(var i in $scope.sites){
					if($scope.sites[i].location_id === id){
						$scope.site = $scope.sites[i];
						
					}
				}
			}
		};
		
		(function(){
			
			if($cookies.get('uid') && $cookies.get('tok') ){
				
				var sites = $scope.sites = [];
				$scope.formatAvatar = Util.formatAvatar;
				$scope.changeLoc = Util.changeLoc;

				$scope.loading = true;
				var wiw = $scope.wiw = new Wiw.init($cookies.get('uid') , $cookies.get('tok'),
					function(){
						
						$rootScope.user = wiw.user;
						$rootScope.user.locations = wiw.locations;  // To support the old Schedule for now.
						
						// Loop through each location and create a Site object for each stored as an array.
						for(var i in $rootScope.user.locations){
							sites[i] = new Site(wiw.locations[i].id,wiw).init(
								function(){
									console.log('sites callback');
									//sites[i].gridOptions.data = sites[i].days;
									if(i === $rootScope.user.locations.length-1){
										setTimeout(function(){
											$scope.loading = false;
											console.log('timeout');
											$scope.$apply();
										},1000);
									}
								}
							);
							if($state.params['site'] === wiw.locations[i].name){
								$scope.site = sites[i];
								
							}
							
						}
						
						
					}
				);
			} else {
				$state.go('login');
			}

			setTimeout(function(){

				console.log($scope);

			},2000);
		
		})();		
	}	

]);