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
                    
                    $cookies.put('uid',resData.user.id);
                    $cookies.put('tok',resData.login.token);
                    
                    $rootScope.user = resData;
                    
                    AuthFactory.authSesh.authed(
                    {
                        'uid': resData.user.id,
                        'tok': resData.login.token
                    },
                    function(res){
                        
                        $state.go('schedule');
                    });
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
		 

