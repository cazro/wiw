wiwApp.controller('AuthCtrl',
    [
        
        '$scope',
        '$cookies',
        '$state',
        '$rootScope',
        'AuthFactory',
        function($scope, $cookies, $state, $rootScope, AuthFactory){
			
			$scope.showLogin = false;
			$scope.loggingIn = false;
            $scope.chooseAccount = false;
			$scope.chosenAccountID = 0;
			
            $scope.login = function(){
                $scope.loggingIn = true;
                var resource = AuthFactory.wiwLogin;
               
                resource.login(
                {
                    username: $scope.User.email,
                    password: $scope.User.pass
                    
                },
                function(resData){
                    $scope.User.pass = resData.login.token;
					
                    console.log("Auth from WIW success");
					
					$rootScope.user = resData;
                    if(resData.user){
						$cookies.put('uid',resData.user.id);
						$cookies.put('tok',resData.login.token);

						AuthFactory.authSesh.authed(
						{
							'uid': resData.user.id,
							'tok': resData.login.token
						},
						function(res){

							$state.go('schedule');
						});
					} else {
						if(resData.users){
							$scope.accounts = resData.accounts;
							$scope.chooseAccount = true;
							$scope.users = resData.users;
						}
					}
                },
                function(response){
                    if(response){
                        $scope.error = response.data.error;
                        $scope.loggingIn = false;
                    }
                });
                setTimeout(function(){
                    $scope.error = "No response from server!";
                    $scope.loggingIn = false;
                },45000);
            };
			$scope.continueLogin = function(){
				console.log($scope.chosenAccountID);
				for(var u in $scope.users){
					if($scope.users[u].account_id === $scope.chosenAccountID){
						$cookies.put('uid',$scope.users[u].id);
						$cookies.put('tok',$rootScope.user.login.token);

						$rootScope.user.user = $scope.users[u];

						AuthFactory.authSesh.authed(
						{
							'uid': $scope.users[u].id,
							'tok': $rootScope.user.login.token
						},
						function(res){

							$state.go('schedule');
						});
					}
					break;
				}
			};
            $scope.logout = function(){
                    $cookies.remove('uid');
                    $cookies.remove('tok');
                    $state.go('login');
            };
            if($cookies.get('uid') && $cookies.get('tok') ){
                $scope.logginIn = false;
                $rootScope.user = {};
                $rootScope.user.user = {};
                $rootScope.user.user.id = $cookies.get('uid');

                $rootScope.user.login = {};
                $rootScope.user.login.token = $cookies.get('tok');
                AuthFactory.authSesh.authed(
                 {
                          'uid': $rootScope.user.user.id,
                          'tok': $rootScope.user.login.token
                  },
                  function(res){ 
                          $state.go('schedule');

                  },
                  function(err){
                          console.log(err);
                          $scope.loggingIn = false;
                          $scope.showLogin = true;
                  });

            } else {
                    $scope.showLogin = true;
                    $scope.loggingIn = false;
            }
        }

]);
		 

