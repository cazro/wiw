var test = angular.module('test',
    [
   
        'ngAnimate',
        'ngResource',
        'ngCookies',
        'ui.router',
		'sprintf',
		'ui.grid'
    ]

).run(
[	
    '$rootScope','$state','$stateParams',
    function($rootScope,  $state,  $stateParams)
    {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
		$rootScope.site_title = "When I Work SpreadSheets";
    }
]).config(
[
    '$stateProvider','$urlRouterProvider', 
    function($stateProvider, $urlRouterProvider)
    {
        $urlRouterProvider.otherwise('/');

        $stateProvider.state("login", 
        {
            url: '/',
            controller: 'AuthCtrl',
            templateUrl: 'html/auth/login.html'
              
        }).state("schedule",
        {
            url: '/schedule',
            
			
			views:{
				
				'':{
					templateUrl: 'html/sched/schedule.html',
					controller: 'SchedCtrl'
				},
				'shifts@schedule': {
					
					templateUrl: 'html/sched/accord.html'
				}
			}
            
        })
		.state("grid",
		{
			abstract: true,
			url:'/grid',
			views: 
			{
				'':{
					templateUrl: 'html/sched/schedule.html',
					
					controller: 'GridCtrl'
				},
				'shifts@grid':{
					templateUrl: 'html/sched/grid.html'
				}
			}
			
		})
		.state('grid.site',
		{
			url: '/:site'		
		})
		.state("logout",
        {
            url: '/logout',
            template: '<h2 ng-init="logout()">Logout</h2>',
			controller: 'AuthCtrl'
        });
				
    }
]);